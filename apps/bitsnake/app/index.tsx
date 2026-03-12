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

import { useBitsnakeGame } from "../src/BitsnakeGameProvider";
import { experiments } from "../src/experiments";

export default function TemplateHomeScreen() {
  const router = useRouter();
  const { ready, session, settings, resetTemplate, trackSetupEvent } = useBitsnakeGame();
  const state = session.state as { score?: number; lives?: number; title: string; description: string; statusMessage: string };

  return (
    <GameShell
      title="Bitsnake"
      subtitle="Arcade starter: score, lives, high score. Replace with real gameplay."
      footer={
        <SecondaryButton
          label="Open settings"
          onPress={() => router.push("/settings")}
        />
      }
    >
      <SectionCard title="Arcade state">
        <View style={styles.statsRow}>
          <StatBadge label="Score" value={state.score ?? 0} />
          <StatBadge label="Lives" value={state.lives ?? 3} />
          <StatBadge label="High score" value={session.highScore} />
          <StatBadge label="Debug" value={settings.showDebugInfo ? "on" : "off"} />
        </View>
        <Text style={styles.title}>{state.title}</Text>
        <Text style={styles.copy}>
          {ready ? state.description : "Loading..."}
        </Text>
        <Text style={styles.copy}>{state.statusMessage}</Text>
        {experiments.newGameOverScreen && (
          <Text style={[styles.copy, { marginTop: 8, color: colors.text }]}>
            [Experiment] New Game Over screen enabled
          </Text>
        )}
      </SectionCard>

      <SectionCard title="First steps">
        <Text style={styles.copy}>1. Replace arcade state in <code>src/game.ts</code> with your game rules.</Text>
        <Text style={styles.copy}>2. Add obstacles, scoring, and game over logic.</Text>
        <Text style={styles.copy}>3. Wire analytics and monetization in the provider.</Text>
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
