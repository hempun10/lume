import { Eraser, Undo2 } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BRUSH_SIZES, COLORS } from "../constants";

export function Toolbar({
	color,
	width,
	onColor,
	onWidth,
	onUndo,
	onClear,
}: {
	color: string;
	width: number;
	onColor: (c: string) => void;
	onWidth: (w: number) => void;
	onUndo: () => void;
	onClear: () => void;
}) {
	return (
		<TooltipProvider delayDuration={200}>
			<div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border/60 bg-card px-2 py-2">
				{/* Colors */}
				<div className="flex items-center gap-1">
					{COLORS.map((c) => (
						<Tooltip key={c}>
							<TooltipTrigger asChild>
								<button
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
							</TooltipTrigger>
							<TooltipContent side="top" sideOffset={6}>
								Color
							</TooltipContent>
						</Tooltip>
					))}
				</div>

				<div className="h-6 w-px bg-border" />

				{/* Brush sizes */}
				<div className="flex items-center gap-1">
					{BRUSH_SIZES.map((w, i) => {
						const label =
							i === 0 ? "Thin brush" : i === 1 ? "Medium brush" : "Thick brush";
						return (
							<Tooltip key={w}>
								<TooltipTrigger asChild>
									<button
										type="button"
										onClick={() => onWidth(w)}
										aria-label={label}
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
								</TooltipTrigger>
								<TooltipContent side="top" sideOffset={6}>
									{label}
								</TooltipContent>
							</Tooltip>
						);
					})}
				</div>

				<div className="h-6 w-px bg-border" />

				{/* Actions */}
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={onUndo}
							aria-label="Undo last stroke"
							className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
						>
							<Undo2 className="size-3.5" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top" sideOffset={6}>
						Undo
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={onClear}
							aria-label="Clear canvas"
							className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
						>
							<Eraser className="size-3.5" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top" sideOffset={6}>
						Clear canvas
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}
