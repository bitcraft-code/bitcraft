import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  colors,
  GameShell,
  GameOverModal,
  SectionCard,
  PrimaryButton,
  SecondaryButton,
  StatBadge,
} from "@bitcraft/app-shell";

import { useTicTacToeGame } from "../src/TicTacToeProvider";

const statusLabels = {
  idle: "Pronto",
  playing: "Jogando",
  paused: "Pausado",
  gameOver: "Encerrado",
} as const;

export default function TicTacToeHomeScreen() {
  const router = useRouter();
  const { ready, session, settings, nextRound, playMove, resetScore } = useTicTacToeGame();

  return (
    <GameShell
      title="Tic Tac Toe"
      subtitle="Outro app Expo independente, reaproveitando contratos, persistencia, mocks e UI."
      footer={
        <SecondaryButton
          label="Abrir configuracoes"
          onPress={() => router.push("/settings")}
        />
      }
    >
      <SectionCard title="Placar">
        <View style={styles.statsRow}>
          <StatBadge label="Rodadas vencidas" value={session.score} />
          <StatBadge label="Melhor sessao" value={session.highScore} />
          <StatBadge label="Status" value={statusLabels[session.status]} />
        </View>
        <Text style={styles.message}>{ready ? session.state.message : "Carregando..."}</Text>
      </SectionCard>

      <SectionCard title="Tabuleiro">
        <View style={styles.board}>
          {session.state.board.map((cell, index) => {
            return (
              <Pressable
                key={index}
                onPress={() => playMove(index)}
                disabled={!ready || Boolean(cell) || session.status !== "playing"}
                style={({ pressed }) => [
                  styles.boardCell,
                  session.state.winningLine.includes(index) && styles.boardCellHighlight,
                  pressed && styles.boardCellPressed,
                ]}
              >
                <Text style={styles.boardCellText}>
                  {cell ?? (settings.showMoveHints ? `${index + 1}` : " ")}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {session.state.winningLine.length > 0 ? (
          <Text style={[styles.message, styles.highlight]}>
            Linha vencedora: {session.state.winningLine.map((index) => index + 1).join(", ")}
          </Text>
        ) : null}
      </SectionCard>

      <SectionCard title="Acoes">
        <View style={styles.buttonRow}>
          <PrimaryButton label="Nova rodada" onPress={nextRound} />
          <SecondaryButton label="Zerar placar" onPress={resetScore} />
        </View>
      </SectionCard>
      <GameOverModal
        visible={session.status === "gameOver"}
        message={session.state.message}
        score={session.score}
        highScore={session.highScore}
        result={session.result}
        primaryActionLabel="Nova rodada"
        onPrimaryAction={nextRound}
        secondaryActionLabel="Configuracoes"
        onSecondaryAction={() => router.push("/settings")}
      />
    </GameShell>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  highlight: {
    color: colors.warning,
    fontWeight: "700",
  },
  board: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: 3 * 84 + 2 * 12,
  },
  boardCell: {
    alignItems: "center",
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 84,
    justifyContent: "center",
    width: 84,
  },
  boardCellHighlight: {
    borderColor: colors.warning,
    backgroundColor: "#713f12",
  },
  boardCellPressed: {
    opacity: 0.85,
  },
  boardCellText: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
});
