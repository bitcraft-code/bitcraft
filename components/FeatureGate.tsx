import type { ReactNode } from "react";
import { FEATURES, type FeatureName } from "@/lib/features";

type FeatureGateProps = {
  name: FeatureName;
  children: ReactNode;
  fallback?: ReactNode;
};

export function FeatureGate({ name, children, fallback = null }: FeatureGateProps) {
  return FEATURES[name] ? <>{children}</> : <>{fallback}</>;
}
