import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "../messages/en.json";
import pt from "../messages/pt.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "pt"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "bitcraft_locale",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
