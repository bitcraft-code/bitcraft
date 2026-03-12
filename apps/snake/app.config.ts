import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Bitcraft Snake",
  slug: "snake",
  scheme: "bitcraft-snake",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  ios: {
    bundleIdentifier: "br.dev.bitcraft.snake",
  },
  android: {
    package: "br.dev.bitcraft.snake",
  },
};

export default config;
