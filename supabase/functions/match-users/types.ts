export interface QueueEntry {
  id: string;
  user_id: string;
  interests: string[];
  status: string;
  created_at: string;
}

export interface ProfileData {
  id: string;
  gender: string | null;
  date_of_birth: string | null;
  region: string | null;
}

export interface EnrichedEntry extends QueueEntry {
  profile: ProfileData | null;
}

export interface MatchPair {
  userA: EnrichedEntry;
  userB: EnrichedEntry;
  score: number;
}

export interface BroadcastPayload {
  room_id: string;
  partner_id: string;
}

export interface RunMetrics {
  queueDepth: number;
  pairsMade: number;
  pairsSkipped: number;
  expiredCount: number;
  retryCount: number;
  durationMs: number;
}

/**
 * Pairs of user ids that must never be matched this run, either because
 * one blocked the other or because they paired in the last 30 min.
 *
 * Keys are canonical `"${min(a,b)}|${max(a,b)}"` strings so membership
 * checks are O(1) and order-independent.
 */
export type ExclusionSet = Set<string>;

export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}
