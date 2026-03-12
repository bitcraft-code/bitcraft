import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Alert } from "react-native";

import {
  createAnalyticsClient,
  createGameOpenedEvent,
  createGameOverEvent,
  createGamePausedEvent,
  createGameResumedEvent,
  createGameStartedEvent,
  createMockAnalyticsProvider,
  createPurchaseCompletedEvent,
  createSettingsUpdatedEvent,
} from "@bitcraft/analytics";
import { createMockMonetization } from "@bitcraft/monetization";
import { createAsyncStorageAdapter, createHighScoreStore, createSettingsStore } from "@bitcraft/storage";

import {
  createSnakeSession,
  defaultSnakeSettings,
  getSnakeTickMs,
  pauseSnakeGame,
  resumeSnakeGame,
  setSnakeDirection,
  startSnakeGame,
  stepSnakeGame,
  type SnakeDirection,
  type SnakeSession,
  type SnakeSettings,
} from "./game";

interface SnakeGameContextValue {
  ready: boolean;
  session: SnakeSession;
  settings: SnakeSettings;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  setDirection: (direction: SnakeDirection) => void;
  updateSetting: <K extends keyof SnakeSettings>(
    key: K,
    value: SnakeSettings[K],
  ) => void;
  previewPremiumOffer: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const SnakeGameContext = createContext<SnakeGameContextValue | null>(null);

export const SnakeGameProvider = ({ children }: { children: ReactNode }) => {
  const analytics = useMemo(
    () => createAnalyticsClient(createMockAnalyticsProvider("snake")),
    [],
  );
  const monetization = useMemo(
    () =>
      createMockMonetization({
        namespace: "snake",
        products: [
          {
            id: "snake.no-ads",
            title: "Snake Premium",
            description: "Remove anuncios mock e libera um badge premium.",
            priceLabel: "R$ 9,90",
          },
        ],
      }),
    [],
  );
  const storage = useMemo(() => createAsyncStorageAdapter("snake"), []);
  const settingsStore = useMemo(
    () => createSettingsStore<SnakeSettings>(storage),
    [storage],
  );
  const highScoreStore = useMemo(() => createHighScoreStore(storage), [storage]);

  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(defaultSnakeSettings);
  const [session, setSession] = useState<SnakeSession>(() =>
    createSnakeSession(0, defaultSnakeSettings),
  );
  const previousStatusRef = useRef(session.status);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [savedSettings, savedHighScore] = await Promise.all([
          settingsStore.load(defaultSnakeSettings),
          highScoreStore.load(),
        ]);

        if (!active) {
          return;
        }

        analytics.setEnabled(savedSettings.analyticsEnabled);
        setSettings(savedSettings);
        setSession(createSnakeSession(savedHighScore, savedSettings));
        await analytics.trackEvent(
          createGameOpenedEvent("snake", {
            highScore: savedHighScore,
          }),
        );
      } catch (error) {
        console.error("[snake] load", error);
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [analytics, highScoreStore, settingsStore]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    void highScoreStore.save(session.highScore).catch((error) => {
      console.error("[snake] saveHighScore", error);
    });
  }, [highScoreStore, ready, session.highScore]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    analytics.setEnabled(settings.analyticsEnabled);

    void settingsStore.save(settings).catch((error) => {
      console.error("[snake] saveSettings", error);
    });
  }, [analytics, ready, settings, settingsStore]);

  useEffect(() => {
    if (!ready || session.status !== "playing") {
      return;
    }

    const timer = setInterval(() => {
      setSession((current) => stepSnakeGame(current));
    }, getSnakeTickMs(settings.difficulty));

    return () => {
      clearInterval(timer);
    };
  }, [ready, session.status, settings.difficulty]);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;

    if (previousStatus === "playing" && session.status === "gameOver") {
      void analytics.trackEvent(
        createGameOverEvent("snake", {
          score: session.score,
          result: session.result ?? "lost",
        }),
      );
      void monetization.ads.showInterstitial("snake-game-finished");
    }

    previousStatusRef.current = session.status;
  }, [analytics, monetization.ads, session.result, session.score, session.status]);

  const startGame = () => {
    void analytics.trackEvent(createGameStartedEvent("snake"));
    setSession((current) => startSnakeGame(current));
  };

  const pauseGame = () => {
    void analytics.trackEvent(createGamePausedEvent("snake"));
    setSession((current) => pauseSnakeGame(current));
  };

  const resumeGame = () => {
    void analytics.trackEvent(createGameResumedEvent("snake"));
    setSession((current) => resumeSnakeGame(current));
  };

  const restartGame = () => {
    setSession((current) => startSnakeGame(current));
  };

  const setDirection = (direction: SnakeDirection) => {
    setSession((current) => setSnakeDirection(current, direction));
  };

  const updateSetting = <K extends keyof SnakeSettings>(
    key: K,
    value: SnakeSettings[K],
  ) => {
    setSettings((current) => {
      const nextSettings = {
        ...current,
        [key]: value,
      };

      setSession((currentSession) => ({
        ...currentSession,
        settings: nextSettings,
        updatedAt: Date.now(),
      }));

      void analytics.trackEvent(
        createSettingsUpdatedEvent("snake", {
          setting: String(key),
        }),
      );

      return nextSettings;
    });
  };

  const previewPremiumOffer = async () => {
    const [product] = await monetization.purchases.listProducts();

    if (!product) {
      Alert.alert("Oferta mock", "Nenhum produto cadastrado.");
      return;
    }

    const result = await monetization.purchases.purchase(product.id);

    await analytics.trackEvent(
      createPurchaseCompletedEvent("snake", {
        productId: result.productId,
        success: result.success,
      }),
    );

    Alert.alert(
      product.title,
      `${product.priceLabel}\n\n${product.description}\n\n${result.message}`,
    );
  };

  const restorePurchases = async () => {
    await monetization.purchases.restorePurchases();
    Alert.alert("Compras mock", "Restauro simulado com sucesso.");
  };

  return (
    <SnakeGameContext.Provider
      value={{
        ready,
        session,
        settings,
        startGame,
        pauseGame,
        resumeGame,
        restartGame,
        setDirection,
        updateSetting,
        previewPremiumOffer,
        restorePurchases,
      }}
    >
      {children}
    </SnakeGameContext.Provider>
  );
};

export const useSnakeGame = () => {
  const context = useContext(SnakeGameContext);

  if (!context) {
    throw new Error("useSnakeGame precisa ser usado dentro de SnakeGameProvider.");
  }

  return context;
};
