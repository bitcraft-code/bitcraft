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
  createMockAnalyticsProvider,
  createPurchaseCompletedEvent,
  createSettingsUpdatedEvent,
} from "@bitcraft/analytics";
import { createMockMonetization } from "@bitcraft/monetization";
import { createAsyncStorageAdapter, createHighScoreStore, createSettingsStore } from "@bitcraft/storage";

import {
  createTicTacToeSession,
  defaultTicTacToeSettings,
  playTicTacToeMove,
  resetTicTacToeScore,
  startNextTicTacToeRound,
  type TicTacToeSession,
  type TicTacToeSettings,
} from "./game";

interface TicTacToeContextValue {
  ready: boolean;
  session: TicTacToeSession;
  settings: TicTacToeSettings;
  playMove: (index: number) => void;
  nextRound: () => void;
  resetScore: () => void;
  updateSetting: <K extends keyof TicTacToeSettings>(
    key: K,
    value: TicTacToeSettings[K],
  ) => void;
  previewPremiumOffer: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const TicTacToeContext = createContext<TicTacToeContextValue | null>(null);

export const TicTacToeProvider = ({ children }: { children: ReactNode }) => {
  const analytics = useMemo(
    () => createAnalyticsClient(createMockAnalyticsProvider("tictactoe")),
    [],
  );
  const monetization = useMemo(
    () =>
      createMockMonetization({
        namespace: "tictactoe",
        products: [
          {
            id: "tictactoe.remove-ads",
            title: "Tic Tac Toe Premium",
            description: "Compra simulada para validar o contrato de IAP.",
            priceLabel: "R$ 4,90",
          },
        ],
      }),
    [],
  );
  const storage = useMemo(() => createAsyncStorageAdapter("tictactoe"), []);
  const settingsStore = useMemo(
    () => createSettingsStore<TicTacToeSettings>(storage),
    [storage],
  );
  const highScoreStore = useMemo(() => createHighScoreStore(storage), [storage]);

  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(defaultTicTacToeSettings);
  const [session, setSession] = useState<TicTacToeSession>(() =>
    createTicTacToeSession(0, defaultTicTacToeSettings),
  );
  const previousStatusRef = useRef(session.status);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [savedSettings, savedHighScore] = await Promise.all([
          settingsStore.load(defaultTicTacToeSettings),
          highScoreStore.load(),
        ]);

        if (!active) {
          return;
        }

        analytics.setEnabled(savedSettings.analyticsEnabled);
        setSettings(savedSettings);
        setSession(createTicTacToeSession(savedHighScore, savedSettings));
        await analytics.trackEvent(
          createGameOpenedEvent("tictactoe", {
            highScore: savedHighScore,
          }),
        );
      } catch (error) {
        console.error("[tictactoe] load", error);
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
      console.error("[tictactoe] saveHighScore", error);
    });
  }, [highScoreStore, ready, session.highScore]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    analytics.setEnabled(settings.analyticsEnabled);

    void settingsStore.save(settings).catch((error) => {
      console.error("[tictactoe] saveSettings", error);
    });
  }, [analytics, ready, settings, settingsStore]);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;

    if (previousStatus === "playing" && session.status === "gameOver") {
      void analytics.trackEvent(
        createGameOverEvent("tictactoe", {
          result: session.result ?? "draw",
          score: session.score,
        }),
      );
      void monetization.ads.showInterstitial("tictactoe-round-finished");
    }

    previousStatusRef.current = session.status;
  }, [analytics, monetization.ads, session.result, session.score, session.status]);

  const playMove = (index: number) => {
    setSession((current) => playTicTacToeMove(current, index));
  };

  const nextRound = () => {
    setSession((current) => startNextTicTacToeRound(current));
  };

  const resetScore = () => {
    setSession((current) => resetTicTacToeScore(current));
  };

  const updateSetting = <K extends keyof TicTacToeSettings>(
    key: K,
    value: TicTacToeSettings[K],
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
        createSettingsUpdatedEvent("tictactoe", {
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
      createPurchaseCompletedEvent("tictactoe", {
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
    <TicTacToeContext.Provider
      value={{
        ready,
        session,
        settings,
        playMove,
        nextRound,
        resetScore,
        updateSetting,
        previewPremiumOffer,
        restorePurchases,
      }}
    >
      {children}
    </TicTacToeContext.Provider>
  );
};

export const useTicTacToeGame = () => {
  const context = useContext(TicTacToeContext);

  if (!context) {
    throw new Error("useTicTacToeGame precisa ser usado dentro de TicTacToeProvider.");
  }

  return context;
};
