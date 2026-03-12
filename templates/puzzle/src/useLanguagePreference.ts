import { useCallback, useEffect, useState } from "react";
import { createAsyncStorageAdapter } from "@bitcraft/storage";
import type { LocaleCode } from "./i18n";

const LANG_STORAGE_KEY = "languagePreference";
const storage = createAsyncStorageAdapter("template");

export type LanguageMode = "system" | LocaleCode;

export function useLanguagePreference() {
  const [languagePreference, setLanguagePreferenceState] = useState<LanguageMode>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    storage.getItem<LanguageMode>(LANG_STORAGE_KEY).then((saved) => {
      if (active && saved) setLanguagePreferenceState(saved);
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setLanguagePreference = useCallback((value: LanguageMode) => {
    setLanguagePreferenceState(value);
    void storage.setItem(LANG_STORAGE_KEY, value);
  }, []);

  return { languagePreference, setLanguagePreference, ready };
}
