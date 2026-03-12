import {
  type BaseGameSettings,
  type GameSession,
  createGameSession,
  updateGameSession,
} from "@bitcraft/game-core";

export interface TemplateState {
  distance: number;
  speed: number;
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
  distance: 0,
  speed: 1,
  title: "Runner",
  description: "Run as far as you can. Replace with real endless runner gameplay.",
  statusMessage: "Runner starter ready.",
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
      distance: 0,
      speed: 1,
      statusMessage: "Session reset. Implement runner rules here.",
    },
    status: "idle",
    moves: 0,
  });
