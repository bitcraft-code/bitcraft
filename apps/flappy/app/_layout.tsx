import { Stack } from "expo-router";

import { colors } from "@bitcraft/app-shell";

import { TemplateGameProvider } from "../src/TemplateGameProvider";

export default function RootLayout() {
  return (
    <TemplateGameProvider>
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
        <Stack.Screen name="index" options={{ title: "Flappy" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </TemplateGameProvider>
  );
}
