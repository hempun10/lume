/**
 * Prompt bank for user-authored Two Truths and a Lie. The reader is
 * shown one of these as a suggestion to unstick them — they can use
 * it verbatim, riff on it, or skip it and write their own.
 *
 * Kept short and evocative rather than category-based. The goal is to
 * get a round going in under 30 seconds.
 */
export const TWO_TRUTHS_PROMPTS: readonly string[] = [
	"A weird job you've had",
	"A place you've traveled to",
	"A skill you secretly have",
	"Something embarrassing from childhood",
	"A celebrity you've met (or almost)",
	"A food you've tried that most haven't",
	"A record or competition you've won",
	"A rule you've broken",
	"A scar and its story",
	"A concert or event you attended",
	"A pet you've owned",
	"Something you can do with your body",
	"A near-miss close call",
	"A language or instrument you know",
] as const;

export function suggestPrompt(seed: number): string {
	const i = Math.abs(seed) % TWO_TRUTHS_PROMPTS.length;
	// biome-ignore lint/style/noNonNullAssertion: modulo over nonempty array.
	return TWO_TRUTHS_PROMPTS[i]!;
}
