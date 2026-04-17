/**
 * Tunables for the matchmaking loop.
 * Keep all magic numbers here so behavior is easy to reason about and tweak.
 */

/** Entries older than this while still `waiting` get expired. */
export const QUEUE_EXPIRY_MS = 120_000; // 2 minutes

/**
 * A waiting user past this threshold is eligible for any available match,
 * even if they share no interests / signals with the candidate.
 */
export const FALLBACK_MATCH_THRESHOLD_MS = 30_000;

/**
 * How far back to look for `matched` rows that still have `notified = false`,
 * so we can retry their broadcast.
 */
export const BROADCAST_RETRY_WINDOW_MS = 30_000;

/** Log a warning when the waiting queue grows past this size. */
export const HIGH_QUEUE_DEPTH_THRESHOLD = 20;

/**
 * How long before two users who just finished a chat can match again.
 * Keep this in sync with is_recent_pair() in the SQL migration.
 */
export const RECENT_PAIR_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Scoring weights — higher = more influence on match choice.
 * Scores are additive; see `matchScore()` for composition.
 */
export const SCORING_WEIGHTS = {
  /** Points per overlapping interest tag. */
  INTEREST_OVERLAP: 3,
  /** Points when both users share the same region. */
  REGION_MATCH: 2,
} as const;

/**
 * Age-proximity bucket thresholds (in years) → score.
 * Falls off as ages diverge.
 */
export const AGE_PROXIMITY_BUCKETS: ReadonlyArray<[number, number]> = [
  [2, 1.0],
  [5, 0.7],
  [10, 0.4],
];
export const AGE_PROXIMITY_FALLBACK_SCORE = 0.1;
