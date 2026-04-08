export type Locale = "en" | "pt";

export const translations = {
  en: {
    badge: "Next Generation Digital Products",
    headingStatic: "Creative",
    rotatingTexts: ["thinking.", "coding.", "shipping.", "growing!"],
    subtitle: "From idea to product. From product to market. Engineering and growth that scale together.",
    nav: {
      software: "Software",
      agency: "Agency",
      contact: "Contact",
    },
    btnSoftware: "Explore Software",
    btnAgency: "Meet the Agency",
  },
  pt: {
    badge: "Nova Geração de Produtos Digitais",
    headingStatic: "Criatividade",
    rotatingTexts: ["pensando.", "criando.", "entregando.", "crescendo!"],
    subtitle: "Da ideia ao produto. Do produto ao mercado. Engenharia e crescimento que escalam juntos.",
    nav: {
      software: "Software",
      agency: "Agency",
      contact: "Contato",
    },
    btnSoftware: "Explorar Software",
    btnAgency: "Conhecer a Agency",
  },
} satisfies Record<Locale, unknown>;

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const lang = navigator.language ?? navigator.languages?.[0] ?? "en";
  return lang.toLowerCase().startsWith("pt") ? "pt" : "en";
}
