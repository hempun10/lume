import {
  AGE_PROXIMITY_BUCKETS,
  AGE_PROXIMITY_FALLBACK_SCORE,
  FALLBACK_MATCH_THRESHOLD_MS,
  SCORING_WEIGHTS,
} from "./constants.ts";
import type { EnrichedEntry } from "./types.ts";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/** Normalise an interest tag for case-insensitive comparison. */
function normalizeInterest(tag: string): string {
  return tag.toLowerCase().trim();
}

/** Count how many tags the two users share (case-insensitive). */
export function interestScore(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b.map(normalizeInterest));
  return a.filter((i) => setB.has(normalizeInterest(i))).length;
}

/**
 * Score 0–1 based on how close two users' ages are.
 * Uses `AGE_PROXIMITY_BUCKETS`; returns `AGE_PROXIMITY_FALLBACK_SCORE`
 * for age gaps larger than the biggest bucket.
 */
export function ageProximityScore(
  dobA: string | null,
  dobB: string | null,
): number {
  if (!dobA || !dobB) return 0;
  const ageA = (Date.now() - new Date(dobA).getTime()) / MS_PER_YEAR;
  const ageB = (Date.now() - new Date(dobB).getTime()) / MS_PER_YEAR;
  const diff = Math.abs(ageA - ageB);
  for (const [threshold, score] of AGE_PROXIMITY_BUCKETS) {
    if (diff <= threshold) return score;
  }
  return AGE_PROXIMITY_FALLBACK_SCORE;
}

export function isPastFallbackThreshold(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() > FALLBACK_MATCH_THRESHOLD_MS;
}

/**
 * Multi-factor pairing score.
 *
 * Components (all additive):
 *   - interest overlap × INTEREST_OVERLAP weight (primary signal)
 *   - region match × REGION_MATCH weight
 *   - age proximity (0–1)
 *
 * Note: we intentionally do NOT boost same-gender pairs — gender preference
 * should be an explicit user setting, not a default.
 */
export function matchScore(a: EnrichedEntry, b: EnrichedEntry): number {
  let score = 0;

  score +=
    interestScore(a.interests, b.interests) * SCORING_WEIGHTS.INTEREST_OVERLAP;

  if (
    a.profile?.region &&
    b.profile?.region &&
    a.profile.region === b.profile.region
  ) {
    score += SCORING_WEIGHTS.REGION_MATCH;
  }

  score += ageProximityScore(
    a.profile?.date_of_birth ?? null,
    b.profile?.date_of_birth ?? null,
  );

  return score;
}
