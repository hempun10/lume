export type GameStatus = "available" | "coming_soon";

export interface Game {
	id: string;
	name: string;
	description: string;
	icon: string;
	players: string;
	duration: string;
	status: GameStatus;
}
