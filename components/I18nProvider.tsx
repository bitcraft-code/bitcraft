"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale: string;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps): React.JSX.Element {
  if (i18n.isInitialized && i18n.language !== initialLocale) {
    void i18n.changeLanguage(initialLocale);
  }
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
