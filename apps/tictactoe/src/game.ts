import {
  type BaseGameSettings,
  type GameSession,
  createGameSession,
  endGameSession,
  ensureHighScore,
  updateGameSession,
} from "@bitcraft/game-core";

export type TicTacToeMark = "X" | "O";
export type TicTacToeCell = TicTacToeMark | null;

export interface TicTacToeState {
  board: TicTacToeCell[];
  currentPlayer: TicTacToeMark;
  winner: TicTacToeMark | null;
  winningLine: number[];
  message: string;
}

export interface TicTacToeSettings extends BaseGameSettings {
  showMoveHints: boolean;
}

export type TicTacToeSession = GameSession<TicTacToeState, TicTacToeSettings>;

const winningLines: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const defaultTicTacToeSettings: TicTacToeSettings = {
  analyticsEnabled: true,
  soundEnabled: true,
  reducedMotion: false,
  showMoveHints: true,
};

const createInitialState = (): TicTacToeState => ({
  board: Array.from({ length: 9 }, () => null),
  currentPlayer: "X",
  winner: null,
  winningLine: [],
  message: "Vez do jogador X.",
});

const getWinningLine = (board: TicTacToeCell[]): number[] | null => {
  for (const line of winningLines) {
    const [a, b, c] = line;
    const first = board[a];

    if (first && first === board[b] && first === board[c]) {
      return [...line];
    }
  }

  return null;
};

export const createTicTacToeSession = (
  highScore = 0,
  settings: TicTacToeSettings = defaultTicTacToeSettings,
  score = 0,
): TicTacToeSession =>
  createGameSession({
    initialState: createInitialState(),
    settings,
    highScore,
    score,
    status: "playing",
  });

export const playTicTacToeMove = (
  session: TicTacToeSession,
  index: number,
): TicTacToeSession => {
  if (session.status !== "playing" || session.state.board[index]) {
    return session;
  }

  const board = [...session.state.board];
  board[index] = session.state.currentPlayer;
  const winningLine = getWinningLine(board);

  if (winningLine) {
    const nextScore = session.score + 1;

    return endGameSession(
      updateGameSession(session, {
        score: nextScore,
        highScore: ensureHighScore(session.highScore, nextScore),
        moves: session.moves + 1,
        state: {
          board,
          currentPlayer: session.state.currentPlayer,
          winner: session.state.currentPlayer,
          winningLine,
          message: `Jogador ${session.state.currentPlayer} venceu.`,
        },
      }),
      "won",
      nextScore,
    );
  }

  if (board.every(Boolean)) {
    return endGameSession(
      updateGameSession(session, {
        moves: session.moves + 1,
        state: {
          board,
          currentPlayer: session.state.currentPlayer,
          winner: null,
          winningLine: [],
          message: "Empate.",
        },
      }),
      "draw",
      session.score,
    );
  }

  const nextPlayer: TicTacToeMark = session.state.currentPlayer === "X" ? "O" : "X";

  return updateGameSession(session, {
    moves: session.moves + 1,
    state: {
      board,
      currentPlayer: nextPlayer,
      winner: null,
      winningLine: [],
      message: `Vez do jogador ${nextPlayer}.`,
    },
  });
};

export const startNextTicTacToeRound = (
  session: TicTacToeSession,
): TicTacToeSession => {
  const nextSession = createTicTacToeSession(
    session.highScore,
    session.settings,
    session.score,
  );

  return updateGameSession(nextSession, {
    state: {
      ...nextSession.state,
      message: "Nova rodada. Jogador X comeca.",
    },
  });
};

export const resetTicTacToeScore = (
  session: TicTacToeSession,
): TicTacToeSession =>
  createTicTacToeSession(session.highScore, session.settings, 0);
