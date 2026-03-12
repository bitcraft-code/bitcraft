import {
  createGameOpenedEvent as createGameOpenedEventBase,
  createGameStartedEvent as createGameStartedEventBase,
  createGamePausedEvent as createGamePausedEventBase,
  createGameResumedEvent as createGameResumedEventBase,
  createGameOverEvent as createGameOverEventBase,
  standardGameEventNames,
} from "@bitcraft/analytics";

export const gameAnalyticsEventNames = {
  game_opened: standardGameEventNames.appOpened,
  game_started: standardGameEventNames.gameStarted,
  game_paused: standardGameEventNames.gamePaused,
  game_resumed: standardGameEventNames.gameResumed,
  game_over: standardGameEventNames.gameOver,
  high_score_updated: "high_score_updated",
  ad_reward_claimed: "ad_reward_claimed",
  purchase_completed: standardGameEventNames.purchaseCompleted,
} as const;

export const createGameOpenedEvent = (params?: Record<string, string | number | boolean | null>) =>
  createGameOpenedEventBase("bitsnake", params);
export const createGameStartedEvent = (params?: Record<string, string | number | boolean | null>) =>
  createGameStartedEventBase("bitsnake", params);
export const createGameOverEvent = (params?: Record<string, string | number | boolean | null>) =>
  createGameOverEventBase("bitsnake", params);
export const createGamePausedEvent = (params?: Record<string, string | number | boolean | null>) =>
  createGamePausedEventBase("bitsnake", params);
export const createGameResumedEvent = (params?: Record<string, string | number | boolean | null>) =>
  createGameResumedEventBase("bitsnake", params);
