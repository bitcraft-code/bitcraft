import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Alert } from "react-native";

import {
  createAnalyticsClient,
  createGameOpenedEvent,
  createMockAnalyticsProvider,
  createPurchaseCompletedEvent,
  createSettingsUpdatedEvent,
} from "@bitcraft/analytics";
import { createMockMonetization } from "@bitcraft/monetization";
import { createAsyncStorageAdapter, createHighScoreStore, createSettingsStore } from "@bitcraft/storage";

import {
  createTemplateSession,
  defaultTemplateSettings,
  refreshTemplateSession,
  type TemplateSession,
  type TemplateSettings,
} from "./game";

interface TemplateGameContextValue {
  ready: boolean;
  session: TemplateSession;
  settings: TemplateSettings;
  resetTemplate: () => void;
  updateSetting: <K extends keyof TemplateSettings>(
    key: K,
    value: TemplateSettings[K],
  ) => void;
  previewPremiumOffer: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  trackSetupEvent: () => Promise<void>;
}

const TemplateGameContext = createContext<TemplateGameContextValue | null>(null);

export const BitsnakeGameProvider = ({ children }: { children: ReactNode }) => {
  const analytics = useMemo(
    () => createAnalyticsClient(createMockAnalyticsProvider("bitsnake")),
    [],
  );
  const monetization = useMemo(
    () =>
      createMockMonetization({
        namespace: "bitsnake",
        products: [
          {
            id: "bitsnake.premium",
            title: "Bitsnake Premium",
            description: "Mock product used to validate the IAP integration.",
            priceLabel: "R$ 1,99",
          },
        ],
      }),
    [],
  );
  const storage = useMemo(() => createAsyncStorageAdapter("bitsnake"), []);
  const settingsStore = useMemo(
    () => createSettingsStore<TemplateSettings>(storage),
    [storage],
  );
  const highScoreStore = useMemo(() => createHighScoreStore(storage), [storage]);

  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(defaultTemplateSettings);
  const [session, setSession] = useState<TemplateSession>(() =>
    createTemplateSession(0, defaultTemplateSettings),
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [savedSettings, savedHighScore] = await Promise.all([
          settingsStore.load(defaultTemplateSettings),
          highScoreStore.load(),
        ]);

        if (!active) {
          return;
        }

        analytics.setEnabled(savedSettings.analyticsEnabled);
        setSettings(savedSettings);
        setSession(createTemplateSession(savedHighScore, savedSettings));
        await analytics.trackEvent(
          createGameOpenedEvent("bitsnake", {
            highScore: savedHighScore,
          }),
        );
      } catch (error) {
        console.error("[bitsnake] load", error);
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

    analytics.setEnabled(settings.analyticsEnabled);

    void settingsStore.save(settings).catch((error) => {
      console.error("[bitsnake] saveSettings", error);
    });
  }, [analytics, ready, settings, settingsStore]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    void highScoreStore.save(session.highScore).catch((error) => {
      console.error("[bitsnake] saveHighScore", error);
    });
  }, [highScoreStore, ready, session.highScore]);

  const resetTemplate = () => {
    setSession((current) => refreshTemplateSession(current));
  };

  const updateSetting = <K extends keyof TemplateSettings>(
    key: K,
    value: TemplateSettings[K],
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
        createSettingsUpdatedEvent("bitsnake", {
          setting: String(key),
        }),
      );

      return nextSettings;
    });
  };

  const previewPremiumOffer = async () => {
    const [product] = await monetization.purchases.listProducts();

    if (!product) {
      Alert.alert("Mock offer", "No product is configured.");
      return;
    }

    const result = await monetization.purchases.purchase(product.id);

    await analytics.trackEvent(
      createPurchaseCompletedEvent("bitsnake", {
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
    Alert.alert("Mock purchases", "Restore completed successfully.");
  };

  const trackSetupEvent = async () => {
    await analytics.track("bitsnake.setup_event", {
      showDebugInfo: settings.showDebugInfo,
    });
    Alert.alert("Mock analytics", "Setup event sent to the console.");
  };

  return (
    <TemplateGameContext.Provider
      value={{
        ready,
        session,
        settings,
        resetTemplate,
        updateSetting,
        previewPremiumOffer,
        restorePurchases,
        trackSetupEvent,
      }}
    >
      {children}
    </TemplateGameContext.Provider>
  );
};

export const useBitsnakeGame = () => {
  const context = useContext(TemplateGameContext);

  if (!context) {
    throw new Error("useBitsnakeGame must be used inside BitsnakeGameProvider.");
  }

  return context;
};
