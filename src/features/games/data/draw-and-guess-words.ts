/**
 * Word bank for Draw & Guess. Kept small and drawable — nouns that
 * read at a glance when sketched quickly on a phone canvas.
 *
 * The drawer picks a target word on round start and three plausible
 * decoys to present as multiple-choice options to the guesser. Keep
 * words roughly equivalent in category so picking by elimination
 * isn't trivial.
 */
export const DRAW_AND_GUESS_WORDS: readonly string[] = [
	"apple",
	"banana",
	"pizza",
	"donut",
	"cake",
	"burger",
	"ice cream",
	"sandwich",
	"cat",
	"dog",
	"fish",
	"bird",
	"snake",
	"elephant",
	"lion",
	"butterfly",
	"car",
	"bicycle",
	"airplane",
	"boat",
	"rocket",
	"train",
	"helicopter",
	"bus",
	"house",
	"tree",
	"mountain",
	"beach",
	"castle",
	"bridge",
	"lighthouse",
	"church",
	"sun",
	"moon",
	"star",
	"cloud",
	"rainbow",
	"tornado",
	"snowflake",
	"lightning",
	"guitar",
	"piano",
	"camera",
	"phone",
	"clock",
	"umbrella",
	"glasses",
	"crown",
	"pencil",
	"book",
	"key",
	"scissors",
	"hammer",
	"robot",
	"ghost",
	"dragon",
] as const;

/**
 * Pick one target word + 3 decoys from the bank and return them in
 * shuffled order. The caller keeps the resulting `correctIdx` private
 * until reveal.
 */
export function pickRoundOptions(): {
	options: readonly [string, string, string, string];
	correctIdx: 0 | 1 | 2 | 3;
} {
	const bank = DRAW_AND_GUESS_WORDS;
	// Shuffle copy of bank and take first 4 as options.
	const pool = [...bank];
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const a = pool[i];
		const b = pool[j];
		if (a !== undefined && b !== undefined) {
			pool[i] = b;
			pool[j] = a;
		}
	}
	const four = pool.slice(0, 4) as [string, string, string, string];
	const correctIdx = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
	return { options: four, correctIdx };
}
