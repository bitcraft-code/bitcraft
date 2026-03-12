import { Text } from "react-native";
import { useRouter } from "expo-router";

import {
  colors,
  GameShell,
  PrimaryButton,
  SectionCard,
  SecondaryButton,
  ToggleRow,
} from "@bitcraft/app-shell";

import { useTemplateGame } from "../src/TemplateGameProvider";

export default function TemplateSettingsScreen() {
  const router = useRouter();
  const {
    settings,
    updateSetting,
    previewPremiumOffer,
    restorePurchases,
  } = useTemplateGame();

  return (
    <GameShell
      title="Flappy settings"
      subtitle="Use this screen as a starting point, or replace it entirely when the real game takes shape."
      footer={<SecondaryButton label="Back" onPress={() => router.back()} />}
    >
      <SectionCard title="Preferences">
        <ToggleRow
          label="Analytics mock"
          description="Turns local analytics events on or off for testing."
          value={settings.analyticsEnabled}
          onValueChange={(value) => updateSetting("analyticsEnabled", value)}
        />
        <ToggleRow
          label="Sound enabled"
          description="Shared flag ready for future audio integration."
          value={settings.soundEnabled}
          onValueChange={(value) => updateSetting("soundEnabled", value)}
        />
        <ToggleRow
          label="Reduced motion"
          description="Keeps a simple path open for accessibility support."
          value={settings.reducedMotion}
          onValueChange={(value) => updateSetting("reducedMotion", value)}
        />
        <ToggleRow
          label="Show debug"
          description="Example of a flappy-specific setting."
          value={settings.showDebugInfo}
          onValueChange={(value) => updateSetting("showDebugInfo", value)}
        />
      </SectionCard>

      <SectionCard title="Mock monetization">
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          The flappy already includes the monetization contract, without forcing a real SDK from day one.
        </Text>
        <PrimaryButton label="Simulate premium purchase" onPress={() => void previewPremiumOffer()} />
        <SecondaryButton label="Restore purchases" onPress={() => void restorePurchases()} />
      </SectionCard>
    </GameShell>
  );
}
