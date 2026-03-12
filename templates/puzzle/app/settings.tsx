import { Text, View, Pressable } from "react-native";
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
import { useThemePreference } from "../src/useThemePreference";
import { useLanguagePreference } from "../src/useLanguagePreference";
import { t } from "../src/i18n";

const THEME_OPTIONS: { value: "system" | "light" | "dark"; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const LANGUAGE_OPTIONS: { value: "system" | "en" | "es" | "de" | "fr" | "it" | "pt-BR"; label: string }[] = [
  { value: "system", label: "System" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "it", label: "Italiano" },
  { value: "pt-BR", label: "Português (Brasil)" },
];

export default function TemplateSettingsScreen() {
  const router = useRouter();
  const {
    settings,
    updateSetting,
    previewPremiumOffer,
    restorePurchases,
  } = useTemplateGame();
  const { themePreference, setThemePreference } = useThemePreference();
  const { languagePreference, setLanguagePreference } = useLanguagePreference();

  return (
    <GameShell
      title={t("settings.title") + " — Template"}
      subtitle="Use this screen as a starting point, or replace it entirely when the real game takes shape."
      footer={<SecondaryButton label="Back" onPress={() => router.back()} />}
    >
      <SectionCard title={t("settings.theme")}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setThemePreference(opt.value)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: themePreference === opt.value ? colors.panel : "transparent",
              }}
            >
              <Text style={{ color: colors.text, fontSize: 14 }}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      <SectionCard title={t("settings.language")}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {LANGUAGE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setLanguagePreference(opt.value)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: languagePreference === opt.value ? colors.panel : "transparent",
              }}
            >
              <Text style={{ color: colors.text, fontSize: 14 }}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

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
          description="Example of a template-specific setting."
          value={settings.showDebugInfo}
          onValueChange={(value) => updateSetting("showDebugInfo", value)}
        />
      </SectionCard>

      <SectionCard title="Mock monetization">
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          The template already includes the monetization contract, without forcing a real SDK from day one.
        </Text>
        <PrimaryButton label="Simulate premium purchase" onPress={() => void previewPremiumOffer()} />
        <SecondaryButton label="Restore purchases" onPress={() => void restorePurchases()} />
      </SectionCard>
    </GameShell>
  );
}
