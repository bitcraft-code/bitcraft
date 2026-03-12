import {
  type BaseGameSettings,
  type GameSession,
  createGameSession,
  updateGameSession,
} from "@bitcraft/game-core";

export interface TemplateState {
  level: number;
  moves: number;
  title: string;
  description: string;
  statusMessage: string;
}

export interface TemplateSettings extends BaseGameSettings {
  showDebugInfo: boolean;
}

export type TemplateSession = GameSession<TemplateState, TemplateSettings>;

export const defaultTemplateSettings: TemplateSettings = {
  analyticsEnabled: true,
  soundEnabled: true,
  reducedMotion: false,
  showDebugInfo: false,
};

const createInitialState = (): TemplateState => ({
  level: 1,
  moves: 0,
  title: "Puzzle",
  description: "Complete levels with limited moves. Replace with real puzzle logic.",
  statusMessage: "Puzzle starter ready.",
});

export const createTemplateSession = (
  highScore = 0,
  settings: TemplateSettings = defaultTemplateSettings,
): TemplateSession =>
  createGameSession({
    initialState: createInitialState(),
    settings,
    highScore,
    status: "idle",
  });

export const refreshTemplateSession = (
  session: TemplateSession,
): TemplateSession =>
  updateGameSession(session, {
    state: {
      ...session.state,
      level: 1,
      moves: 0,
      statusMessage: "Session reset. Implement puzzle rules here.",
    },
    status: "idle",
    moves: 0,
  });
