import type { ExpoConfig } from "expo/config";

/**
 * OTA updates (optional): For real OTA rollout:
 * 1. Add dependency: expo-updates
 * 2. Set updates.url to your EAS Update URL, or use EAS Build so it is set automatically.
 * 3. Set runtimeVersion (e.g. version or native build version) so updates target the right runtime.
 * No secrets or env values are required for local development.
 */
const config: ExpoConfig = {
  name: "Bitcraft Template",
  slug: "template",
  scheme: "bitcraft-template",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
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
