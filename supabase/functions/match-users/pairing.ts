import { isPastFallbackThreshold, matchScore } from "./scoring.ts";
import type { EnrichedEntry, ExclusionSet, MatchPair } from "./types.ts";
import { pairKey } from "./types.ts";

/**
 * Greedy FIFO pairing with multi-factor scoring.
 *
 * For each unmatched entry (oldest first), scan remaining candidates and pick
 * the highest-scoring partner. A pair is eligible if:
 *   - they are not in the `exclusions` set (blocked / recently paired), AND
 *   - the score is positive (they share signals), OR
 *   - neither has interests set (nothing to match on — random is fine), OR
 *   - either has been waiting past the fallback threshold.
 *
 * Ties resolve FIFO (first candidate encountered wins) because the input is
 * sorted ascending by created_at.
 *
 * This is O(n²) which is fine for realistic queue sizes (< ~200). If the queue
 * ever grows beyond that, switch to bucketed matching (e.g. by region/age).
 */
export function pairUsers(
  entries: EnrichedEntry[],
  exclusions: ExclusionSet = new Set(),
): MatchPair[] {
  const pairs: MatchPair[] = [];
  const matched = new Set<string>();

  entries.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  for (let i = 0; i < entries.length; i++) {
    if (matched.has(entries[i].id)) continue;

    let bestMatch: { entry: EnrichedEntry; score: number } | null = null;

    for (let j = i + 1; j < entries.length; j++) {
      if (matched.has(entries[j].id)) continue;

      // Skip excluded pairs (blocked or within recent-pair cooldown).
      if (
        exclusions.has(pairKey(entries[i].user_id, entries[j].user_id))
      ) {
        continue;
      }

      const score = matchScore(entries[i], entries[j]);
      const bothNoInterests =
        !entries[i].interests.length && !entries[j].interests.length;
      const eitherPastThreshold =
        isPastFallbackThreshold(entries[i].created_at) ||
        isPastFallbackThreshold(entries[j].created_at);

      const eligible = score > 0 || bothNoInterests || eitherPastThreshold;
      if (!eligible) continue;

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { entry: entries[j], score };
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
