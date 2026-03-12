import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Bitcraft Flappy",
  slug: "flappy",
  scheme: "bitcraft-flappy",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  ios: {
    bundleIdentifier: "br.dev.bitcraft.flappy",
  },
  android: {
    package: "br.dev.bitcraft.flappy",
  },
};

export default config;
