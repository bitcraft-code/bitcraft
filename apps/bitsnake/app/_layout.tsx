import { Stack } from "expo-router";

import { colors } from "@bitcraft/app-shell";

import { BitsnakeGameProvider } from "../src/BitsnakeGameProvider";

export default function RootLayout() {
  return (
    <BitsnakeGameProvider>
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
        <Stack.Screen name="index" options={{ title: "Bitsnake" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </BitsnakeGameProvider>
  );
}
