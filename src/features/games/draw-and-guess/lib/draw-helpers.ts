import type { DrawablePoint } from "../types";

/**
 * Draw a complete stroke path onto the canvas. Used for full redraws
 * after undo/clear/remote events. For incremental drawing while a
 * stroke is in progress, see `drawSegment` inside the canvas hook.
 */
export function drawStrokePath(
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
