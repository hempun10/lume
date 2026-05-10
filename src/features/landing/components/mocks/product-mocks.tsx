import { ArrowRight, Gamepad2, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared frame used to present product screenshot-style mocks on the landing
 * page. Mimics a minimal browser chrome so each mock reads as "a view of the
 * product" without needing actual PNG exports.
 */
function MockFrame({
	children,
	className,
	label,
}: {
	children: React.ReactNode;
	className?: string;
	label?: string;
}) {
	return (
		<div
			className={cn(
				"overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
				className,
			)}
		>
			<div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
				<div className="flex gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
					<span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
					<span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
				</div>
				{label ? (
					<p className="ml-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
						{label}
					</p>
				) : null}
			</div>
			{children}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Lobby / match preview (used in hero)
// ---------------------------------------------------------------------------

const HERO_INTERESTS = [
	{ label: "music", active: true },
	{ label: "gaming", active: true },
	{ label: "movies", active: false },
	{ label: "travel", active: true },
	{ label: "coding", active: false },
	{ label: "art", active: false },
];

export function MockLobbyPreview() {
	return (
		<MockFrame label="lume / lobby" className="w-full">
			<div className="flex flex-col gap-6 p-5 sm:p-6">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1.5">
						<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
							Match
						</p>
						<h3 className="font-semibold text-foreground text-lg tracking-tight sm:text-xl">
							Meet someone new
						</h3>
					</div>
					<div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1">
						<span className="size-1.5 rounded-full bg-emerald-500" />
						<span className="font-mono text-[11px] text-foreground tabular-nums">
							1,284
						</span>
						<span className="text-[11px] text-muted-foreground">online</span>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
					<div className="flex items-center justify-center gap-1.5 rounded-lg bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
						<MessageCircle className="size-3.5" />
						Text Chat
					</div>
					<div className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground">
						<Gamepad2 className="size-3.5" />
						Games
					</div>
				</div>

				<div className="space-y-2.5">
					<div className="flex items-center justify-between">
						<p className="text-xs font-medium text-foreground">
							What&rsquo;s the vibe?
						</p>
						<p className="font-mono text-[10px] text-muted-foreground tabular-nums">
							3/5
						</p>
					</div>
					<div className="flex flex-wrap gap-1.5">
						{HERO_INTERESTS.map((chip) => (
							<span
								key={chip.label}
								className={cn(
									"rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
									chip.active
										? "border-foreground bg-foreground text-background"
										: "border-border bg-background text-muted-foreground",
								)}
							>
								{chip.label}
							</span>
						))}
					</div>
				</div>

				<div className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
					Start matching
					<ArrowRight className="size-3.5" />
				</div>
			</div>
		</MockFrame>
	);
}

// ---------------------------------------------------------------------------
// Chat preview (used in Features / Text Chat block)
// ---------------------------------------------------------------------------

type ChatLine =
	| { from: "them"; text: string }
	| { from: "me"; text: string }
	| { from: "typing" };

const CHAT_SCRIPT: ChatLine[] = [
	{ from: "them", text: "hey! saw we both put music 🎧" },
	{ from: "me", text: "yes! what have you been listening to lately?" },
	{
		from: "them",
		text: "mostly old radiohead. in rainbows on loop tbh",
	},
	{ from: "me", text: "okay instantly a good sign" },
	{ from: "typing" },
];

export function MockChatPreview() {
	return (
		<MockFrame label="lume / chat" className="w-full">
			<div className="flex items-center justify-between border-b border-border bg-background px-4 py-2.5">
				<div className="flex items-center gap-2.5">
					<div className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
						S
					</div>
					<div className="space-y-0.5">
						<p className="text-xs font-semibold text-foreground">Stranger</p>
						<p className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
							<span className="size-1.5 rounded-full bg-emerald-500" />
							connected
						</p>
					</div>
				</div>
				<span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
					esc to skip
				</span>
			</div>

			<div className="flex flex-col gap-2.5 bg-background px-4 py-4 sm:px-5">
				{CHAT_SCRIPT.map((line, i) => {
					if (line.from === "typing") {
						return (
							<div key="typing" className="flex justify-start">
								<div className="rounded-2xl rounded-bl-md bg-muted px-3.5 py-2">
									<div className="flex gap-1">
										<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
										<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
										<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
									</div>
								</div>
							</div>
						);
					}
					const isMe = line.from === "me";
					return (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: static mock script, order never changes
							key={i}
							className={cn("flex", isMe ? "justify-end" : "justify-start")}
						>
							<div
								className={cn(
									"max-w-[80%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm",
									isMe
										? "rounded-br-md bg-primary text-primary-foreground"
										: "rounded-bl-md bg-muted text-foreground",
								)}
							>
								{line.text}
							</div>
						</div>
					);
				})}
			</div>
		</MockFrame>
	);
}

// ---------------------------------------------------------------------------
// Tic-tac-toe preview (used in Features / Games block)
// ---------------------------------------------------------------------------

type Cell = "x" | "o" | null;
const BOARD: Cell[] = ["x", "o", "x", null, "x", "o", "o", null, "x"];
const WINNING_LINE = [0, 4, 8];

export function MockTicTacToePreview() {
	return (
		<MockFrame label="lume / game" className="w-full">
			<div className="flex flex-col gap-5 bg-background p-5 sm:p-6">
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
							Tic Tac Toe
						</p>
						<p className="text-sm font-semibold text-foreground">
							You won — nice one
						</p>
					</div>
					<div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
						<Sparkles className="size-3 text-emerald-600" />
						<span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
							Rematch?
						</span>
					</div>
				</div>

				<div className="mx-auto grid w-full max-w-[220px] grid-cols-3 gap-1.5">
					{BOARD.map((cell, idx) => {
						const isWinning = WINNING_LINE.includes(idx);
						return (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: fixed static grid
								key={idx}
								className={cn(
									"flex aspect-square items-center justify-center rounded-lg border text-xl font-semibold transition-colors",
									isWinning
										? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600"
										: cell
											? "border-border bg-muted/50 text-foreground"
											: "border-border bg-background text-muted-foreground",
								)}
							>
								{cell?.toUpperCase() ?? ""}
							</div>
						);
					})}
				</div>

				<div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
					<div className="flex items-center gap-2">
						<span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
							X
						</span>
						<span className="text-[11px] text-muted-foreground">you</span>
					</div>
					<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
						2 — 0
					</span>
					<div className="flex items-center gap-2">
						<span className="text-[11px] text-muted-foreground">stranger</span>
						<span className="flex size-5 items-center justify-center rounded-full border border-border text-[10px] font-semibold text-foreground">
							O
						</span>
					</div>
				</div>
			</div>
		</MockFrame>
	);
}

// ---------------------------------------------------------------------------
// Match found preview (used in How It Works)
// ---------------------------------------------------------------------------

export function MockMatchFoundPreview() {
	return (
		<MockFrame label="matching" className="w-full">
			<div className="flex flex-col items-center gap-4 bg-background px-6 py-7 text-center">
				<div className="relative">
					<div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
					<div className="relative flex size-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
						<Sparkles className="size-6 text-primary" />
					</div>
				</div>
				<div className="space-y-1">
					<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
						Match found
					</p>
					<p className="text-sm font-semibold text-foreground">
						Say hi to your stranger
					</p>
					<p className="text-xs text-muted-foreground">
						shared interests: music, gaming, travel
					</p>
				</div>
				<div className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
					Open chat
					<ArrowRight className="size-3" />
				</div>
			</div>
		</MockFrame>
	);
}
