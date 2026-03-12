import { Stack } from "expo-router";

import { colors } from "@bitcraft/app-shell";

import { SnakeGameProvider } from "../src/SnakeGameProvider";

export default function RootLayout() {
  return (
    <SnakeGameProvider>
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
        <Stack.Screen name="index" options={{ title: "Snake" }} />
        <Stack.Screen name="settings" options={{ title: "Configuracoes" }} />
      </Stack>
    </SnakeGameProvider>
  );
}
