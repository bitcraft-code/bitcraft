import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Bitcraft Tic Tac Toe",
  slug: "tictactoe",
  scheme: "bitcraft-tictactoe",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  ios: {
    bundleIdentifier: "br.dev.bitcraft.tictactoe",
  },
  android: {
    package: "br.dev.bitcraft.tictactoe",
  },
};

export default config;
