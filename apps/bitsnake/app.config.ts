import type { ExpoConfig } from "expo/config";

/**
 * OTA updates (optional): For real OTA rollout add expo-updates, set updates.url and runtimeVersion.
 */
const config: ExpoConfig = {
  icon: "./assets/icon.png",
  splash: { image: "./assets/splash.png", resizeMode: "contain", backgroundColor: "#ffffff" },
    name: "Bitcraft Bitsnake",
  slug: "bitsnake",
  scheme: "bitcraft-bitsnake",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router"],
  experiments: { typedRoutes: true },
  // updates: { url: "https://u.expo.dev/...", enabled: true },
  // runtimeVersion: { policy: "appVersion" },
  ios: {
    bundleIdentifier: "br.dev.bitcraft.bitsnake",
  },
  android: {
    adaptiveIcon: { foregroundImage: "./assets/adaptive-icon.png", backgroundColor: "#ffffff" },
    package: "br.dev.bitcraft.bitsnake",
  },
  web: { favicon: "./assets/favicon.png" },
};

export default config;
