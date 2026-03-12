export type GameStatus = "idle" | "playing" | "paused" | "gameOver";
export type GameResult = "won" | "lost" | "draw" | null;

export interface BaseGameSettings {
  analyticsEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface GameSession<TState, TSettings> {
  state: TState;
  settings: TSettings;
  status: GameStatus;
  result: GameResult;
  score: number;
  highScore: number;
  moves: number;
  startedAt: number;
  updatedAt: number;
}

export interface CreateGameSessionOptions<TState, TSettings> {
  initialState: TState;
  settings: TSettings;
  highScore?: number;
  score?: number;
  status?: GameStatus;
  result?: GameResult;
  moves?: number;
}

export type Unsubscribe = () => void;

export const mergeSettings = <TSettings extends object>(
  defaults: TSettings,
  overrides?: Partial<TSettings> | null,
): TSettings => ({
  ...defaults,
  ...(overrides ?? {}),
});

export const ensureHighScore = (
  currentHighScore: number,
  nextScore: number,
): number => Math.max(currentHighScore, nextScore);

export const incrementScore = (score: number, points: number) => score + points;

export const resetScore = () => 0;

export const createGameSession = <TState, TSettings>({
  initialState,
  settings,
  highScore = 0,
  score = 0,
  status = "idle",
  result = null,
  moves = 0,
}: CreateGameSessionOptions<TState, TSettings>): GameSession<TState, TSettings> => {
  const now = Date.now();

  return {
    state: initialState,
    settings,
    status,
    result,
    score,
    highScore,
    moves,
    startedAt: now,
    updatedAt: now,
  };
};

export const updateGameSession = <TState, TSettings>(
  session: GameSession<TState, TSettings>,
  updates: Partial<GameSession<TState, TSettings>>,
): GameSession<TState, TSettings> => ({
  ...session,
  ...updates,
  updatedAt: Date.now(),
});

export const startGameSession = <TState, TSettings>(
  session: GameSession<TState, TSettings>,
  nextState?: TState,
): GameSession<TState, TSettings> => {
  const now = Date.now();

  return {
    ...session,
    state: nextState ?? session.state,
    status: "playing",
    result: null,
    moves: 0,
    score: 0,
    startedAt: now,
    updatedAt: now,
  };
};

export const pauseGameSession = <TState, TSettings>(
  session: GameSession<TState, TSettings>,
): GameSession<TState, TSettings> =>
  session.status !== "playing"
    ? session
    : updateGameSession(session, {
        status: "paused",
      });

export const resumeGameSession = <TState, TSettings>(
  session: GameSession<TState, TSettings>,
): GameSession<TState, TSettings> =>
  session.status !== "paused"
    ? session
    : updateGameSession(session, {
        status: "playing",
      });

export const endGameSession = <TState, TSettings>(
  session: GameSession<TState, TSettings>,
  result: Exclude<GameResult, null>,
  score: number,
): GameSession<TState, TSettings> =>
  updateGameSession(session, {
    status: "gameOver",
    result,
    score,
    highScore: ensureHighScore(session.highScore, score),
  });

export const getElapsedTimeMs = <TState, TSettings>(
  session: GameSession<TState, TSettings>,
  now = Date.now(),
): number => Math.max(0, now - session.startedAt);

export const formatDurationMs = (durationMs: number): string => {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
};

export const createIntervalTicker = (
  callback: () => void,
  intervalMs: number,
) => {
  let timer: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      if (timer) {
        return;
      }

      timer = setInterval(callback, intervalMs);
    },
    stop() {
      if (!timer) {
        return;
      }

      clearInterval(timer);
      timer = null;
    },
    isRunning() {
      return timer !== null;
    },
  };
};

export interface CountdownOptions {
  durationMs: number;
  stepMs?: number;
  onTick: (remainingMs: number) => void;
  onComplete?: () => void;
}

export const createCountdown = ({
  durationMs,
  stepMs = 1000,
  onTick,
  onComplete,
}: CountdownOptions) => {
  let remainingMs = durationMs;
  let timer: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      if (timer) {
        return;
      }

      onTick(remainingMs);

      timer = setInterval(() => {
        remainingMs = Math.max(0, remainingMs - stepMs);
        onTick(remainingMs);

        if (remainingMs === 0) {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }

          onComplete?.();
        }
      }, stepMs);
    },
    reset(nextDurationMs = durationMs) {
      remainingMs = nextDurationMs;
    },
    stop() {
      if (!timer) {
        return;
      }

      clearInterval(timer);
      timer = null;
    },
  };
};

export const createEventChannel = <TEvent>() => {
  const listeners = new Set<(event: TEvent) => void>();

  return {
    emit(event: TEvent) {
      listeners.forEach((listener) => {
        listener(event);
      });
    },
    subscribe(listener: (event: TEvent) => void): Unsubscribe {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    clear() {
      listeners.clear();
    },
  };
};
