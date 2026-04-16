import { Ban, Gamepad2, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { IncomingInvite } from "../hooks/use-game-invite";

interface GameInviteModalProps {
	invite: IncomingInvite;
	onAccept: () => void;
	onReject: () => void;
	onBan: () => void;
}

export function GameInviteModal({
	invite,
	onAccept,
	onReject,
	onBan,
}: GameInviteModalProps) {
	return (
		<Dialog open onOpenChange={(open) => !open && onReject()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
						<Gamepad2 className="h-6 w-6 text-primary" />
					</div>
					<DialogTitle className="text-center">Game Invite</DialogTitle>
					<DialogDescription className="text-center">
						Your stranger wants to play{" "}
						<span className="font-medium text-foreground">
							{invite.gameName}
						</span>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col gap-2 sm:flex-col">
					<div className="flex gap-2">
						<Button variant="outline" className="flex-1" onClick={onReject}>
							<XIcon className="mr-1.5 h-3.5 w-3.5" />
							Decline
						</Button>
						<Button className="flex-1" onClick={onAccept}>
							<Gamepad2 className="mr-1.5 h-3.5 w-3.5" />
							Play
						</Button>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="text-xs text-muted-foreground"
						onClick={() => {
							onBan();
							onReject();
						}}
					>
						<Ban className="mr-1 h-3 w-3" />
						Block game requests
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
