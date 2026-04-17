import { ArrowLeft, Loader2, RotateCcw, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getGameAdapter } from "../../games/data/adapters";
import {
	type CustomEventHandler,
	useGameRoom,
} from "../../games/hooks/use-game-room";

interface ActiveGameProps {
	roomId: string;
	gameId: string;
	onClose: () => void;
	onBack: () => void;
}

export function ActiveGame({
	roomId,
	gameId,
	onClose,
	onBack,
}: ActiveGameProps) {
	const adapter = getGameAdapter(gameId);

	if (!adapter) {
		return (
			<div className="flex h-full flex-col">
				<ActiveGameHeader
					title="Game"
					seatBadge={null}
					onBack={onBack}
					onClose={onClose}
				/>
				<div className="flex flex-1 items-center justify-center px-6">
					<div className="flex flex-col items-center gap-3 text-center">
						<p className="text-pretty text-sm text-muted-foreground">
							This game isn't available yet.
						</p>
						<Button variant="outline" size="sm" onClick={onBack}>
							Back to games
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<GameRoom
			adapter={adapter}
			roomId={roomId}
			onBack={onBack}
			onClose={onClose}
		/>
	);
}

function GameRoom({
	adapter,
	roomId,
	onBack,
	onClose,
}: {
	adapter: NonNullable<ReturnType<typeof getGameAdapter>>;
	roomId: string;
	onBack: () => void;
	onClose: () => void;
}) {
	const [customEvents, setCustomEvents] = useState<
		Record<string, CustomEventHandler>
	>({});
	const {
		gameState,
		roomStatus,
		myTurn,
		mySeat,
		outcome,
		makeMove,
		requestRematch,
		rematchRequested,
		opponentWantsRematch,
		sendCustomEvent,
		setGameState,
	} = useGameRoom(roomId, adapter.engine, adapter.id, { customEvents });

	// Register adapter-defined custom-event handlers once. `setGameState`
	// is stable across renders, so this effect runs at most once per
	// adapter; the hook reads `customEvents` off a ref each render so
	// the updated map is picked up on the next dispatch.
	useEffect(() => {
		if (!adapter.getCustomEvents) return;
		setCustomEvents(adapter.getCustomEvents(setGameState));
	}, [adapter, setGameState]);

	const seatBadge = adapter.renderSeatBadge(mySeat);

	if (roomStatus === "connecting" || roomStatus === "waiting_for_opponent") {
		return (
			<div className="flex h-full flex-col">
				<ActiveGameHeader
					title={adapter.title}
					seatBadge={null}
					onBack={onBack}
					onClose={onClose}
				/>
				<div className="flex flex-1 items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
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
				<ActiveGameHeader
					title={adapter.title}
					seatBadge={null}
					onBack={onBack}
					onClose={onClose}
				/>
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

	const customStatus = adapter.renderStatus
		? adapter.renderStatus({
				state: gameState,
				myTurn,
				outcome,
				isFinished,
			})
		: undefined;

	let statusText: string;
	if (isFinished) {
		if (outcome === "won") statusText = "You won!";
		else if (outcome === "lost") statusText = "You lost";
		else statusText = "It's a draw";
	} else {
		statusText = myTurn ? "Your turn" : "Opponent's turn";
	}

	return (
		<div className="flex h-full flex-col">
			<ActiveGameHeader
				title={adapter.title}
				seatBadge={seatBadge}
				onBack={onBack}
				onClose={onClose}
			/>

			<div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
				{customStatus !== undefined ? (
					customStatus
				) : (
					<p
						className={
							isFinished
								? outcome === "won"
									? "text-sm font-semibold text-brand-500"
									: outcome === "lost"
										? "text-sm font-semibold text-destructive"
										: "text-sm font-semibold text-muted-foreground"
								: myTurn
									? "text-sm font-medium text-foreground"
									: "text-sm text-muted-foreground"
						}
					>
						{statusText}
					</p>
				)}

				{adapter.renderBoard({
					state: gameState,
					myTurn,
					disabled: isFinished,
					onMove: makeMove,
					mySeat,
					sendCustomEvent,
					setGameState,
				})}

				{isFinished && (
					<div className="flex flex-col items-center gap-2">
						<Button
							variant={rematchRequested ? "outline" : "default"}
							size="sm"
							disabled={rematchRequested}
							onClick={requestRematch}
							className="gap-2"
						>
							<RotateCcw className="size-3.5" />
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

/**
 * Adapter state is opaque to this component — the adapter's
 * `renderBoard` and `renderSeatBadge` own the game-specific rendering.
 */
function ActiveGameHeader({
	title,
	seatBadge,
	onBack,
	onClose,
}: {
	title: string;
	seatBadge: ReactNode;
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
					<ArrowLeft className="size-4" />
				</Button>
				<h3 className="text-sm font-semibold text-foreground">{title}</h3>
				{seatBadge}
			</div>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={onClose}
				aria-label="Close game panel"
			>
				<X className="size-4" />
			</Button>
		</div>
	);
}
