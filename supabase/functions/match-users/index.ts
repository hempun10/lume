import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface QueueEntry {
  id: string;
  user_id: string;
  mode: string;
  interests: string[];
  status: string;
  created_at: string;
}

interface MatchPair {
  userA: QueueEntry;
  userB: QueueEntry;
  score: number;
}

/**
 * Calculate interest overlap score between two users.
 * Higher score = more shared interests.
 */
function interestScore(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  return a.filter((i) => setB.has(i)).length;
}

/**
 * Check if a user has been waiting long enough to fall back to any match.
 * After 30 seconds, match with anyone in the same mode.
 */
function isPastFallbackThreshold(
  createdAt: string,
  thresholdMs = 30_000,
): boolean {
  return Date.now() - new Date(createdAt).getTime() > thresholdMs;
}

/**
 * Pair waiting users by mode and interest overlap.
 * Returns an array of matched pairs.
 */
function pairUsers(entries: QueueEntry[]): MatchPair[] {
  const byMode: Record<string, QueueEntry[]> = {};
  for (const entry of entries) {
    (byMode[entry.mode] ??= []).push(entry);
  }

  const pairs: MatchPair[] = [];

  for (const modeEntries of Object.values(byMode)) {
    const matched = new Set<string>();

    // Sort by created_at (FIFO) so older entries get priority
    modeEntries.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    for (let i = 0; i < modeEntries.length; i++) {
      if (matched.has(modeEntries[i].id)) continue;

      let bestMatch: { entry: QueueEntry; score: number } | null = null;

      for (let j = i + 1; j < modeEntries.length; j++) {
        if (matched.has(modeEntries[j].id)) continue;

        const score = interestScore(
          modeEntries[i].interests,
          modeEntries[j].interests,
        );
        const bothNoInterests =
          !modeEntries[i].interests.length && !modeEntries[j].interests.length;
        const eitherPastThreshold =
          isPastFallbackThreshold(modeEntries[i].created_at) ||
          isPastFallbackThreshold(modeEntries[j].created_at);

        // Match if they share interests, both have no interests, or either waited past threshold
        if (score > 0 || bothNoInterests || eitherPastThreshold) {
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { entry: modeEntries[j], score };
          }
        }
      }

      if (bestMatch) {
        matched.add(modeEntries[i].id);
        matched.add(bestMatch.entry.id);
        pairs.push({
          userA: modeEntries[i],
          userB: bestMatch.entry,
          score: bestMatch.score,
        });
      }
    }
  }

  return pairs;
}

/**
 * Broadcast a match notification to a user's personal channel via REST API.
 */
async function broadcastMatch(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  payload: { room_id: string; partner_id: string },
): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            topic: `match:${userId}`,
            event: "matched",
            payload,
          },
        ],
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`Broadcast to ${userId} failed: status=${res.status} body=${text}`);
    }
    return res.ok;
  } catch (err) {
    console.error(`Broadcast to ${userId} failed:`, err);
    return false;
  }
}

Deno.serve(async (req) => {
  // Only allow POST (from pg_cron or manual invocation)
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Note: Advisory lock (pg_advisory_xact_lock) is not available via supabase-js RPC.
    // We rely on pg_cron not overlapping (2s interval with fast execution < 1s).

    // 1. Expire stale entries (waiting > 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 120_000).toISOString();
    const { data: expired } = await supabase
      .from("match_queue")
      .update({ status: "expired" })
      .eq("status", "waiting")
      .lt("created_at", twoMinutesAgo)
      .select("id");

    const expiredCount = expired?.length ?? 0;

    // 2. Retry failed broadcast notifications
    const thirtySecondsAgo = new Date(Date.now() - 30_000).toISOString();
    const { data: unnotified } = await supabase
      .from("match_queue")
      .select("id, user_id, room_id, matched_with")
      .eq("status", "matched")
      .eq("notified", false)
      .gt("updated_at", thirtySecondsAgo);

    let retryCount = 0;
    if (unnotified?.length) {
      for (const entry of unnotified) {
        if (!entry.room_id || !entry.matched_with) continue;
        const ok = await broadcastMatch(
          supabaseUrl,
          serviceRoleKey,
          entry.user_id,
          {
            room_id: entry.room_id,
            partner_id: entry.matched_with,
          },
        );
        if (ok) {
          await supabase
            .from("match_queue")
            .update({ notified: true })
            .eq("id", entry.id);
          retryCount++;
        }
      }
    }

    // 3. Fetch all waiting entries
    const { data: waiting, error: fetchError } = await supabase
      .from("match_queue")
      .select("id, user_id, mode, interests, status, created_at")
      .eq("status", "waiting")
      .order("created_at", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch queue: ${fetchError.message}`);
    }

    const queueDepth = waiting?.length ?? 0;

    if (queueDepth > 20) {
      console.warn(`High queue depth: ${queueDepth}`);
    }

    // 4. Pair users
    const pairs = pairUsers(waiting ?? []);

    // 5. Process each pair: create room, update queue, broadcast
    let pairsMade = 0;
    for (const pair of pairs) {
      const roomType = pair.userA.mode === "games" ? "game" : "chat";

      // Create room
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert({
          type: roomType,
          user_a: pair.userA.user_id,
          user_b: pair.userB.user_id,
          status: "active",
        })
        .select("id")
        .single();

      if (roomError || !room) {
        console.error(
          `Failed to create room for ${pair.userA.user_id} + ${pair.userB.user_id}:`,
          roomError,
        );
        continue;
      }

      // Update both queue entries
      const { error: updateError } = await supabase
        .from("match_queue")
        .update({
          status: "matched",
          matched_with: pair.userB.user_id,
          room_id: room.id,
        })
        .eq("id", pair.userA.id);

      if (updateError) {
        console.error(
          `Failed to update queue for userA ${pair.userA.user_id}:`,
          updateError,
        );
        continue;
      }

      await supabase
        .from("match_queue")
        .update({
          status: "matched",
          matched_with: pair.userA.user_id,
          room_id: room.id,
        })
        .eq("id", pair.userB.id);

      // Broadcast to both users
      const [okA, okB] = await Promise.all([
        broadcastMatch(supabaseUrl, serviceRoleKey, pair.userA.user_id, {
          room_id: room.id,
          partner_id: pair.userB.user_id,
        }),
        broadcastMatch(supabaseUrl, serviceRoleKey, pair.userB.user_id, {
          room_id: room.id,
          partner_id: pair.userA.user_id,
        }),
      ]);

      // Mark as notified if broadcast succeeded
      if (okA) {
        await supabase
          .from("match_queue")
          .update({ notified: true })
          .eq("id", pair.userA.id);
      }
      if (okB) {
        await supabase
          .from("match_queue")
          .update({ notified: true })
          .eq("id", pair.userB.id);
      }

      pairsMade++;
    }

    const durationMs = Date.now() - startTime;
    const metrics = {
      queueDepth,
      pairsMade,
      expiredCount,
      retryCount,
      durationMs,
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
