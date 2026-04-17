import type { ReactNode } from "react";
import { ConnectFourBoard } from "../components/connect-four-board";
import { TicTacToeBoard } from "../components/tic-tac-toe-board";
import { WouldYouRatherBoard } from "../components/would-you-rather-board";
import {
	CONNECT_FOUR_ENGINE,
	type ConnectFourState,
} from "../engines/connect-four";
import {
	TIC_TAC_TOE_ENGINE,
	type TicTacToeState,
} from "../engines/tic-tac-toe";
import type { GameEngine, GameResult, Seat } from "../engines/types";
import {
	WOULD_YOU_RATHER_ENGINE,
	type WouldYouRatherState,
} from "../engines/would-you-rather";

/**
 * Per-game presentation adapter. Anything game-specific that the
 * generic game room UI needs goes here: the engine, the board
 * component, the display title, and how to render a user's seat
 * (e.g. "X" vs "Red").
 */
export interface GameAdapter<State> {
	id: string;
	title: string;
	engine: GameEngine<State>;
	renderBoard: (props: {
		state: State;
		myTurn: boolean;
		disabled: boolean;
		onMove: (move: number) => void;
	}) => ReactNode;
	renderSeatBadge: (seat: Seat) => ReactNode;
	/**
	 * Optional: override the status line shown above the board
	 * (e.g. "Your turn" / "You won!"). Return null to render nothing.
	 * If omitted, the default turn/outcome label is used.
	 */
	renderStatus?: (props: {
		state: State;
		myTurn: boolean;
		outcome: GameResult;
		isFinished: boolean;
	}) => ReactNode;
}

const ticTacToeAdapter: GameAdapter<TicTacToeState> = {
	id: "tic-tac-toe",
	title: "Tic Tac Toe",
	engine: TIC_TAC_TOE_ENGINE,
	renderBoard: ({ state, myTurn, disabled, onMove }) => (
		<TicTacToeBoard
			board={state.board}
			winLine={state.winLine}
			myTurn={myTurn}
			disabled={disabled}
			onCellClick={onMove}
		/>
	),
	renderSeatBadge: (seat) => {
		if (!seat) return null;
		const mark = seat === "A" ? "X" : "O";
		return (
			<span className="text-xs text-muted-foreground">
				You:{" "}
				<span className={seat === "A" ? "text-brand-500" : "text-destructive"}>
					{mark}
				</span>
			</span>
		);
	},
};

const connectFourAdapter: GameAdapter<ConnectFourState> = {
	id: "connect-four",
	title: "Connect Four",
	engine: CONNECT_FOUR_ENGINE,
	renderBoard: ({ state, myTurn, disabled, onMove }) => (
		<ConnectFourBoard
			state={state}
			myTurn={myTurn}
			disabled={disabled}
			onColumnClick={onMove}
		/>
	),
	renderSeatBadge: (seat) => {
		if (!seat) return null;
		const label = seat === "A" ? "Red" : "Yellow";
		return (
			<span className="text-xs text-muted-foreground">
				You:{" "}
				<span className={seat === "A" ? "text-brand-500" : "text-yellow-500"}>
					{label}
				</span>
			</span>
		);
	},
};

const wouldYouRatherAdapter: GameAdapter<WouldYouRatherState> = {
	id: "would-you-rather",
	title: "Would You Rather",
	engine: WOULD_YOU_RATHER_ENGINE,
	renderBoard: ({ state, myTurn, onMove }) => (
		<WouldYouRatherBoard state={state} myTurn={myTurn} onMove={onMove} />
	),
	renderSeatBadge: () => null,
	// Board owns the status UI (phase-dependent: pick / waiting / reveal / summary).
	renderStatus: () => null,
};

// biome-ignore lint/suspicious/noExplicitAny: Adapter state types differ per game.
const REGISTRY: Record<string, GameAdapter<any>> = {
	"tic-tac-toe": ticTacToeAdapter,
	"connect-four": connectFourAdapter,
	"would-you-rather": wouldYouRatherAdapter,
};

export function getGameAdapter(
	gameId: string,
): // biome-ignore lint/suspicious/noExplicitAny: Callers treat state as opaque.
GameAdapter<any> | null {
	return REGISTRY[gameId] ?? null;
}
