/**
 * Feature flags for site sections.
 *
 * How to add a new flag:
 *   1. Add a key below with explicit default (false until content is real).
 *   2. Document it in `.env.example` as `NEXT_PUBLIC_FEATURE_<NAME>`.
 *   3. Wrap the section render with `<FeatureGate name="yourFlag">`.
 *
 * Toggle: set the env var on Vercel (project > settings > env), redeploy.
 * Local: copy `.env.example` to `.env.local` and edit.
 *
 * SSR-safe: env vars prefixed with `NEXT_PUBLIC_` are inlined at build time.
 */

const readBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") return true;
  if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") return false;
  return fallback;
};

export const FEATURES = {
  logoCloud: readBool(process.env.NEXT_PUBLIC_FEATURE_LOGO_CLOUD, false),
  testimonials: readBool(process.env.NEXT_PUBLIC_FEATURE_TESTIMONIALS, false),
  caseStudies: readBool(process.env.NEXT_PUBLIC_FEATURE_CASE_STUDIES, false),
  team: readBool(process.env.NEXT_PUBLIC_FEATURE_TEAM, false),
  processTimeline: readBool(process.env.NEXT_PUBLIC_FEATURE_PROCESS_TIMELINE, false),
  engagementModels: readBool(process.env.NEXT_PUBLIC_FEATURE_ENGAGEMENT_MODELS, false),
  budgetTiers: readBool(process.env.NEXT_PUBLIC_FEATURE_BUDGET_TIERS, false),
  specialist: readBool(process.env.NEXT_PUBLIC_FEATURE_SPECIALIST, false),
  blog: readBool(process.env.NEXT_PUBLIC_FEATURE_BLOG, false),
} as const;

export type FeatureName = keyof typeof FEATURES;

export const isFeatureEnabled = (name: FeatureName): boolean => FEATURES[name];
