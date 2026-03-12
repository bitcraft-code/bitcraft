import {
  type BaseGameSettings,
  type GameSession,
  createGameSession,
  endGameSession,
  ensureHighScore,
  updateGameSession,
} from "@bitcraft/game-core";

export type SnakeDirection = "up" | "down" | "left" | "right";

export interface SnakePosition {
  x: number;
  y: number;
}

export interface SnakeState {
  boardSize: number;
  snake: SnakePosition[];
  food: SnakePosition;
  direction: SnakeDirection;
  queuedDirection: SnakeDirection;
  message: string;
}

export interface SnakeSettings extends BaseGameSettings {
  difficulty: "easy" | "normal" | "hard";
}

export type SnakeSession = GameSession<SnakeState, SnakeSettings>;

const BOARD_SIZE = 8;

const difficultyTicks: Record<SnakeSettings["difficulty"], number> = {
  easy: 380,
  normal: 260,
  hard: 170,
};

export const defaultSnakeSettings: SnakeSettings = {
  analyticsEnabled: true,
  soundEnabled: true,
  reducedMotion: false,
  difficulty: "normal",
};

const isSamePosition = (left: SnakePosition, right: SnakePosition) =>
  left.x === right.x && left.y === right.y;

const isOppositeDirection = (
  current: SnakeDirection,
  next: SnakeDirection,
): boolean =>
  (current === "up" && next === "down") ||
  (current === "down" && next === "up") ||
  (current === "left" && next === "right") ||
  (current === "right" && next === "left");

const nextHeadPosition = (
  currentHead: SnakePosition,
  direction: SnakeDirection,
): SnakePosition => {
  switch (direction) {
    case "up":
      return { x: currentHead.x, y: currentHead.y - 1 };
    case "down":
      return { x: currentHead.x, y: currentHead.y + 1 };
    case "left":
      return { x: currentHead.x - 1, y: currentHead.y };
    case "right":
      return { x: currentHead.x + 1, y: currentHead.y };
  }
};

const randomFreeCell = (
  snake: SnakePosition[],
  boardSize: number,
): SnakePosition | null => {
  const freeCells: SnakePosition[] = [];

  for (let y = 0; y < boardSize; y += 1) {
    for (let x = 0; x < boardSize; x += 1) {
      const candidate = { x, y };

      if (!snake.some((segment) => isSamePosition(segment, candidate))) {
        freeCells.push(candidate);
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  return freeCells[Math.floor(Math.random() * freeCells.length)] ?? null;
};

const createInitialState = (): SnakeState => {
  const center = Math.floor(BOARD_SIZE / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  return {
    boardSize: BOARD_SIZE,
    snake,
    food: randomFreeCell(snake, BOARD_SIZE) ?? { x: 0, y: 0 },
    direction: "right",
    queuedDirection: "right",
    message: "Toque em iniciar para comecar.",
  };
};

export const getSnakeTickMs = (difficulty: SnakeSettings["difficulty"]) =>
  difficultyTicks[difficulty];

export const createSnakeSession = (
  highScore = 0,
  settings: SnakeSettings = defaultSnakeSettings,
  status: SnakeSession["status"] = "idle",
): SnakeSession =>
  createGameSession({
    initialState: createInitialState(),
    settings,
    highScore,
    status,
  });

export const startSnakeGame = (session: SnakeSession): SnakeSession => {
  const nextSession = createSnakeSession(session.highScore, session.settings, "playing");

  return updateGameSession(nextSession, {
    state: {
      ...nextSession.state,
      message: "Colete comida e evite bater.",
    },
  });
};

export const pauseSnakeGame = (session: SnakeSession): SnakeSession => {
  if (session.status !== "playing") {
    return session;
  }

  return updateGameSession(session, {
    status: "paused",
    state: {
      ...session.state,
      message: "Jogo pausado.",
    },
  });
};

export const resumeSnakeGame = (session: SnakeSession): SnakeSession => {
  if (session.status !== "paused") {
    return session;
  }

  return updateGameSession(session, {
    status: "playing",
    state: {
      ...session.state,
      message: "Continuando.",
    },
  });
};

export const setSnakeDirection = (
  session: SnakeSession,
  nextDirection: SnakeDirection,
): SnakeSession => {
  if (isOppositeDirection(session.state.direction, nextDirection)) {
    return session;
  }

  return updateGameSession(session, {
    state: {
      ...session.state,
      queuedDirection: nextDirection,
    },
  });
};

export const stepSnakeGame = (session: SnakeSession): SnakeSession => {
  if (session.status !== "playing") {
    return session;
  }

  const currentHead = session.state.snake[0];
  const nextDirection = session.state.queuedDirection;

  if (!currentHead) {
    return startSnakeGame(session);
  }

  const nextHead = nextHeadPosition(currentHead, nextDirection);
  const ateFood = isSamePosition(nextHead, session.state.food);
  const collisionTarget = ateFood
    ? session.state.snake
    : session.state.snake.slice(0, -1);

  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= session.state.boardSize ||
    nextHead.y >= session.state.boardSize;

  const hitBody = collisionTarget.some((segment) => isSamePosition(segment, nextHead));

  if (hitWall || hitBody) {
    return endGameSession(
      updateGameSession(session, {
        moves: session.moves + 1,
        state: {
          ...session.state,
          direction: nextDirection,
          queuedDirection: nextDirection,
          message: hitWall ? "Voce bateu na parede." : "Voce bateu no proprio corpo.",
        },
      }),
      "lost",
      session.score,
    );
  }

  const grownSnake = [nextHead, ...session.state.snake];
  const nextSnake = ateFood ? grownSnake : grownSnake.slice(0, -1);
  const nextScore = ateFood ? session.score + 10 : session.score;
  const nextFood = ateFood
    ? randomFreeCell(nextSnake, session.state.boardSize)
    : session.state.food;

  if (!nextFood) {
    return endGameSession(
      updateGameSession(session, {
        score: nextScore,
        highScore: ensureHighScore(session.highScore, nextScore),
        moves: session.moves + 1,
        state: {
          ...session.state,
          snake: nextSnake,
          direction: nextDirection,
          queuedDirection: nextDirection,
          message: "Tabuleiro completo. Vitoria.",
        },
      }),
      "won",
      nextScore,
    );
  }

  return updateGameSession(session, {
    score: nextScore,
    highScore: ensureHighScore(session.highScore, nextScore),
    moves: session.moves + 1,
    state: {
      ...session.state,
      snake: nextSnake,
      food: nextFood,
      direction: nextDirection,
      queuedDirection: nextDirection,
      message: ateFood ? "Boa. Continue crescendo." : "Mantendo o ritmo.",
    },
  });
};
