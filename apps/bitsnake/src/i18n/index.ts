export type LocaleCode = "en" | "es" | "de" | "fr" | "it" | "pt-BR";
export const SUPPORTED_LOCALES: LocaleCode[] = ["en", "es", "de", "fr", "it", "pt-BR"];
export const DEFAULT_LOCALE: LocaleCode = "en";

type NestedValue = string | { [key: string]: NestedValue };
type NestedDict = { [key: string]: NestedValue };

function getNested(obj: NestedDict, path: string): string | undefined {
  const parts = path.split(".");
  let current: NestedValue = obj;
  for (const p of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    const dict = current as { [key: string]: NestedValue };
    const next: NestedValue | undefined = dict[p];
    if (typeof next === "undefined") return undefined;
    current = next;
  }
  return typeof current === "string" ? current : undefined;
}

const en: NestedDict = {
  game: { start: "Start", over: "Game Over", pause: "Pause", resume: "Resume" },
  settings: { title: "Settings", language: "Language", theme: "Theme", sound: "Sound", haptics: "Haptics" },
};

const translations: Record<LocaleCode, NestedDict> = {
  en,
  es: en,
  de: en,
  fr: en,
  it: en,
  "pt-BR": en,
};

export function t(key: string, locale?: LocaleCode): string {
  const loc = (locale ?? DEFAULT_LOCALE) as LocaleCode;
  const dict = translations[loc] ?? en;
  return getNested(dict, key) ?? key;
}

