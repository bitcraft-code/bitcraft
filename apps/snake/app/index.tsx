import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  colors,
  GameShell,
  GameOverModal,
  PauseOverlay,
  PrimaryButton,
  SectionCard,
  SecondaryButton,
  StatBadge,
} from "@bitcraft/app-shell";

import { useSnakeGame } from "../src/SnakeGameProvider";

const statusLabels = {
  idle: "Pronto",
  playing: "Jogando",
  paused: "Pausado",
  gameOver: "Encerrado",
} as const;

export default function SnakeHomeScreen() {
  const router = useRouter();
  const { ready, session, startGame, pauseGame, restartGame, resumeGame, setDirection } =
    useSnakeGame();

  const cells = useMemo(() => {
    const snakeKeys = new Set(session.state.snake.map((segment) => `${segment.x}:${segment.y}`));
    const foodKey = `${session.state.food.x}:${session.state.food.y}`;

    return Array.from({ length: session.state.boardSize * session.state.boardSize }, (_, index) => {
      const x = index % session.state.boardSize;
      const y = Math.floor(index / session.state.boardSize);
      const key = `${x}:${y}`;

      if (snakeKeys.has(key)) {
        return "snake";
      }

      if (foodKey === key) {
        return "food";
      }

      return "empty";
    });
  }, [session.state]);

  return (
    <GameShell
      title="Snake"
      subtitle="App Expo independente com regras locais e infraestrutura compartilhada."
      footer={
        <SecondaryButton
          label="Abrir configuracoes"
          onPress={() => router.push("/settings")}
        />
      }
    >
      <SectionCard title="Placar">
        <View style={styles.statsRow}>
          <StatBadge label="Pontos" value={session.score} />
          <StatBadge label="Recorde" value={session.highScore} />
          <StatBadge label="Status" value={statusLabels[session.status]} />
        </View>
        <Text style={styles.message}>{ready ? session.state.message : "Carregando..."}</Text>
      </SectionCard>

      <SectionCard title="Tabuleiro">
        <View style={styles.board}>
          {cells.map((cell, index) => (
            <View
              key={`${cell}-${index}`}
              style={[
                styles.cell,
                cell === "snake" && styles.snakeCell,
                cell === "food" && styles.foodCell,
              ]}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Acoes">
        <View style={styles.buttonRow}>
          <PrimaryButton label="Iniciar" onPress={startGame} disabled={!ready} />
          <SecondaryButton label="Pausar" onPress={pauseGame} disabled={session.status !== "playing"} />
        </View>
        <View style={styles.buttonRow}>
          <PrimaryButton label="Continuar" onPress={resumeGame} disabled={session.status !== "paused"} />
          <SecondaryButton label="Reiniciar" onPress={restartGame} disabled={!ready} />
        </View>
      </SectionCard>

      <SectionCard title="Controles">
        <View style={styles.directionColumn}>
          <SecondaryButton label="Cima" onPress={() => setDirection("up")} />
          <View style={styles.directionRow}>
            <SecondaryButton label="Esquerda" onPress={() => setDirection("left")} />
            <SecondaryButton label="Direita" onPress={() => setDirection("right")} />
          </View>
          <SecondaryButton label="Baixo" onPress={() => setDirection("down")} />
        </View>
      </SectionCard>
      <PauseOverlay
        visible={session.status === "paused"}
        subtitle="O loop do jogo foi interrompido sem perder a sessao."
        onResume={resumeGame}
      />
      <GameOverModal
        visible={session.status === "gameOver"}
        message={session.state.message}
        score={session.score}
        highScore={session.highScore}
        result={session.result}
        primaryActionLabel="Jogar novamente"
        onPrimaryAction={restartGame}
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
  board: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    width: 8 * 36 + 7 * 6,
  },
  cell: {
    backgroundColor: colors.panelSoft,
    borderRadius: 8,
    height: 36,
    width: 36,
  },
  snakeCell: {
    backgroundColor: colors.success,
  },
  foodCell: {
    backgroundColor: colors.danger,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  directionColumn: {
    alignItems: "center",
    gap: 12,
  },
  directionRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
});
