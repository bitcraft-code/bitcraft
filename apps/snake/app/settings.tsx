import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  colors,
  GameShell,
  PrimaryButton,
  SectionCard,
  SecondaryButton,
  StatBadge,
  ToggleRow,
} from "@bitcraft/app-shell";

import { useSnakeGame } from "../src/SnakeGameProvider";

const difficultyLabels = {
  easy: "Facil",
  normal: "Normal",
  hard: "Dificil",
} as const;

export default function SnakeSettingsScreen() {
  const router = useRouter();
  const {
    session,
    settings,
    updateSetting,
    previewPremiumOffer,
    restorePurchases,
  } = useSnakeGame();

  return (
    <GameShell
      title="Configuracoes do Snake"
      subtitle="Tudo que e persistido fica encapsulado nos pacotes compartilhados."
      footer={<SecondaryButton label="Voltar ao jogo" onPress={() => router.back()} />}
    >
      <SectionCard title="Recorde">
        <View style={styles.statsRow}>
          <StatBadge label="Recorde salvo" value={session.highScore} />
          <StatBadge label="Dificuldade" value={difficultyLabels[settings.difficulty]} />
        </View>
      </SectionCard>

      <SectionCard title="Preferencias">
        <ToggleRow
          label="Analytics mock"
          description="Liga ou desliga os eventos de analytics locais."
          value={settings.analyticsEnabled}
          onValueChange={(value) => updateSetting("analyticsEnabled", value)}
        />
        <ToggleRow
          label="Som habilitado"
          description="Exemplo de flag compartilhada para audio."
          value={settings.soundEnabled}
          onValueChange={(value) => updateSetting("soundEnabled", value)}
        />
        <ToggleRow
          label="Reducao de movimento"
          description="Permite desacelerar efeitos visuais no futuro."
          value={settings.reducedMotion}
          onValueChange={(value) => updateSetting("reducedMotion", value)}
        />
      </SectionCard>

      <SectionCard title="Dificuldade">
        <Text style={styles.helpText}>
          A velocidade real do loop continua no app, mas a preferencia fica persistida e compartilhando o mesmo modelo.
        </Text>
        <View style={styles.difficultyRow}>
          {(["easy", "normal", "hard"] as const).map((difficulty) => (
            <View key={difficulty} style={styles.difficultyCell}>
              <PrimaryButton
                label={difficultyLabels[difficulty]}
                onPress={() => updateSetting("difficulty", difficulty)}
                disabled={settings.difficulty === difficulty}
              />
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Monetizacao mock">
        <Text style={styles.helpText}>
          As interfaces ficam em `packages/monetization` e os eventos padrao em `packages/analytics`.
        </Text>
        <PrimaryButton label="Simular compra premium" onPress={() => void previewPremiumOffer()} />
        <SecondaryButton label="Restaurar compras" onPress={() => void restorePurchases()} />
      </SectionCard>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  helpText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  difficultyRow: {
    flexDirection: "row",
    gap: 12,
  },
  difficultyCell: {
    flex: 1,
  },
});
