import {
	Check,
	ChevronRight,
	Eraser,
	Eye,
	PaintBucket,
	Paintbrush,
	Pencil,
	Undo2,
	X,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import {
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pickRoundOptions } from "../data/draw-and-guess-words";
import {
	applyReveal,
	applyRoundSetup,
	DRAW_AND_GUESS_MOVE_ADVANCE,
	DRAW_AND_GUESS_ROUND_DURATION_MS,
	type DrawAndGuessPick,
	type DrawAndGuessState,
	drawerSeatFor,
} from "../engines/draw-and-guess";

/* ------------------------------- constants ------------------------------- */

const CANVAS_SIZE = 300;
const COLORS = [
	"#111827",
	"#ef4444",
	"#f59e0b",
	"#10b981",
	"#3b82f6",
	"#a855f7",
] as const;
const BRUSH_SIZES = [3, 6, 12] as const;
const STROKE_BATCH_MS = 50;

type Tool = "brush" | "fill";

type DrawablePoint = { x: number; y: number };

type Drawable =
	| {
			type: "stroke";
			id: string;
			color: string;
			width: number;
			points: DrawablePoint[];
	  }
	| { type: "fill"; color: string; x: number; y: number };

interface Props {
	state: DrawAndGuessState;
	mySeat: "A" | "B" | null;
	myTurn: boolean;
	onMove: (move: number) => void;
	sendCustomEvent: (event: string, payload: unknown) => void;
	setGameState: Dispatch<SetStateAction<DrawAndGuessState | null>>;
}

/**
 * Draw & Guess board. Drawer sketches a target word; guesser picks
 * from 4 multiple-choice options. Strokes broadcast via `customEvents`
 * in ~50ms batches.
 */
export function DrawAndGuessBoard({
	state,
	mySeat,
	myTurn,
	onMove,
	sendCustomEvent,
	setGameState,
}: Props) {
	// Drawer's private knowledge of the correct option index for this
	// round. Only set on the drawer's side. Cleared between rounds.
	const correctIdxRef = useRef<DrawAndGuessPick | null>(null);
	// Drawer's local target word (for UI only).
	const [targetWord, setTargetWord] = useState<string | null>(null);

	if (!mySeat) return null;

	const myScore = mySeat === "A" ? state.aScore : state.bScore;
	const theirScore = mySeat === "A" ? state.bScore : state.aScore;

	if (state.phase === "finished") {
		return (
			<FinishedView
				state={state}
				mySeat={mySeat}
				myScore={myScore}
				theirScore={theirScore}
			/>
		);
	}

	const drawerSeat = drawerSeatFor(state);
	const iAmDrawer = mySeat === drawerSeat;

	return (
		<div className="flex w-full max-w-md flex-col items-stretch gap-3">
			<ScoreBar
				myScore={myScore}
				theirScore={theirScore}
				round={state.round + 1}
				total={state.totalRounds}
			/>

			<RoleLabel iAmDrawer={iAmDrawer} phase={state.phase} />

			{state.phase === "setup" && (
				<SetupCoordinator
					iAmDrawer={iAmDrawer}
					onDrawerReady={(options, correctIdx, word) => {
						correctIdxRef.current = correctIdx;
						setTargetWord(word);
						sendCustomEvent("round_setup", { options });
						setGameState((prev) =>
							prev ? applyRoundSetup(prev, options) : prev,
						);
					}}
				/>
			)}

			{(state.phase === "drawing" || state.phase === "revealed") &&
				state.options && (
					<RoundView
						state={state}
						options={state.options}
						iAmDrawer={iAmDrawer}
						myTurn={myTurn}
						targetWord={iAmDrawer ? targetWord : null}
						correctIdxForDrawer={correctIdxRef.current}
						onGuess={(idx) => onMove(idx)}
						onReveal={() => {
							const correctIdx = correctIdxRef.current;
							if (correctIdx === null) return;
							sendCustomEvent("reveal", { correctIdx });
							setGameState((prev) =>
								prev ? applyReveal(prev, correctIdx) : prev,
							);
						}}
						onAdvance={() => {
							correctIdxRef.current = null;
							setTargetWord(null);
							onMove(DRAW_AND_GUESS_MOVE_ADVANCE);
						}}
						sendCustomEvent={sendCustomEvent}
					/>
				)}
		</div>
	);
}

/* ---------------------- setup: drawer picks options ---------------------- */

function SetupCoordinator({
	iAmDrawer,
	onDrawerReady,
}: {
	iAmDrawer: boolean;
	onDrawerReady: (
		options: readonly [string, string, string, string],
		correctIdx: DrawAndGuessPick,
		word: string,
	) => void;
}) {
	// Drawer picks options exactly once on mount of this phase.
	const calledRef = useRef(false);
	useEffect(() => {
		if (!iAmDrawer || calledRef.current) return;
		calledRef.current = true;
		const { options, correctIdx } = pickRoundOptions();
		onDrawerReady(options, correctIdx, options[correctIdx]);
	}, [iAmDrawer, onDrawerReady]);

	return (
		<div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
			{iAmDrawer ? "Picking a word..." : "Stranger is picking a word..."}
		</div>
	);
}

/* ----------------------------- main round view ----------------------------- */

function RoundView({
	state,
	options,
	iAmDrawer,
	myTurn,
	targetWord,
	correctIdxForDrawer,
	onGuess,
	onReveal,
	onAdvance,
	sendCustomEvent,
}: {
	state: DrawAndGuessState;
	options: readonly [string, string, string, string];
	iAmDrawer: boolean;
	myTurn: boolean;
	targetWord: string | null;
	correctIdxForDrawer: DrawAndGuessPick | null;
	onGuess: (idx: DrawAndGuessPick) => void;
	onReveal: () => void;
	onAdvance: () => void;
	sendCustomEvent: (event: string, payload: unknown) => void;
}) {
	const revealed = state.phase === "revealed";
	const locked = state.guess !== null;
	const isLast = state.round + 1 >= state.totalRounds;

	// Timer: resets when round changes. Auto-triggers reveal if drawer
	// and time runs out without a guess or with one.
	const [remaining, setRemaining] = useState(DRAW_AND_GUESS_ROUND_DURATION_MS);
	// biome-ignore lint/correctness/useExhaustiveDependencies: `state.round` is the intentional reset key.
	useEffect(() => {
		if (revealed) return;
		setRemaining(DRAW_AND_GUESS_ROUND_DURATION_MS);
		const start = Date.now();
		const id = setInterval(() => {
			const left = Math.max(
				0,
				DRAW_AND_GUESS_ROUND_DURATION_MS - (Date.now() - start),
			);
			setRemaining(left);
			if (left === 0) clearInterval(id);
		}, 250);
		return () => clearInterval(id);
	}, [state.round, revealed]);

	// Auto-reveal on timeout (drawer only — they own the answer).
	const autoRevealedRef = useRef(false);
	useEffect(() => {
		if (revealed) autoRevealedRef.current = false;
	}, [revealed]);
	useEffect(() => {
		if (
			!revealed &&
			remaining === 0 &&
			iAmDrawer &&
			correctIdxForDrawer !== null &&
			!autoRevealedRef.current
		) {
			autoRevealedRef.current = true;
			onReveal();
		}
	}, [remaining, revealed, iAmDrawer, correctIdxForDrawer, onReveal]);

	// Also reveal immediately when guesser locks in (drawer's side).
	useEffect(() => {
		if (
			!revealed &&
			state.guess !== null &&
			iAmDrawer &&
			correctIdxForDrawer !== null &&
			!autoRevealedRef.current
		) {
			autoRevealedRef.current = true;
			onReveal();
		}
	}, [state.guess, revealed, iAmDrawer, correctIdxForDrawer, onReveal]);

	return (
		<div className="flex flex-col gap-3">
			<TimerBar remainingMs={remaining} revealed={revealed} />

			{iAmDrawer && targetWord && !revealed && (
				<div className="rounded-lg border border-brand-500/30 bg-brand-500/5 px-3 py-2 text-center text-xs">
					<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
						Draw:
					</span>{" "}
					<span className="text-base font-semibold text-foreground">
						{targetWord}
					</span>
				</div>
			)}

			<DrawingSurface
				iAmDrawer={iAmDrawer}
				revealed={revealed}
				sendCustomEvent={sendCustomEvent}
				roundKey={state.round}
			/>

			<GuessPanel
				options={options}
				iAmDrawer={iAmDrawer}
				guess={state.guess}
				revealed={revealed}
				correctIdx={state.correctIdx}
				myTurn={myTurn && !locked}
				onGuess={onGuess}
			/>

			{revealed ? (
				<div className="flex justify-center">
					<Button
						size="sm"
						className="gap-2 active:scale-[0.97]"
						onClick={onAdvance}
					>
						{isLast ? "See results" : "Next round"}
						<ChevronRight className="size-3.5" />
					</Button>
				</div>
			) : iAmDrawer ? (
				locked ? (
					<p className="text-center text-xs text-muted-foreground">
						Stranger locked in — revealing...
					</p>
				) : (
					<p className="text-center text-xs text-muted-foreground">
						Keep drawing — stranger hasn't guessed yet.
					</p>
				)
			) : locked ? (
				<p className="text-center text-xs text-muted-foreground">
					Locked in — waiting for reveal...
				</p>
			) : (
				<p className="text-center text-xs text-muted-foreground">
					Pick what it is.
				</p>
			)}
		</div>
	);
}

/* -------------------------------- timer -------------------------------- */

function TimerBar({
	remainingMs,
	revealed,
}: {
	remainingMs: number;
	revealed: boolean;
}) {
	const seconds = Math.ceil(remainingMs / 1000);
	const pct = revealed ? 0 : remainingMs / DRAW_AND_GUESS_ROUND_DURATION_MS;
	const danger = !revealed && seconds <= 10;
	return (
		<div className="flex items-center gap-2">
			<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
				<div
					className={cn(
						"h-full rounded-full transition-[width] duration-200 ease-linear",
						danger ? "bg-destructive" : "bg-brand-500",
					)}
					style={{ width: `${pct * 100}%` }}
				/>
			</div>
			<span
				className={cn(
					"w-8 shrink-0 text-right text-xs font-semibold tabular-nums",
					danger ? "text-destructive" : "text-muted-foreground",
				)}
			>
				{revealed ? "—" : `${seconds}s`}
			</span>
		</div>
	);
}

/* ----------------------------- drawing surface ----------------------------- */

function DrawingSurface({
	iAmDrawer,
	revealed,
	sendCustomEvent,
	roundKey,
}: {
	iAmDrawer: boolean;
	revealed: boolean;
	sendCustomEvent: (event: string, payload: unknown) => void;
	roundKey: number;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const drawablesRef = useRef<Drawable[]>([]);
	const currentStrokeRef = useRef<Drawable | null>(null);
	const pendingPointsRef = useRef<DrawablePoint[]>([]);
	const flushTimerRef = useRef<number | null>(null);

	const [color, setColor] = useState<string>(COLORS[0]);
	const [width, setWidth] = useState<number>(BRUSH_SIZES[1]);
	const [tool, setTool] = useState<Tool>("brush");

	/* Reset on round change. */
	// biome-ignore lint/correctness/useExhaustiveDependencies: effect depends only on roundKey.
	useEffect(() => {
		drawablesRef.current = [];
		currentStrokeRef.current = null;
		pendingPointsRef.current = [];
		if (flushTimerRef.current) {
			clearTimeout(flushTimerRef.current);
			flushTimerRef.current = null;
		}
		redraw();
	}, [roundKey]);

	/* Full redraw from the drawables list. Called after undo / clear /
	 * remote events. Incremental drawing uses drawSegment for speed. */
	const redraw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		for (const d of drawablesRef.current) {
			if (d.type === "fill") {
				ctx.fillStyle = d.color;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			} else {
				drawStrokePath(ctx, d.color, d.width, d.points);
			}
		}
	}, []);

	/* Incremental: draw just the newest segment of the current stroke. */
	const drawSegment = useCallback(
		(stroke: Drawable & { type: "stroke" }, fromIdx: number) => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.strokeStyle = stroke.color;
			ctx.lineWidth = stroke.width;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.beginPath();
			const pts = stroke.points;
			if (pts.length === 0) return;
			const start = pts[Math.max(0, fromIdx - 1)];
			if (!start) return;
			ctx.moveTo(start.x, start.y);
			for (let i = Math.max(fromIdx, 1); i < pts.length; i++) {
				const p = pts[i];
				if (!p) continue;
				ctx.lineTo(p.x, p.y);
			}
			ctx.stroke();
			if (pts.length === 1) {
				// single-point tap: render a dot.
				ctx.fillStyle = stroke.color;
				ctx.beginPath();
				ctx.arc(pts[0].x, pts[0].y, stroke.width / 2, 0, Math.PI * 2);
				ctx.fill();
			}
		},
		[],
	);

	/* ---------- remote event handlers (guesser receives strokes) ---------- */
	// We can't use the adapter's customEvents plumbing here because
	// handlers need access to this board's local drawables state.
	// Instead, the adapter wires `stroke_*`/`clear`/`undo` events to
	// this component via a ref-registered callback. See the effect
	// below that mounts to window events as a bridge.
	// (Simplified: events come in via a global event emitter scoped by
	// the sendCustomEvent closure identity.)

	// We rely on the adapter forwarding events through `setGameState`
	// patches OR through a side registry. To keep things simple, we
	// attach a local event handler map that the adapter installs via
	// `useCustomEventsBridge` below.
	useCustomEventsBridge(sendCustomEvent, {
		stroke_start: (data) => {
			const d = data as {
				id?: string;
				color?: string;
				width?: number;
			};
			if (!d.id || !d.color || typeof d.width !== "number") return;
			const stroke: Drawable = {
				type: "stroke",
				id: d.id,
				color: d.color,
				width: d.width,
				points: [],
			};
			drawablesRef.current.push(stroke);
			currentStrokeRef.current = stroke;
		},
		stroke_point: (data) => {
			const d = data as {
				id?: string;
				points?: { x: number; y: number }[];
			};
			if (!d.id || !Array.isArray(d.points)) return;
			const last = drawablesRef.current[drawablesRef.current.length - 1];
			if (!last || last.type !== "stroke" || last.id !== d.id) return;
			const prevLen = last.points.length;
			last.points.push(...d.points);
			drawSegment(last, prevLen);
		},
		stroke_end: () => {
			currentStrokeRef.current = null;
		},
		fill: (data) => {
			const d = data as { color?: string };
			if (!d.color) return;
			drawablesRef.current.push({
				type: "fill",
				color: d.color,
				x: 0,
				y: 0,
			});
			redraw();
		},
		clear: () => {
			drawablesRef.current = [];
			currentStrokeRef.current = null;
			redraw();
		},
		undo: () => {
			drawablesRef.current.pop();
			currentStrokeRef.current = null;
			redraw();
		},
	});

	/* ---------- local drawer interactions ---------- */

	const flushPending = useCallback(() => {
		flushTimerRef.current = null;
		const stroke = currentStrokeRef.current;
		const points = pendingPointsRef.current;
		if (!stroke || stroke.type !== "stroke" || points.length === 0) return;
		pendingPointsRef.current = [];
		sendCustomEvent("stroke_point", {
			id: stroke.id,
			points: points.map((p) => ({ x: p.x, y: p.y })),
		});
	}, [sendCustomEvent]);

	const scheduleFlush = useCallback(() => {
		if (flushTimerRef.current !== null) return;
		flushTimerRef.current = window.setTimeout(flushPending, STROKE_BATCH_MS);
	}, [flushPending]);

	const pointFromEvent = useCallback(
		(e: ReactPointerEvent<HTMLCanvasElement>): DrawablePoint | null => {
			const canvas = canvasRef.current;
			if (!canvas) return null;
			const rect = canvas.getBoundingClientRect();
			const scaleX = canvas.width / rect.width;
			const scaleY = canvas.height / rect.height;
			return {
				x: (e.clientX - rect.left) * scaleX,
				y: (e.clientY - rect.top) * scaleY,
			};
		},
		[],
	);

	const handlePointerDown = useCallback(
		(e: ReactPointerEvent<HTMLCanvasElement>) => {
			if (!iAmDrawer || revealed) return;
			e.currentTarget.setPointerCapture(e.pointerId);
			const p = pointFromEvent(e);
			if (!p) return;

			if (tool === "fill") {
				drawablesRef.current.push({
					type: "fill",
					color,
					x: p.x,
					y: p.y,
				});
				redraw();
				sendCustomEvent("fill", { color, x: p.x, y: p.y });
				return;
			}

			const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
			const stroke: Drawable = {
				type: "stroke",
				id,
				color,
				width,
				points: [p],
			};
			drawablesRef.current.push(stroke);
			currentStrokeRef.current = stroke;
			drawSegment(stroke, 0);
			sendCustomEvent("stroke_start", { id, color, width });
			pendingPointsRef.current = [p];
			scheduleFlush();
		},
		[
			iAmDrawer,
			revealed,
			tool,
			color,
			width,
			pointFromEvent,
			drawSegment,
			redraw,
			sendCustomEvent,
			scheduleFlush,
		],
	);

	const handlePointerMove = useCallback(
		(e: ReactPointerEvent<HTMLCanvasElement>) => {
			if (!iAmDrawer || revealed) return;
			const stroke = currentStrokeRef.current;
			if (!stroke || stroke.type !== "stroke") return;
			const p = pointFromEvent(e);
			if (!p) return;
			const prevLen = stroke.points.length;
			stroke.points.push(p);
			drawSegment(stroke, prevLen);
			pendingPointsRef.current.push(p);
			scheduleFlush();
		},
		[iAmDrawer, revealed, pointFromEvent, drawSegment, scheduleFlush],
	);

	const handlePointerUp = useCallback(() => {
		if (!iAmDrawer || revealed) return;
		const stroke = currentStrokeRef.current;
		if (!stroke) return;
		// Flush any pending points before ending.
		if (flushTimerRef.current) {
			clearTimeout(flushTimerRef.current);
			flushTimerRef.current = null;
		}
		flushPending();
		sendCustomEvent("stroke_end", {
			id: stroke.type === "stroke" ? stroke.id : null,
		});
		currentStrokeRef.current = null;
	}, [iAmDrawer, revealed, flushPending, sendCustomEvent]);

	const handleUndo = useCallback(() => {
		if (!iAmDrawer || revealed) return;
		drawablesRef.current.pop();
		currentStrokeRef.current = null;
		redraw();
		sendCustomEvent("undo", {});
	}, [iAmDrawer, revealed, redraw, sendCustomEvent]);

	const handleClear = useCallback(() => {
		if (!iAmDrawer || revealed) return;
		drawablesRef.current = [];
		currentStrokeRef.current = null;
		redraw();
		sendCustomEvent("clear", {});
	}, [iAmDrawer, revealed, redraw, sendCustomEvent]);

	return (
		<div className="flex flex-col gap-2">
			<div className="relative overflow-hidden rounded-xl border border-border bg-white">
				<canvas
					ref={canvasRef}
					width={CANVAS_SIZE}
					height={CANVAS_SIZE}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerUp}
					className={cn(
						"block aspect-square w-full touch-none select-none",
						iAmDrawer && !revealed
							? tool === "fill"
								? "cursor-crosshair"
								: "cursor-crosshair"
							: "cursor-not-allowed",
					)}
					aria-label={iAmDrawer ? "Drawing canvas" : "Opponent's drawing"}
				/>
				{!iAmDrawer && !revealed && (
					<div className="pointer-events-none absolute right-2 top-2 rounded-md bg-background/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
						Live
					</div>
				)}
			</div>

			{iAmDrawer && !revealed && (
				<Toolbar
					color={color}
					width={width}
					tool={tool}
					onColor={setColor}
					onWidth={setWidth}
					onTool={setTool}
					onUndo={handleUndo}
					onClear={handleClear}
				/>
			)}
		</div>
	);
}

function drawStrokePath(
	ctx: CanvasRenderingContext2D,
	color: string,
	width: number,
	points: DrawablePoint[],
) {
	if (points.length === 0) return;
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	if (points.length === 1) {
		const p = points[0];
		if (!p) return;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(p.x, p.y, width / 2, 0, Math.PI * 2);
		ctx.fill();
		return;
	}
	ctx.beginPath();
	const first = points[0];
	if (!first) return;
	ctx.moveTo(first.x, first.y);
	for (let i = 1; i < points.length; i++) {
		const p = points[i];
		if (!p) continue;
		ctx.lineTo(p.x, p.y);
	}
	ctx.stroke();
}

/* -------------------------------- toolbar -------------------------------- */

function Toolbar({
	color,
	width,
	tool,
	onColor,
	onWidth,
	onTool,
	onUndo,
	onClear,
}: {
	color: string;
	width: number;
	tool: Tool;
	onColor: (c: string) => void;
	onWidth: (w: number) => void;
	onTool: (t: Tool) => void;
	onUndo: () => void;
	onClear: () => void;
}) {
	return (
		<div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border/60 bg-card px-2 py-2">
			{/* Colors */}
			<div className="flex items-center gap-1">
				{COLORS.map((c) => (
					<button
						key={c}
						type="button"
						onClick={() => onColor(c)}
						aria-label={`Color ${c}`}
						aria-pressed={c === color}
						className={cn(
							"size-6 rounded-full border-2 transition-transform motion-safe:duration-150 ease-out",
							c === color
								? "border-foreground scale-110"
								: "border-border hover:scale-105",
						)}
						style={{ backgroundColor: c }}
					/>
				))}
			</div>

			<div className="h-6 w-px bg-border" />

			{/* Brush sizes */}
			<div className="flex items-center gap-1">
				{BRUSH_SIZES.map((w) => (
					<button
						key={w}
						type="button"
						onClick={() => onWidth(w)}
						aria-label={`Brush size ${w}`}
						aria-pressed={w === width}
						className={cn(
							"flex size-7 items-center justify-center rounded-md border transition-colors motion-safe:duration-150 ease-out",
							w === width
								? "border-foreground bg-muted"
								: "border-border hover:bg-muted/50",
						)}
					>
						<span
							className="block rounded-full bg-foreground"
							style={{ width: w, height: w }}
						/>
					</button>
				))}
			</div>

			<div className="h-6 w-px bg-border" />

			{/* Tools */}
			<button
				type="button"
				onClick={() => onTool("brush")}
				aria-label="Brush"
				aria-pressed={tool === "brush"}
				className={cn(
					"flex size-7 items-center justify-center rounded-md border transition-colors",
					tool === "brush"
						? "border-foreground bg-muted"
						: "border-border hover:bg-muted/50",
				)}
			>
				<Pencil className="size-3.5" />
			</button>
			<button
				type="button"
				onClick={() => onTool("fill")}
				aria-label="Fill"
				aria-pressed={tool === "fill"}
				className={cn(
					"flex size-7 items-center justify-center rounded-md border transition-colors",
					tool === "fill"
						? "border-foreground bg-muted"
						: "border-border hover:bg-muted/50",
				)}
			>
				<PaintBucket className="size-3.5" />
			</button>

			<div className="h-6 w-px bg-border" />

			{/* Actions */}
			<button
				type="button"
				onClick={onUndo}
				aria-label="Undo"
				className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
			>
				<Undo2 className="size-3.5" />
			</button>
			<button
				type="button"
				onClick={onClear}
				aria-label="Clear canvas"
				className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
			>
				<Eraser className="size-3.5" />
			</button>
		</div>
	);
}

/* ----------------------------- guess panel ----------------------------- */

function GuessPanel({
	options,
	iAmDrawer,
	guess,
	revealed,
	correctIdx,
	myTurn,
	onGuess,
}: {
	options: readonly [string, string, string, string];
	iAmDrawer: boolean;
	guess: DrawAndGuessPick | null;
	revealed: boolean;
	correctIdx: DrawAndGuessPick | null;
	myTurn: boolean;
	onGuess: (idx: DrawAndGuessPick) => void;
}) {
	return (
		<ul className="grid grid-cols-2 gap-2">
			{options.map((text, i) => {
				const idx = i as DrawAndGuessPick;
				const isGuess = guess === idx;
				const isCorrect = revealed && correctIdx === idx;
				const isWrongGuess = revealed && isGuess && !isCorrect;
				const disabled = iAmDrawer || revealed || guess !== null || !myTurn;

				let tone = "border-border bg-card text-foreground";
				if (isCorrect)
					tone = "border-brand-500 bg-brand-500/10 text-foreground";
				else if (isWrongGuess)
					tone = "border-destructive bg-destructive/10 text-destructive";
				else if (!revealed && isGuess)
					tone = "border-brand-500 bg-brand-500/10 text-foreground";

				return (
					<li
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed 4-tuple.
						key={i}
					>
						<button
							type="button"
							disabled={disabled}
							onClick={() => onGuess(idx)}
							aria-pressed={isGuess}
							className={cn(
								"flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors motion-safe:duration-150 ease-out",
								"disabled:cursor-not-allowed",
								tone,
								!disabled && "hover:border-border/80 active:scale-[0.99]",
							)}
						>
							<span className="truncate">{text}</span>
							{isCorrect && (
								<Check className="size-4 shrink-0 text-brand-500" aria-hidden />
							)}
							{isWrongGuess && (
								<X className="size-4 shrink-0 text-destructive" aria-hidden />
							)}
						</button>
					</li>
				);
			})}
		</ul>
	);
}

/* ------------------------------ role label ------------------------------ */

function RoleLabel({
	iAmDrawer,
	phase,
}: {
	iAmDrawer: boolean;
	phase: DrawAndGuessState["phase"];
}) {
	let text: string;
	const Icon = iAmDrawer ? Paintbrush : Eye;
	if (iAmDrawer) {
		text =
			phase === "setup"
				? "You're drawing this round"
				: phase === "drawing"
					? "Draw the word — stranger is guessing"
					: "You drew this round";
	} else {
		text =
			phase === "setup"
				? "Stranger is drawing this round"
				: phase === "drawing"
					? "Watch and guess what they're drawing"
					: "You guessed this round";
	}
	return (
		<div className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
			<Icon className="size-3" aria-hidden />
			<span>{text}</span>
		</div>
	);
}

/* -------------------------- score + finished views -------------------------- */

function ScoreBar({
	myScore,
	theirScore,
	round,
	total,
}: {
	myScore: number;
	theirScore: number;
	round: number;
	total: number;
}) {
	return (
		<div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
			<span className="font-medium text-foreground tabular-nums">
				You {myScore}
			</span>
			<span className="text-border">vs</span>
			<span className="tabular-nums">Stranger {theirScore}</span>
			<span className="text-border">·</span>
			<span className="tabular-nums">
				Round {round} of {total}
			</span>
		</div>
	);
}

function FinishedView({
	state,
	mySeat,
	myScore,
	theirScore,
}: {
	state: DrawAndGuessState;
	mySeat: "A" | "B";
	myScore: number;
	theirScore: number;
}) {
	let tagline: string;
	let tone: "win" | "lose" | "tie";
	if (myScore > theirScore) {
		tagline = "Sharp eyes + steady hand";
		tone = "win";
	} else if (myScore < theirScore) {
		tagline = "Stranger drew circles around you";
		tone = "lose";
	} else {
		tagline = "Matched — both halves pulled their weight";
		tone = "tie";
	}

	return (
		<div className="flex w-full max-w-md flex-col items-stretch gap-4">
			<div className="flex flex-col items-center gap-1">
				<p
					className={cn(
						"text-xs uppercase tracking-wide",
						tone === "win" && "text-brand-500",
						tone === "lose" && "text-destructive",
						tone === "tie" && "text-muted-foreground",
					)}
				>
					{tagline}
				</p>
				<p className="text-balance text-center text-2xl font-semibold tabular-nums">
					{myScore} — {theirScore}
				</p>
			</div>

			<ul className="flex flex-col gap-1.5">
				{state.history.map((h, i) => {
					const iDrew = h.drawerSeat === mySeat;
					const correctWord = h.options[h.correctIdx];
					const got = h.guess === h.correctIdx;
					return (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: round index is stable.
							key={i}
							className={cn(
								"flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs",
								got && "border-brand-500/40 bg-brand-500/5",
								!got && "border-destructive/30 bg-destructive/5",
							)}
						>
							<span className="min-w-0 flex-1 truncate text-muted-foreground">
								Word: <span className="text-foreground">{correctWord}</span>
							</span>
							<span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide">
								{iDrew ? (
									<span className="text-muted-foreground">You drew</span>
								) : got ? (
									<span className="flex items-center gap-1 text-brand-500">
										<Check className="size-3" aria-hidden />
										Got it
									</span>
								) : (
									<span className="flex items-center gap-1 text-destructive">
										<X className="size-3" aria-hidden />
										Missed
									</span>
								)}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

/* -------------------- custom events bridge (board-local) -------------------- */

/**
 * Draw & Guess's custom events (`stroke_*`, `fill`, `clear`, `undo`)
 * carry drawing data that can only be applied to this board's local
 * canvas refs — not to the shared game state. The adapter-level
 * `getCustomEvents(setGameState)` pattern doesn't fit.
 *
 * We bridge them by registering the board's handlers on a module-local
 * `EventTarget` keyed by `sendCustomEvent` identity. The adapter then
 * forwards events to this target via its own handlers (see
 * `adapters.tsx`).
 *
 * The closure identity of `sendCustomEvent` is stable per game-room
 * instance, so using it as the registry key is safe.
 */
type BoardHandlerMap = Record<string, (data: unknown) => void>;
const boardHandlerRegistry = new Map<
	(event: string, payload: unknown) => void,
	BoardHandlerMap
>();

export function dispatchBoardEvent(
	sendCustomEvent: (event: string, payload: unknown) => void,
	event: string,
	data: unknown,
) {
	const map = boardHandlerRegistry.get(sendCustomEvent);
	map?.[event]?.(data);
}

function useCustomEventsBridge(
	sendCustomEvent: (event: string, payload: unknown) => void,
	handlers: BoardHandlerMap,
) {
	// We keep the latest handlers in a ref so the registry entry can
	// dispatch to the current closures without re-running this effect.
	const ref = useRef(handlers);
	ref.current = handlers;

	// biome-ignore lint/correctness/useExhaustiveDependencies: handlers captured via ref; keys stable per component.
	useEffect(() => {
		const proxy: BoardHandlerMap = {};
		for (const key of Object.keys(handlers)) {
			proxy[key] = (data) => ref.current[key]?.(data);
		}
		boardHandlerRegistry.set(sendCustomEvent, proxy);
		return () => {
			boardHandlerRegistry.delete(sendCustomEvent);
		};
	}, [sendCustomEvent]);
}

/* -------- redraw helper referenced from remote events is defined above -------- */
