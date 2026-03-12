import { useCallback, useEffect, useState } from "react";
import { createAsyncStorageAdapter } from "@bitcraft/storage";
import type { ThemeMode } from "./theme";

const THEME_STORAGE_KEY = "themePreference";
const storage = createAsyncStorageAdapter("bitsnake");

export function useThemePreference() {
  const [themePreference, setThemePreferenceState] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    storage.getItem<ThemeMode>(THEME_STORAGE_KEY).then((saved) => {
      if (active && saved) setThemePreferenceState(saved);
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setThemePreference = useCallback((value: ThemeMode) => {
    setThemePreferenceState(value);
    void storage.setItem(THEME_STORAGE_KEY, value);
  }, []);

  return { themePreference, setThemePreference, ready };
}
