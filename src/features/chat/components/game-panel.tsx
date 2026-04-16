import { Loader2, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GAMES } from "../../games/data/games";
import type { GameInviteStatus } from "../hooks/use-game-invite";
import { ActiveGame } from "./active-game";
import { GamePickerCard } from "./game-picker-card";

interface GamePanelProps {
	roomId: string;
	inviteStatus: GameInviteStatus;
	acceptedGameId: string | null;
	onInvite: (gameId: string, gameName: string) => void;
	onResetInvite: () => void;
	onClose: () => void;
}

export function GamePanel({
	roomId,
	inviteStatus,
	acceptedGameId,
	onInvite,
	onResetInvite,
	onClose,
}: GamePanelProps) {
	if (inviteStatus === "accepted" && acceptedGameId) {
		return (
			<ActiveGame
				roomId={roomId}
				gameId={acceptedGameId}
				onClose={onClose}
				onBack={onResetInvite}
			/>
		);
	}

	if (inviteStatus === "inviting") {
		return (
			<div className="flex h-full flex-col">
				<PanelHeader title="Play a Game" onClose={onClose} />
				<div className="flex flex-1 items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							Waiting for stranger to accept...
						</p>
						<Button variant="ghost" size="sm" onClick={onResetInvite}>
							Cancel
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (inviteStatus === "rejected") {
		return (
			<div className="flex h-full flex-col">
				<PanelHeader title="Play a Game" onClose={onClose} />
				<div className="flex flex-1 items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<XCircle className="h-6 w-6 text-destructive" />
						<p className="text-sm text-muted-foreground">
							Stranger declined the invite
						</p>
						<Button variant="outline" size="sm" onClick={onResetInvite}>
							Try again
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return <GamePicker onSelect={onInvite} onClose={onClose} />;
}

function PanelHeader({
	title,
	onClose,
}: {
	title: string;
	onClose: () => void;
}) {
	return (
		<div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
			<h3 className="text-sm font-semibold text-foreground">{title}</h3>
			<Button variant="ghost" size="icon-sm" onClick={onClose}>
				<X className="h-4 w-4" />
			</Button>
		</div>
	);
}

function GamePicker({
	onSelect,
	onClose,
}: {
	onSelect: (gameId: string, gameName: string) => void;
	onClose: () => void;
}) {
	const availableGames = GAMES.filter((g) => g.status === "available");
	const comingSoonGames = GAMES.filter((g) => g.status === "coming_soon");

	return (
		<div className="flex h-full flex-col">
			<PanelHeader title="Play a Game" onClose={onClose} />
			<div className="flex-1 overflow-y-auto p-4 space-y-3">
				{availableGames.map((game) => (
					<GamePickerCard
						key={game.id}
						game={game}
						onPlay={() => onSelect(game.id, game.name)}
					/>
				))}
				{comingSoonGames.map((game) => (
					<GamePickerCard key={game.id} game={game} />
				))}
			</div>
		</div>
	);
}
