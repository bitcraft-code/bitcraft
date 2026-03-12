/**
 * Experiment flags for A/B testing. Local/static only.
 * Toggle these to test different UX or monetization variants.
 */
export const experiments = {
  newGameOverScreen: false,
  aggressiveAds: false,
  doubleCoinsReward: false,
} as const;

export type ExperimentKey = keyof typeof experiments;

export function isExperimentEnabled(key: ExperimentKey): boolean {
  return experiments[key];
}
