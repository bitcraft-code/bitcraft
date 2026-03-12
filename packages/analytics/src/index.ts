export type PrimitiveValue = string | number | boolean | null;
export type AnalyticsParams = Record<string, PrimitiveValue>;

/**
 * Shared telemetry schema for cross-game analytics.
 * Include these fields in event params where relevant so metrics are comparable.
 */
export interface TelemetryContext {
  gameId?: string;
  genre?: string;
  sessionId?: string;
  userId?: string;
  buildVersion?: string;
  platform?: string;
  country?: string;
  theme?: string;
  language?: string;
  timestamp?: string;
}

export function withTelemetryContext(
  params: AnalyticsParams | undefined,
  context: TelemetryContext,
): AnalyticsParams {
  return {
    ...context,
    ...params,
    timestamp: (params?.timestamp as string) ?? context.timestamp ?? new Date().toISOString(),
  };
}

export const standardGameEventNames = {
  appOpened: "app_opened",
  gameStarted: "game_started",
  gamePaused: "game_paused",
  gameResumed: "game_resumed",
  gameOver: "game_over",
  settingsUpdated: "settings_updated",
  purchaseStarted: "purchase_started",
  purchaseCompleted: "purchase_completed",
  adImpression: "ad_impression",
  adInterstitialShown: "ad_interstitial_shown",
} as const;

export type StandardGameEventName =
  (typeof standardGameEventNames)[keyof typeof standardGameEventNames];

export interface AnalyticsEvent {
  name: StandardGameEventName | string;
  params?: AnalyticsParams;
}

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): Promise<void>;
  setEnabled(enabled: boolean): void;
}

export interface AnalyticsClient {
  track(name: StandardGameEventName | string, params?: AnalyticsParams): Promise<void>;
  trackEvent(event: AnalyticsEvent): Promise<void>;
  setEnabled(enabled: boolean): void;
}

export const createAnalyticsClient = (
  provider: AnalyticsProvider,
): AnalyticsClient => ({
  async track(name, params) {
    await provider.track(
      params
        ? {
            name,
            params,
          }
        : {
            name,
          },
    );
  },
  async trackEvent(event) {
    await provider.track(event);
  },
  setEnabled(enabled) {
    provider.setEnabled(enabled);
  },
});

export const createMockAnalyticsProvider = (
  namespace: string,
  initialEnabled = true,
): AnalyticsProvider => {
  let enabled = initialEnabled;

  return {
    async track(event) {
      if (!enabled) {
        return;
      }

      console.info(`[analytics:${namespace}] ${event.name}`, event.params ?? {});
    },
    setEnabled(nextEnabled) {
      enabled = nextEnabled;
    },
  };
};

export const createGameOpenedEvent = (
  gameId: string,
  params?: AnalyticsParams,
): AnalyticsEvent => ({
  name: standardGameEventNames.appOpened,
  params: {
    gameId,
    ...(params ?? {}),
  },
});

export const createGameStartedEvent = (
  gameId: string,
  params?: AnalyticsParams,
): AnalyticsEvent => ({
  name: standardGameEventNames.gameStarted,
  params: {
    gameId,
    ...(params ?? {}),
  },
});

export const createGamePausedEvent = (
  gameId: string,
  params?: AnalyticsParams,
): AnalyticsEvent => ({
  name: standardGameEventNames.gamePaused,
  params: {
    gameId,
    ...(params ?? {}),
  },
});

export const createGameResumedEvent = (
  gameId: string,
  params?: AnalyticsParams,
): AnalyticsEvent => ({
  name: standardGameEventNames.gameResumed,
  params: {
    gameId,
    ...(params ?? {}),
  },
});

export const createGameOverEvent = (
  gameId: string,
  params?: AnalyticsParams,
): AnalyticsEvent => ({
  name: standardGameEventNames.gameOver,
  params: {
    gameId,
    ...(params ?? {}),
  },
});

export const createSettingsUpdatedEvent = (
  gameId: string,
  params?: AnalyticsParams,
): AnalyticsEvent => ({
  name: standardGameEventNames.settingsUpdated,
  params: {
    gameId,
    ...(params ?? {}),
  },
});

export const createPurchaseCompletedEvent = (
  gameId: string,
  params?: AnalyticsParams,
): AnalyticsEvent => ({
  name: standardGameEventNames.purchaseCompleted,
  params: {
    gameId,
    ...(params ?? {}),
  },
});
