import { cn } from "@/lib/utils";
import { CANVAS_SIZE } from "../constants";
import { useDrawingCanvas } from "../hooks/use-drawing-canvas";
import { Toolbar } from "./toolbar";

export function DrawingSurface({
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
	const {
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
	} = useDrawingCanvas({ iAmDrawer, revealed, sendCustomEvent, roundKey });

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
						iAmDrawer && !revealed ? "cursor-crosshair" : "cursor-not-allowed",
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
					onColor={setColor}
					onWidth={setWidth}
					onUndo={handleUndo}
					onClear={handleClear}
				/>
			)}
		</div>
	);
}
