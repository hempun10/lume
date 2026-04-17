import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
	DrawAndGuessBoard,
	dispatchBoardEvent,
} from "../components/draw-and-guess-board";
import { EmojiCharadesBoard } from "../components/emoji-charades-board";
import { RockPaperScissorsBoard } from "../components/rock-paper-scissors-board";
import { TicTacToeBoard } from "../components/tic-tac-toe-board";
import { TriviaBoard } from "../components/trivia-board";
import { TwoTruthsBoard } from "../components/two-truths-board";
import { WouldYouRatherBoard } from "../components/would-you-rather-board";
import {
	applyReveal as applyDrawReveal,
	applyRoundSetup,
	DRAW_AND_GUESS_ENGINE,
	type DrawAndGuessPick,
	type DrawAndGuessState,
} from "../engines/draw-and-guess";
import {
	EMOJI_CHARADES_ENGINE,
	type EmojiCharadesState,
} from "../engines/emoji-charades";
import {
	ROCK_PAPER_SCISSORS_ENGINE,
	type RockPaperScissorsState,
} from "../engines/rock-paper-scissors";
import {
	TIC_TAC_TOE_ENGINE,
	type TicTacToeState,
} from "../engines/tic-tac-toe";
import { TRIVIA_ENGINE, type TriviaState } from "../engines/trivia";
import {
	applyReveal,
	applyStatements,
	TWO_TRUTHS_ENGINE,
	type TwoTruthsPick,
	type TwoTruthsState,
} from "../engines/two-truths";
import type { GameEngine, GameResult, Seat } from "../engines/types";
import {
	WOULD_YOU_RATHER_ENGINE,
	type WouldYouRatherState,
} from "../engines/would-you-rather";
import type { CustomEventHandler } from "../hooks/use-game-room";

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
		mySeat: Seat;
		/**
		 * Broadcast a game-specific side-channel event to the other
		 * seat. Only some games need this (user-authored text, drawing
		 * strokes, etc.). Unused by most boards.
		 */
		sendCustomEvent: (event: string, payload: unknown) => void;
		/**
		 * Direct setter for shared game state. Boards pair this with
		 * `customEvents` handlers to apply transitions driven by
		 * broadcast events. Unused by most boards.
		 */
		setGameState: Dispatch<SetStateAction<State | null>>;
	}) => ReactNode;
	renderSeatBadge: (seat: Seat) => ReactNode;
	/**
	 * Optional: custom-event handlers this game wants registered on
	 * the broadcast channel. Called once per game instance with the
	 * hook's `setGameState` so handlers can apply transitions driven
	 * by side-channel events (e.g. user-authored text, reveals).
	 * `sendCustomEvent` is also provided as a stable identity key for
	 * board-level side registries (e.g. Draw & Guess forwards drawing
	 * events to canvas refs via a registry keyed by this function).
	 * Handlers fire only for events from the other seat.
	 */
	getCustomEvents?: (
		setGameState: Dispatch<SetStateAction<State | null>>,
		sendCustomEvent: (event: string, payload: unknown) => void,
	) => Record<string, CustomEventHandler>;
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

const wouldYouRatherAdapter: GameAdapter<WouldYouRatherState> = {
	id: "would-you-rather",
	title: "Would You Rather",
	engine: WOULD_YOU_RATHER_ENGINE,
	renderBoard: ({ state, myTurn, onMove, mySeat }) => (
		<WouldYouRatherBoard
			state={state}
			mySeat={mySeat}
			myTurn={myTurn}
			onMove={onMove}
		/>
	),
	renderSeatBadge: () => null,
	// Board owns the status UI (phase-dependent: pick / waiting / reveal / summary).
	renderStatus: () => null,
};

const rockPaperScissorsAdapter: GameAdapter<RockPaperScissorsState> = {
	id: "rock-paper-scissors",
	title: "Rock Paper Scissors",
	engine: ROCK_PAPER_SCISSORS_ENGINE,
	renderBoard: ({ state, myTurn, onMove, mySeat }) => (
		<RockPaperScissorsBoard
			state={state}
			mySeat={mySeat}
			myTurn={myTurn}
			onMove={onMove}
		/>
	),
	renderSeatBadge: () => null,
	// Board owns the status UI (score bar + per-round result).
	renderStatus: () => null,
};

const triviaAdapter: GameAdapter<TriviaState> = {
	id: "trivia",
	title: "Trivia",
	engine: TRIVIA_ENGINE,
	renderBoard: ({ state, myTurn, onMove, mySeat }) => (
		<TriviaBoard
			state={state}
			mySeat={mySeat}
			myTurn={myTurn}
			onMove={onMove}
		/>
	),
	renderSeatBadge: () => null,
	renderStatus: () => null,
};

const emojiCharadesAdapter: GameAdapter<EmojiCharadesState> = {
	id: "emoji-charades",
	title: "Emoji Charades",
	engine: EMOJI_CHARADES_ENGINE,
	renderBoard: ({ state, myTurn, onMove, mySeat }) => (
		<EmojiCharadesBoard
			state={state}
			mySeat={mySeat}
			myTurn={myTurn}
			onMove={onMove}
		/>
	),
	renderSeatBadge: () => null,
	// Board handles phase-aware status (revealer/guesser/reveal/summary).
	renderStatus: () => null,
};

const twoTruthsAdapter: GameAdapter<TwoTruthsState> = {
	id: "two-truths",
	title: "Two Truths & a Lie",
	engine: TWO_TRUTHS_ENGINE,
	renderBoard: ({
		state,
		myTurn,
		onMove,
		mySeat,
		sendCustomEvent,
		setGameState,
	}) => (
		<TwoTruthsBoard
			state={state}
			mySeat={mySeat}
			myTurn={myTurn}
			onMove={onMove}
			sendCustomEvent={sendCustomEvent}
			setGameState={setGameState}
		/>
	),
	renderSeatBadge: () => null,
	// Custom-event handlers: `statements` delivers the reader's three
	// written statements (transitioning composing → guessing), and
	// `reveal` delivers the lie index (transitioning guessing →
	// revealed with score applied). Both are only received by the
	// non-sender (hook filters self-sent events).
	getCustomEvents: (setGameState) => ({
		statements: (payload) => {
			const data = payload as { statements?: unknown } | null;
			const s = data?.statements;
			if (
				!Array.isArray(s) ||
				s.length !== 3 ||
				!s.every((v): v is string => typeof v === "string")
			) {
				return;
			}
			const statements = [s[0], s[1], s[2]] as [string, string, string];
			setGameState((prev) => (prev ? applyStatements(prev, statements) : prev));
		},
		reveal: (payload) => {
			const data = payload as { lieIdx?: unknown } | null;
			const idx = data?.lieIdx;
			if (idx !== 0 && idx !== 1 && idx !== 2) return;
			setGameState((prev) =>
				prev ? applyReveal(prev, idx as TwoTruthsPick) : prev,
			);
		},
	}),
	// Board handles phase-aware status (reader/guesser/reveal/summary).
	renderStatus: () => null,
};

const drawAndGuessAdapter: GameAdapter<DrawAndGuessState> = {
	id: "drawing",
	title: "Draw & Guess",
	engine: DRAW_AND_GUESS_ENGINE,
	renderBoard: ({
		state,
		myTurn,
		onMove,
		mySeat,
		sendCustomEvent,
		setGameState,
	}) => (
		<DrawAndGuessBoard
			state={state}
			mySeat={mySeat}
			myTurn={myTurn}
			onMove={onMove}
			sendCustomEvent={sendCustomEvent}
			setGameState={setGameState}
		/>
	),
	renderSeatBadge: () => null,
	// Two kinds of events:
	//   - `round_setup` / `reveal`: mutate shared state (applied via
	//     `setGameState` + engine reducers).
	//   - `stroke_start` / `stroke_point` / `stroke_end` / `clear` /
	//     `undo`: mutate the board's local canvas refs. We
	//     forward these to the board via `dispatchBoardEvent`, which
	//     looks up the handler map the board registers on mount.
	getCustomEvents: (setGameState, sendCustomEvent) => {
		const forward =
			(event: string): CustomEventHandler =>
			(payload) => {
				dispatchBoardEvent(sendCustomEvent, event, payload);
			};
		return {
			round_setup: (payload) => {
				const data = payload as {
					options?: unknown;
					difficulty?: unknown;
				} | null;
				const opts = data?.options;
				if (
					!Array.isArray(opts) ||
					opts.length !== 4 ||
					!opts.every((v): v is string => typeof v === "string")
				) {
					return;
				}
				const rawDiff = data?.difficulty;
				const difficulty =
					rawDiff === "easy" || rawDiff === "medium" || rawDiff === "hard"
						? rawDiff
						: "easy";
				const options = [opts[0], opts[1], opts[2], opts[3]] as [
					string,
					string,
					string,
					string,
				];
				setGameState((prev) =>
					prev ? applyRoundSetup(prev, options, difficulty) : prev,
				);
			},
			reveal: (payload) => {
				const data = payload as { correctIdx?: unknown } | null;
				const idx = data?.correctIdx;
				if (idx !== 0 && idx !== 1 && idx !== 2 && idx !== 3) return;
				setGameState((prev) =>
					prev ? applyDrawReveal(prev, idx as DrawAndGuessPick) : prev,
				);
			},
			stroke_start: forward("stroke_start"),
			stroke_point: forward("stroke_point"),
			stroke_end: forward("stroke_end"),
			clear: forward("clear"),
			undo: forward("undo"),
		};
	},
	// Board handles phase-aware status.
	renderStatus: () => null,
};

// biome-ignore lint/suspicious/noExplicitAny: Adapter state types differ per game.
const REGISTRY: Record<string, GameAdapter<any>> = {
	"tic-tac-toe": ticTacToeAdapter,
	"would-you-rather": wouldYouRatherAdapter,
	"rock-paper-scissors": rockPaperScissorsAdapter,
	trivia: triviaAdapter,
	"two-truths": twoTruthsAdapter,
	"emoji-charades": emojiCharadesAdapter,
	drawing: drawAndGuessAdapter,
};

export function getGameAdapter(
	gameId: string,
): // biome-ignore lint/suspicious/noExplicitAny: Callers treat state as opaque.
GameAdapter<any> | null {
	return REGISTRY[gameId] ?? null;
}
