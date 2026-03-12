import type { PropsWithChildren, ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { GameResult } from "@bitcraft/game-core";

export const colors = {
  background: "#0f172a",
  panel: "#111827",
  panelMuted: "#1f2937",
  panelSoft: "#334155",
  text: "#f8fafc",
  textMuted: "#cbd5e1",
  accent: "#38bdf8",
  success: "#22c55e",
  danger: "#f97316",
  warning: "#facc15",
  border: "#475569",
  overlay: "rgba(2, 6, 23, 0.72)",
};

interface ScreenContainerProps extends PropsWithChildren {
  footer?: ReactNode;
}

export const ScreenContainer = ({ children, footer }: ScreenContainerProps) => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </ScrollView>
  </SafeAreaView>
);

interface GameShellProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  footer?: ReactNode;
}

export const GameShell = ({ title, subtitle, children, footer }: GameShellProps) => (
  <ScreenContainer
    footer={footer}
  >
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
    <View style={styles.body}>{children}</View>
  </ScreenContainer>
);

export const SettingsScreen = GameShell;

interface SectionCardProps extends PropsWithChildren {
  title: string;
}

export const SectionCard = ({ title, children }: SectionCardProps) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.cardBody}>{children}</View>
  </View>
);

export const SettingsSection = SectionCard;

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export const PrimaryButton = ({ label, onPress, disabled = false }: ButtonProps) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }: { pressed: boolean }) => [
      styles.button,
      styles.primaryButton,
      disabled && styles.buttonDisabled,
      pressed && !disabled && styles.buttonPressed,
    ]}
  >
    <Text style={styles.primaryButtonText}>{label}</Text>
  </Pressable>
);

export const SecondaryButton = ({
  label,
  onPress,
  disabled = false,
}: ButtonProps) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }: { pressed: boolean }) => [
      styles.button,
      styles.secondaryButton,
      disabled && styles.buttonDisabled,
      pressed && !disabled && styles.buttonPressed,
    ]}
  >
    <Text style={styles.secondaryButtonText}>{label}</Text>
  </Pressable>
);

interface StatBadgeProps {
  label: string;
  value: string | number;
}

export const StatBadge = ({ label, value }: StatBadgeProps) => (
  <View style={styles.statBadge}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (nextValue: boolean) => void;
}

export const ToggleRow = ({
  label,
  description,
  value,
  onValueChange,
}: ToggleRowProps) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleCopy}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleDescription}>{description}</Text>
    </View>
    <Switch
      thumbColor={value ? colors.accent : "#e2e8f0"}
      trackColor={{ false: "#64748b", true: "#0369a1" }}
      value={value}
      onValueChange={onValueChange}
    />
  </View>
);

interface GameOverModalProps {
  visible: boolean;
  title?: string;
  message: string;
  score: number;
  highScore: number;
  result?: GameResult;
  primaryActionLabel?: string;
  onPrimaryAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const resultLabels: Record<Exclude<GameResult, null>, string> = {
  won: "Win",
  lost: "Loss",
  draw: "Draw",
};

export const GameOverModal = ({
  visible,
  title = "Game over",
  message,
  score,
  highScore,
  result,
  primaryActionLabel = "Play again",
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}: GameOverModalProps) => (
  <Modal transparent animationType="fade" visible={visible}>
    <View style={styles.overlay}>
      <View style={styles.overlayCard}>
        <Text style={styles.overlayTitle}>{title}</Text>
        {result ? <Text style={styles.overlayBadge}>{resultLabels[result]}</Text> : null}
        <Text style={styles.overlayText}>{message}</Text>
        <View style={styles.statsRow}>
          <StatBadge label="Score" value={score} />
          <StatBadge label="High score" value={highScore} />
        </View>
        <PrimaryButton label={primaryActionLabel} onPress={onPrimaryAction} />
        {secondaryActionLabel && onSecondaryAction ? (
          <SecondaryButton
            label={secondaryActionLabel}
            onPress={onSecondaryAction}
          />
        ) : null}
      </View>
    </View>
  </Modal>
);

interface PauseOverlayProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onResume: () => void;
}

export const PauseOverlay = ({
  visible,
  title = "Game paused",
  subtitle = "Resume whenever you are ready.",
  onResume,
}: PauseOverlayProps) => (
  <Modal transparent animationType="fade" visible={visible}>
    <View style={styles.overlay}>
      <View style={styles.overlayCard}>
        <Text style={styles.overlayTitle}>{title}</Text>
        <Text style={styles.overlayText}>{subtitle}</Text>
        <PrimaryButton label="Resume" onPress={onResume} />
      </View>
    </View>
  </Modal>
);

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 8,
    paddingTop: 8,
  },
  body: {
    gap: 16,
  },
  footer: {
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardBody: {
    gap: 12,
  },
  button: {
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  secondaryButton: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderWidth: 1,
  },
  primaryButtonText: {
    color: "#082f49",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  statBadge: {
    flex: 1,
    backgroundColor: colors.panelMuted,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  toggleLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  toggleDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  overlay: {
    alignItems: "center",
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  overlayCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 20,
    width: "100%",
  },
  overlayTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  overlayText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  overlayBadge: {
    color: colors.warning,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
});
