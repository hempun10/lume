import type { DrawAndGuessDifficulty } from "../data/draw-and-guess-words";

export const CANVAS_SIZE = 300;

export const COLORS = [
	"#111827",
	"#ef4444",
	"#f59e0b",
	"#10b981",
	"#3b82f6",
	"#a855f7",
] as const;

export const BRUSH_SIZES = [3, 6, 12] as const;

export const STROKE_BATCH_MS = 50;

export const WORD_REVEAL_MS = 2000;

export const DIFFICULTY_TIERS: {
	id: DrawAndGuessDifficulty;
	label: string;
	blurb: string;
}[] = [
	{ id: "easy", label: "Easy", blurb: "Everyday objects" },
	{ id: "medium", label: "Medium", blurb: "Same-category siblings" },
	{ id: "hard", label: "Hard", blurb: "Abstract + compound" },
];
