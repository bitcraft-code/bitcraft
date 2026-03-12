import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  colors,
  GameShell,
  PrimaryButton,
  SectionCard,
  SecondaryButton,
  StatBadge,
} from "@bitcraft/app-shell";

import { useTemplateGame } from "../src/TemplateGameProvider";

export default function TemplateHomeScreen() {
  const router = useRouter();
  const { ready, session, settings, resetTemplate, trackSetupEvent } = useTemplateGame();

  return (
    <GameShell
      title="Flappy"
      subtitle="Empty starting point for a new game, with Expo Router, persistence, mocks, and a shared app shell."
      footer={
        <SecondaryButton
          label="Open settings"
          onPress={() => router.push("/settings")}
        />
      }
    >
      <SectionCard title="Base state">
        <View style={styles.statsRow}>
          <StatBadge label="Status" value={session.status} />
          <StatBadge label="High score" value={session.highScore} />
          <StatBadge label="Debug" value={settings.showDebugInfo ? "on" : "off"} />
        </View>
        <Text style={styles.title}>{session.state.title}</Text>
        <Text style={styles.copy}>
          {ready ? session.state.description : "Loading flappy configuration..."}
        </Text>
        <Text style={styles.copy}>{session.state.statusMessage}</Text>
      </SectionCard>

      <SectionCard title="First steps">
        <Text style={styles.copy}>1. Rename the app and update `app.config.ts`.</Text>
        <Text style={styles.copy}>2. Replace `src/game.ts` with the real game state and rules.</Text>
        <Text style={styles.copy}>3. Update the provider if you need real `storage`, `analytics`, or `monetization` integrations.</Text>
        <Text style={styles.copy}>4. Simplify or replace these screens with game-specific UI.</Text>
      </SectionCard>

      <SectionCard title="Actions">
        <View style={styles.buttonRow}>
          <PrimaryButton label="Reset session" onPress={resetTemplate} />
          <SecondaryButton label="Send mock event" onPress={() => void trackSetupEvent()} />
        </View>
      </SectionCard>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  copy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
});
