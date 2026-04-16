import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface QueueEntry {
  id: string;
  user_id: string;
  interests: string[];
  status: string;
  created_at: string;
}

interface ProfileData {
  id: string;
  gender: string | null;
  date_of_birth: string | null;
  region: string | null;
}

interface EnrichedEntry extends QueueEntry {
  profile: ProfileData | null;
}

interface MatchPair {
  userA: EnrichedEntry;
  userB: EnrichedEntry;
  score: number;
}

/**
 * Calculate interest overlap score between two users.
 */
function interestScore(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  return a.filter((i) => setB.has(i)).length;
}

/**
 * Calculate age proximity score (0-1) based on date of birth.
 * Closer ages get higher scores. Within 2 years = 1.0, decays after.
 */
function ageProximityScore(dobA: string | null, dobB: string | null): number {
  if (!dobA || !dobB) return 0;
  const ageA = (Date.now() - new Date(dobA).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const ageB = (Date.now() - new Date(dobB).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const diff = Math.abs(ageA - ageB);
  if (diff <= 2) return 1;
  if (diff <= 5) return 0.7;
  if (diff <= 10) return 0.4;
  return 0.1;
}

/**
 * Check if a user has been waiting long enough to fall back to any match.
 */
function isPastFallbackThreshold(
  createdAt: string,
  thresholdMs = 30_000,
): boolean {
  return Date.now() - new Date(createdAt).getTime() > thresholdMs;
}

/**
 * Multi-factor match scoring.
 *
 * Weights:
 * - Interest overlap: x3 (primary signal)
 * - Gender match: x2
 * - Region match: x2
 * - Age proximity: x1
 */
function matchScore(a: EnrichedEntry, b: EnrichedEntry): number {
  let score = 0;

  // Interest overlap (0-N, each overlap = 3 points)
  score += interestScore(a.interests, b.interests) * 3;

  // Gender match (2 points if same gender)
  if (a.profile?.gender && b.profile?.gender && a.profile.gender === b.profile.gender) {
    score += 2;
  }

  // Region match (2 points if same region)
  if (a.profile?.region && b.profile?.region && a.profile.region === b.profile.region) {
    score += 2;
  }

  // Age proximity (0-1 points)
  score += ageProximityScore(a.profile?.date_of_birth ?? null, b.profile?.date_of_birth ?? null);

  return score;
}

/**
 * Pair waiting users using multi-factor scoring.
 * No mode grouping — all users are in a single pool.
 */
function pairUsers(entries: EnrichedEntry[]): MatchPair[] {
  const pairs: MatchPair[] = [];
  const matched = new Set<string>();

  // Sort by created_at (FIFO) so older entries get priority
  entries.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  for (let i = 0; i < entries.length; i++) {
    if (matched.has(entries[i].id)) continue;

    let bestMatch: { entry: EnrichedEntry; score: number } | null = null;

    for (let j = i + 1; j < entries.length; j++) {
      if (matched.has(entries[j].id)) continue;

      const score = matchScore(entries[i], entries[j]);
      const bothNoInterests =
        !entries[i].interests.length && !entries[j].interests.length;
      const eitherPastThreshold =
        isPastFallbackThreshold(entries[i].created_at) ||
        isPastFallbackThreshold(entries[j].created_at);

      // Match if they have any positive score, both have no interests, or either waited past threshold
      if (score > 0 || bothNoInterests || eitherPastThreshold) {
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { entry: entries[j], score };
        }
      }
    }

    if (bestMatch) {
      matched.add(entries[i].id);
      matched.add(bestMatch.entry.id);
      pairs.push({
        userA: entries[i],
        userB: bestMatch.entry,
        score: bestMatch.score,
      });
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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
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
      .select("id, user_id, interests, status, created_at")
      .eq("status", "waiting")
      .order("created_at", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch queue: ${fetchError.message}`);
    }

    const queueDepth = waiting?.length ?? 0;

    if (queueDepth > 20) {
      console.warn(`High queue depth: ${queueDepth}`);
    }

    // 4. Enrich entries with profile data for multi-factor scoring
    const userIds = (waiting ?? []).map((e) => e.user_id);
    let profileMap: Map<string, ProfileData> = new Map();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, gender, date_of_birth, region")
        .in("id", userIds);

      if (profiles) {
        profileMap = new Map(profiles.map((p) => [p.id, p]));
      }
    }

    const enrichedEntries: EnrichedEntry[] = (waiting ?? []).map((entry) => ({
      ...entry,
      profile: profileMap.get(entry.user_id) ?? null,
    }));

    // 5. Pair users with multi-factor scoring
    const pairs = pairUsers(enrichedEntries);

    // 6. Process each pair: create room, update queue, broadcast
    let pairsMade = 0;
    for (const pair of pairs) {
      // All rooms are chat rooms now (games are a feature within chat)
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert({
          type: "chat",
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
