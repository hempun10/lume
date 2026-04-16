import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { broadcastMatch } from "./broadcast.ts";
import {
  BROADCAST_RETRY_WINDOW_MS,
  QUEUE_EXPIRY_MS,
} from "./constants.ts";
import type { EnrichedEntry, MatchPair, ProfileData, QueueEntry } from "./types.ts";

/**
 * Mark long-waiting entries as expired. Returns the number of rows affected.
 */
export async function expireStaleEntries(
  supabase: SupabaseClient,
): Promise<number> {
  const cutoff = new Date(Date.now() - QUEUE_EXPIRY_MS).toISOString();
  const { data, error } = await supabase
    .from("match_queue")
    .update({ status: "expired" })
    .eq("status", "waiting")
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    console.error("expireStaleEntries failed:", error);
    return 0;
  }
  return data?.length ?? 0;
}

/**
 * Fetch all `matched` entries in the retry window that haven't been notified
 * yet, and re-broadcast in parallel. Flips `notified = true` on success.
 */
export async function retryUnnotifiedBroadcasts(
  supabase: SupabaseClient,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<number> {
  const since = new Date(Date.now() - BROADCAST_RETRY_WINDOW_MS).toISOString();

  const { data: unnotified, error } = await supabase
    .from("match_queue")
    .select("id, user_id, room_id, matched_with")
    .eq("status", "matched")
    .eq("notified", false)
    .gt("updated_at", since);

  if (error) {
    console.error("retryUnnotifiedBroadcasts fetch failed:", error);
    return 0;
  }
  if (!unnotified?.length) return 0;

  const results = await Promise.all(
    unnotified.map(async (entry) => {
      if (!entry.room_id || !entry.matched_with) return false;
      const ok = await broadcastMatch(
        supabaseUrl,
        serviceRoleKey,
        entry.user_id,
        { room_id: entry.room_id, partner_id: entry.matched_with },
      );
      if (ok) {
        await supabase
          .from("match_queue")
          .update({ notified: true })
          .eq("id", entry.id);
      }
      return ok;
    }),
  );

  return results.filter(Boolean).length;
}

/**
 * Fetch all `waiting` entries and join them with profile data for scoring.
 */
export async function fetchEnrichedWaiting(
  supabase: SupabaseClient,
): Promise<EnrichedEntry[]> {
  const { data: waiting, error } = await supabase
    .from("match_queue")
    .select("id, user_id, interests, status, created_at")
    .eq("status", "waiting")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch queue: ${error.message}`);
  }
  const entries = (waiting ?? []) as QueueEntry[];
  if (!entries.length) return [];

  const userIds = entries.map((e) => e.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, gender, date_of_birth, region")
    .in("id", userIds);

  const profileMap = new Map<string, ProfileData>(
    (profiles ?? []).map((p) => [p.id, p as ProfileData]),
  );

  return entries.map((entry) => ({
    ...entry,
    profile: profileMap.get(entry.user_id) ?? null,
  }));
}

/**
 * Atomically create a room + flip both queue entries via the `match_pair` RPC.
 * Returns the new room id, or null if either user was no longer `waiting`
 * (e.g. cancelled, or matched by a concurrent run).
 */
export async function commitPair(
  supabase: SupabaseClient,
  pair: MatchPair,
): Promise<string | null> {
  const { data, error } = await supabase.rpc("match_pair", {
    _user_a: pair.userA.user_id,
    _user_b: pair.userB.user_id,
  });

  if (error) {
    console.error(
      `match_pair RPC failed for ${pair.userA.user_id} + ${pair.userB.user_id}:`,
      error,
    );
    return null;
  }
  return (data as string | null) ?? null;
}

/**
 * Mark one queue entry as notified. Best-effort, logs on failure.
 */
export async function markNotified(
  supabase: SupabaseClient,
  userId: string,
  roomId: string,
): Promise<void> {
  const { error } = await supabase
    .from("match_queue")
    .update({ notified: true })
    .eq("user_id", userId)
    .eq("room_id", roomId);
  if (error) console.error(`markNotified(${userId}) failed:`, error);
}
