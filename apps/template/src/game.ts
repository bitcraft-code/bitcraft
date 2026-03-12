import {
  type BaseGameSettings,
  type GameSession,
  createGameSession,
  updateGameSession,
} from "@bitcraft/game-core";

export interface TemplateState {
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
  title: "New game",
  description: "Replace this state with the real model for your next game.",
  statusMessage: "Template ready to customize.",
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
      statusMessage: "Session reset. Implement the real game rules here.",
    },
    status: "idle",
    moves: 0,
  });
