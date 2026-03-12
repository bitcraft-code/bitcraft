import { Stack } from "expo-router";

import { colors } from "@bitcraft/app-shell";

import { TicTacToeProvider } from "../src/TicTacToeProvider";

export default function RootLayout() {
  return (
    <TicTacToeProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.panel,
          },
          headerTintColor: colors.text,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Tic Tac Toe" }} />
        <Stack.Screen name="settings" options={{ title: "Configuracoes" }} />
      </Stack>
    </TicTacToeProvider>
  );
}
