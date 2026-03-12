import type { ExpoConfig } from "expo/config";

/**
 * OTA updates (optional): For real OTA rollout add expo-updates, set updates.url and runtimeVersion.
 */
const config: ExpoConfig = {
  name: "Bitcraft Template",
  slug: "template",
  scheme: "bitcraft-template",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router"],
  experiments: { typedRoutes: true },
  // updates: { url: "https://u.expo.dev/...", enabled: true },
  // runtimeVersion: { policy: "appVersion" },
  ios: {
    bundleIdentifier: "br.dev.bitcraft.template",
  },
  android: {
    package: "br.dev.bitcraft.template",
  },
};

export default config;
