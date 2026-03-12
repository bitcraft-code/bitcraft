import AsyncStorage from "@react-native-async-storage/async-storage";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const createNamespacedKey = (namespace: string, key: string) => `${namespace}:${key}`;

export const createAsyncStorageAdapter = (namespace: string): StorageAdapter => ({
  async getItem<T>(key: string) {
    const rawValue = await AsyncStorage.getItem(createNamespacedKey(namespace, key));

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  },
  async setItem<T>(key: string, value: T) {
    await AsyncStorage.setItem(
      createNamespacedKey(namespace, key),
      JSON.stringify(value),
    );
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(createNamespacedKey(namespace, key));
  },
});

export const createMemoryStorageAdapter = (
  seed: Record<string, unknown> = {},
): StorageAdapter => {
  const memory = new Map<string, unknown>(Object.entries(seed));

  return {
    async getItem<T>(key: string) {
      return (memory.get(key) as T | undefined) ?? null;
    },
    async setItem<T>(key: string, value: T) {
      memory.set(key, value);
    },
    async removeItem(key: string) {
      memory.delete(key);
    },
  };
};

const mergeObject = <T extends object>(
  defaults: T,
  overrides?: Partial<T> | null,
): T => ({
  ...defaults,
  ...(overrides ?? {}),
});

export const createSettingsStore = <TSettings extends object>(
  storage: StorageAdapter,
  key = "settings",
) => ({
  async load(defaults: TSettings): Promise<TSettings> {
    const saved = await storage.getItem<Partial<TSettings>>(key);

    return mergeObject(defaults, saved);
  },
  async save(settings: TSettings) {
    await storage.setItem<TSettings>(key, settings);
  },
  async clear() {
    await storage.removeItem(key);
  },
});

export const createHighScoreStore = (
  storage: StorageAdapter,
  key = "high-score",
) => ({
  async load(): Promise<number> {
    return (await storage.getItem<number>(key)) ?? 0;
  },
  async save(score: number): Promise<number> {
    await storage.setItem<number>(key, score);
    return score;
  },
  async clear() {
    await storage.removeItem(key);
  },
});

export const createProgressStore = <TProgress extends object>(
  storage: StorageAdapter,
  key = "progress",
) => ({
  async load(defaults: TProgress): Promise<TProgress> {
    const saved = await storage.getItem<Partial<TProgress>>(key);

    return mergeObject(defaults, saved);
  },
  async save(progress: TProgress) {
    await storage.setItem<TProgress>(key, progress);
  },
  async clear() {
    await storage.removeItem(key);
  },
});
