import { cn } from "@/lib/utils";
import { COLS, type ConnectFourState, ROWS } from "../engines/connect-four";

interface ConnectFourBoardProps {
	state: ConnectFourState;
	myTurn: boolean;
	disabled: boolean;
	onColumnClick: (column: number) => void;
}

export function ConnectFourBoard({
	state,
	myTurn,
	disabled,
	onColumnClick,
}: ConnectFourBoardProps) {
	const winSet = new Set(state.winLine ?? []);
	const columnFull = (col: number) => state.board[col] !== null;

	return (
		<div className="inline-block rounded-xl border-2 border-border bg-card p-2">
			<div
				className="grid gap-1.5"
				style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
			>
				{Array.from({ length: ROWS * COLS }).map((_, idx) => {
					const row = Math.floor(idx / COLS);
					const col = idx % COLS;
					const cell = state.board[idx];
					const full = columnFull(col);
					const key = `c4-${row}-${col}`;
					const cellDisabled = disabled || !myTurn || full;
					return (
						<button
							type="button"
							key={key}
							disabled={cellDisabled}
							onClick={() => onColumnClick(col)}
							aria-label={`Column ${col + 1}${
								cell ? `, ${cell === "R" ? "red" : "yellow"} disc` : ""
							}`}
							className={cn(
								"flex size-8 items-center justify-center rounded-full bg-muted transition-colors sm:size-10",
								!cellDisabled && "cursor-pointer hover:bg-accent",
								cellDisabled && !cell && "cursor-default",
							)}
						>
							{cell && (
								<span
									className={cn(
										"size-6 rounded-full sm:size-8",
										"motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-150",
										cell === "R" ? "bg-brand-500" : "bg-yellow-400",
										winSet.has(idx) &&
											"ring-2 ring-foreground ring-offset-1 ring-offset-card",
									)}
								/>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
