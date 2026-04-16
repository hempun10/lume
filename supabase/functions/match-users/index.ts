import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { broadcastMatch } from "./broadcast.ts";
import { HIGH_QUEUE_DEPTH_THRESHOLD } from "./constants.ts";
import { pairUsers } from "./pairing.ts";
import {
  commitPair,
  expireStaleEntries,
  fetchEnrichedWaiting,
  markNotified,
  retryUnnotifiedBroadcasts,
} from "./queue.ts";
import type { RunMetrics } from "./types.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response(
      JSON.stringify({ error: "server_misconfigured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const startTime = Date.now();
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Expire stale waiting entries.
    const expiredCount = await expireStaleEntries(supabase);

    // 2. Retry any matches whose broadcast previously failed (parallel).
    const retryCount = await retryUnnotifiedBroadcasts(
      supabase,
      supabaseUrl,
      serviceRoleKey,
    );

    // 3. Fetch waiting users + their profile data.
    const enriched = await fetchEnrichedWaiting(supabase);
    const queueDepth = enriched.length;
    if (queueDepth > HIGH_QUEUE_DEPTH_THRESHOLD) {
      console.warn(`High queue depth: ${queueDepth}`);
    }

    // 4. Greedy FIFO pairing (pure function, no DB access).
    const pairs = pairUsers(enriched);

    // 5. For each proposed pair, atomically commit via match_pair RPC, then
    //    broadcast. commitPair returns null if either user was already claimed
    //    by a concurrent run — we skip gracefully.
    let pairsMade = 0;
    let pairsSkipped = 0;

    for (const pair of pairs) {
      const roomId = await commitPair(supabase, pair);
      if (!roomId) {
        pairsSkipped++;
        continue;
      }

      const [okA, okB] = await Promise.all([
        broadcastMatch(supabaseUrl, serviceRoleKey, pair.userA.user_id, {
          room_id: roomId,
          partner_id: pair.userB.user_id,
        }),
        broadcastMatch(supabaseUrl, serviceRoleKey, pair.userB.user_id, {
          room_id: roomId,
          partner_id: pair.userA.user_id,
        }),
      ]);

      await Promise.all([
        okA ? markNotified(supabase, pair.userA.user_id, roomId) : null,
        okB ? markNotified(supabase, pair.userB.user_id, roomId) : null,
      ]);

      pairsMade++;
    }

    const metrics: RunMetrics = {
      queueDepth,
      pairsMade,
      pairsSkipped,
      expiredCount,
      retryCount,
      durationMs: Date.now() - startTime,
    };
    console.log("match-users run:", JSON.stringify(metrics));

    return new Response(JSON.stringify(metrics), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("match-users error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
