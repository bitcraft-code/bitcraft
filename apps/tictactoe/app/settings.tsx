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

import { useTicTacToeGame } from "../src/TicTacToeProvider";

export default function TicTacToeSettingsScreen() {
  const router = useRouter();
  const {
    session,
    settings,
    updateSetting,
    previewPremiumOffer,
    restorePurchases,
  } = useTicTacToeGame();

  return (
    <GameShell
      title="Configuracoes do Tic Tac Toe"
      subtitle="Cada app segue independente, mas reaproveita os mesmos contratos internos."
      footer={<SecondaryButton label="Voltar ao jogo" onPress={() => router.back()} />}
    >
      <SectionCard title="Resumo">
        <View style={styles.statsRow}>
          <StatBadge label="Melhor sessao" value={session.highScore} />
          <StatBadge label="Rodadas atuais" value={session.score} />
        </View>
      </SectionCard>

      <SectionCard title="Preferencias">
        <ToggleRow
          label="Mostrar dicas de jogada"
          description="Exibe o indice das casas vazias para facilitar onboarding."
          value={settings.showMoveHints}
          onValueChange={(value) => updateSetting("showMoveHints", value)}
        />
        <ToggleRow
          label="Analytics mock"
          description="Liga ou desliga os eventos locais desta app."
          value={settings.analyticsEnabled}
          onValueChange={(value) => updateSetting("analyticsEnabled", value)}
        />
        <ToggleRow
          label="Som habilitado"
          description="Flag compartilhada para futuras integracoes de audio."
          value={settings.soundEnabled}
          onValueChange={(value) => updateSetting("soundEnabled", value)}
        />
        <ToggleRow
          label="Reducao de movimento"
          description="Reserva um caminho simples para acessibilidade."
          value={settings.reducedMotion}
          onValueChange={(value) => updateSetting("reducedMotion", value)}
        />
      </SectionCard>

      <SectionCard title="Monetizacao mock">
        <Text style={styles.helpText}>
          O app chama IAPs e restauracao usando implementacoes locais, sem acoplamento com SDK real.
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
});
