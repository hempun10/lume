import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameRoom } from "../hooks/use-game-room";
import { TicTacToeBoard } from "./tic-tac-toe-board";

interface GameViewProps {
	roomId: string;
}

export function GameView({ roomId }: GameViewProps) {
	const navigate = useNavigate();
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

	function handleBack() {
		navigate({ to: "/games" });
	}

	// --- Connecting / Waiting ---
	if (roomStatus === "connecting" || roomStatus === "waiting_for_opponent") {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 px-4">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				<p className="text-sm text-muted-foreground">
					{roomStatus === "connecting"
						? "Connecting to game..."
						: "Waiting for opponent..."}
				</p>
			</div>
		);
	}

	if (!gameState) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 px-4">
				<p className="text-sm text-muted-foreground">
					Something went wrong. No game state available.
				</p>
				<Button variant="outline" size="sm" onClick={handleBack}>
					Back to Games
				</Button>
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
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border px-4 py-3">
				<button
					type="button"
					onClick={handleBack}
					className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					<span>Leave</span>
				</button>

				<h2 className="text-sm font-medium text-foreground">Tic Tac Toe</h2>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					{myMark && (
						<span>
							You:{" "}
							<span
								className={
									myMark === "X" ? "text-brand-500" : "text-destructive"
								}
							>
								{myMark}
							</span>
						</span>
					)}
				</div>
			</div>

			{/* Game Area */}
			<div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
				{/* Status */}
				<p
					className={
						isFinished
							? iWon
								? "text-lg font-semibold text-brand-500"
								: iLost
									? "text-lg font-semibold text-destructive"
									: "text-lg font-semibold text-muted-foreground"
							: myTurn
								? "text-sm font-medium text-foreground"
								: "text-sm text-muted-foreground"
					}
				>
					{statusText}
				</p>

				{/* Board */}
				<div className="w-full max-w-[280px] sm:max-w-[320px]">
					<TicTacToeBoard
						board={gameState.board}
						winLine={gameState.winLine}
						myTurn={myTurn}
						disabled={isFinished}
						onCellClick={makeMove}
					/>
				</div>

				{/* Post-game actions */}
				{isFinished && (
					<div className="flex flex-col items-center gap-3">
						<Button
							variant={rematchRequested ? "outline" : "default"}
							size="sm"
							disabled={rematchRequested}
							onClick={requestRematch}
							className="gap-2"
						>
							<RotateCcw className="h-4 w-4" />
							{rematchRequested ? "Waiting for opponent..." : "Rematch"}
						</Button>

						{opponentWantsRematch && !rematchRequested && (
							<p className="text-xs text-muted-foreground">
								Opponent wants a rematch!
							</p>
						)}

						<Button
							variant="ghost"
							size="sm"
							onClick={handleBack}
							className="text-xs text-muted-foreground"
						>
							Back to Games
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
