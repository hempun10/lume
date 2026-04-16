import { cn } from "@/lib/utils";
import type { Board, CellValue } from "../engines/tic-tac-toe";

interface TicTacToeBoardProps {
	board: Board;
	winLine: number[] | null;
	myTurn: boolean;
	disabled: boolean;
	onCellClick: (position: number) => void;
}

export function TicTacToeBoard({
	board,
	winLine,
	myTurn,
	disabled,
	onCellClick,
}: TicTacToeBoardProps) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{board.map((cell, i) => {
				const key = `pos-${i}`;
				return (
					<Cell
						key={key}
						value={cell}
						position={i}
						isWinCell={winLine?.includes(i) ?? false}
						disabled={disabled || !myTurn || cell !== null}
						onClick={() => onCellClick(i)}
					/>
				);
			})}
		</div>
	);
}

interface CellProps {
	value: CellValue;
	position: number;
	isWinCell: boolean;
	disabled: boolean;
	onClick: () => void;
}

function Cell({ value, isWinCell, disabled, onClick }: CellProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className={cn(
				"flex aspect-square items-center justify-center rounded-xl border-2 text-3xl font-bold transition-all duration-150 sm:text-4xl",
				"border-border bg-card",
				!disabled &&
					!value &&
					"cursor-pointer hover:border-primary/50 hover:bg-accent",
				disabled && !value && "cursor-default opacity-60",
				isWinCell && "border-primary bg-primary/10",
			)}
		>
			{value && (
				<span
					className={cn(
						"animate-in zoom-in-50 duration-150",
						value === "X" ? "text-brand-500" : "text-destructive",
						isWinCell && "scale-110",
					)}
				>
					{value}
				</span>
			)}
		</button>
	);
}
