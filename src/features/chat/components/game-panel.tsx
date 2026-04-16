import { Loader2, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TicTacToeBoard } from "../../games/components/tic-tac-toe-board";
import { GAMES } from "../../games/data/games";
import { useGameRoom } from "../../games/hooks/use-game-room";
import { GamePickerCard } from "./game-picker-card";

interface GamePanelProps {
	roomId: string;
	onClose: () => void;
}

export function GamePanel({ roomId, onClose }: GamePanelProps) {
	const [selectedGame, setSelectedGame] = useState<string | null>(null);

	if (!selectedGame) {
		return <GamePicker onSelect={setSelectedGame} onClose={onClose} />;
	}

	return (
		<ActiveGame
			roomId={roomId}
			gameId={selectedGame}
			onClose={onClose}
			onBack={() => setSelectedGame(null)}
		/>
	);
}

interface GamePickerProps {
	onSelect: (gameId: string) => void;
	onClose: () => void;
}

function GamePicker({ onSelect, onClose }: GamePickerProps) {
	const availableGames = GAMES.filter((g) => g.status === "available");
	const comingSoonGames = GAMES.filter((g) => g.status === "coming_soon");

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
				<h3 className="text-sm font-semibold text-foreground">Play a Game</h3>
				<Button variant="ghost" size="icon-sm" onClick={onClose}>
					<X className="h-4 w-4" />
				</Button>
			</div>
			<div className="flex-1 overflow-y-auto p-4 space-y-3">
				{availableGames.map((game) => (
					<GamePickerCard
						key={game.id}
						game={game}
						onPlay={() => onSelect(game.id)}
					/>
				))}
				{comingSoonGames.map((game) => (
					<GamePickerCard key={game.id} game={game} />
				))}
			</div>
		</div>
	);
}

interface ActiveGameProps {
	roomId: string;
	gameId: string;
	onClose: () => void;
	onBack: () => void;
}

function ActiveGame({ roomId, onClose, onBack }: ActiveGameProps) {
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
				<div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
					<h3 className="text-sm font-semibold text-foreground">Tic Tac Toe</h3>
					<Button variant="ghost" size="icon-sm" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							{roomStatus === "connecting"
								? "Connecting..."
								: "Waiting for opponent..."}
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!gameState) {
		return (
			<div className="flex h-full flex-col">
				<div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
					<h3 className="text-sm font-semibold text-foreground">Tic Tac Toe</h3>
					<Button variant="ghost" size="icon-sm" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>
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
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-semibold text-foreground">Tic Tac Toe</h3>
					{myMark && (
						<span className="text-xs text-muted-foreground">
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
				<Button variant="ghost" size="icon-sm" onClick={onClose}>
					<X className="h-4 w-4" />
				</Button>
			</div>

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
