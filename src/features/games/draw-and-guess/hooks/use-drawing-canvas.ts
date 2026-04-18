import {
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { BRUSH_SIZES, COLORS, STROKE_BATCH_MS } from "../constants";
import { useCustomEventsBridge } from "../lib/board-event-bridge";
import { drawStrokePath } from "../lib/draw-helpers";
import type { Drawable, DrawablePoint } from "../types";

/**
 * Owns the canvas drawing state: stroke history, pointer handlers,
 * brush settings, remote event application, and the full/incremental
 * redraw logic. Returns everything the surface component needs to
 * render and wire up.
 */
export function useDrawingCanvas({
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
			drawStrokePath(ctx, d.color, d.width, d.points);
		}
	}, []);

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

	/* Incremental: draw just the newest segment of the current stroke. */
	const drawSegment = useCallback((stroke: Drawable, fromIdx: number) => {
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
	}, []);

	/* ---------- remote event handlers (guesser receives strokes) ---------- */
	useCustomEventsBridge(sendCustomEvent, {
		stroke_start: (data) => {
			const d = data as {
				id?: string;
				color?: string;
				width?: number;
			};
			if (!d.id || !d.color || typeof d.width !== "number") return;
			const stroke: Drawable = {
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
			if (!last || last.id !== d.id) return;
			const prevLen = last.points.length;
			last.points.push(...d.points);
			drawSegment(last, prevLen);
		},
		stroke_end: () => {
			currentStrokeRef.current = null;
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
		if (!stroke || points.length === 0) return;
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

			const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
			const stroke: Drawable = {
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
			color,
			width,
			pointFromEvent,
			drawSegment,
			sendCustomEvent,
			scheduleFlush,
		],
	);

	const handlePointerMove = useCallback(
		(e: ReactPointerEvent<HTMLCanvasElement>) => {
			if (!iAmDrawer || revealed) return;
			const stroke = currentStrokeRef.current;
			if (!stroke) return;
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
			id: stroke.id,
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

	return {
		canvasRef,
		color,
		width,
		setColor,
		setWidth,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleUndo,
		handleClear,
	};
}
