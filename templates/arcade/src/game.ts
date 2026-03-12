import {
  type BaseGameSettings,
  type GameSession,
  createGameSession,
  updateGameSession,
} from "@bitcraft/game-core";

export interface TemplateState {
  score: number;
  lives: number;
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
  score: 0,
  lives: 3,
  title: "Arcade",
  description: "Score points, avoid obstacles. Replace with real arcade gameplay.",
  statusMessage: "Arcade starter ready.",
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
      score: 0,
      lives: 3,
      statusMessage: "Session reset. Implement arcade rules here.",
    },
    status: "idle",
    moves: 0,
  });
