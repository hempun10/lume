import { ArrowLeft, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicTacToeBoard } from "../../games/components/tic-tac-toe-board";
import { useGameRoom } from "../../games/hooks/use-game-room";

interface ActiveGameProps {
	roomId: string;
	gameId: string;
	onClose: () => void;
	onBack: () => void;
}

export function ActiveGame({ roomId, onClose, onBack }: ActiveGameProps) {
	const {
		gameState,
		roomStatus,
		myTurn,
		myMark,
		makeMove,
		requestRematch,
		rematchRequested,
		opponentWantsRematch,
	} = useGameRoom(roomId);

	if (roomStatus === "connecting" || roomStatus === "waiting_for_opponent") {
		return (
			<div className="flex h-full flex-col">
				<ActiveGameHeader myMark={null} onBack={onBack} onClose={onClose} />
				<div className="flex flex-1 items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							{roomStatus === "connecting"
								? "Connecting..."
								: "Setting up game..."}
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!gameState) {
		return (
			<div className="flex h-full flex-col">
				<ActiveGameHeader myMark={null} onBack={onBack} onClose={onClose} />
				<div className="flex flex-1 items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<p className="text-sm text-muted-foreground">
							Something went wrong.
						</p>
						<Button variant="outline" size="sm" onClick={onBack}>
							Back to games
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const isFinished = roomStatus === "finished";
	const iWon = gameState.winner !== null && gameState.winner === myMark;
	const iLost = gameState.winner !== null && gameState.winner !== myMark;

	let statusText: string;
	if (isFinished) {
		if (iWon) statusText = "You won!";
		else if (iLost) statusText = "You lost";
		else statusText = "It's a draw";
	} else {
		statusText = myTurn ? "Your turn" : "Opponent's turn";
	}

	return (
		<div className="flex h-full flex-col">
			<ActiveGameHeader myMark={myMark} onBack={onBack} onClose={onClose} />

			{/* Game area */}
			<div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
				<p
					className={
						isFinished
							? iWon
								? "text-sm font-semibold text-brand-500"
								: iLost
									? "text-sm font-semibold text-destructive"
									: "text-sm font-semibold text-muted-foreground"
							: myTurn
								? "text-sm font-medium text-foreground"
								: "text-sm text-muted-foreground"
					}
				>
					{statusText}
				</p>

				<div className="w-full max-w-[240px]">
					<TicTacToeBoard
						board={gameState.board}
						winLine={gameState.winLine}
						myTurn={myTurn}
						disabled={isFinished}
						onCellClick={makeMove}
					/>
				</div>

				{isFinished && (
					<div className="flex flex-col items-center gap-2">
						<Button
							variant={rematchRequested ? "outline" : "default"}
							size="sm"
							disabled={rematchRequested}
							onClick={requestRematch}
							className="gap-2"
						>
							<RotateCcw className="h-3.5 w-3.5" />
							{rematchRequested ? "Waiting..." : "Rematch"}
						</Button>

						{opponentWantsRematch && !rematchRequested && (
							<p className="text-xs text-muted-foreground">
								Opponent wants a rematch!
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function ActiveGameHeader({
	myMark,
	onBack,
	onClose,
}: {
	myMark: "X" | "O" | null;
	onBack: () => void;
	onClose: () => void;
}) {
	return (
		<div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={onBack}
					aria-label="Leave game and pick another"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h3 className="text-sm font-semibold text-foreground">Tic Tac Toe</h3>
				{myMark && (
					<span className="text-xs text-muted-foreground">
						You:{" "}
						<span
							className={myMark === "X" ? "text-brand-500" : "text-destructive"}
						>
							{myMark}
						</span>
					</span>
				)}
			</div>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={onClose}
				aria-label="Close game panel"
			>
				<X className="h-4 w-4" />
			</Button>
		</div>
	);
}
