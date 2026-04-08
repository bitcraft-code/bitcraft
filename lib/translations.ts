export type Locale = 'en' | 'pt';

export const translations = {
  en: {
    badge: 'Where Code Meets Growth',
    headingStatic: 'Ideas that',
    rotatingTexts: ['convert,', 'scale,', 'dominate,', 'sell!'],
    subtitle:
      'Most companies build. Few companies grow. Bitcraft does both! Engineering that ships and marketing that converts.',
    nav: {
      software: 'Software',
      agency: 'Agency',
      contact: 'Contact',
    },
    btnSoftware: 'Build my product →',
    btnAgency: 'Grow my business →',
  },
  pt: {
    badge: 'Onde Código Encontra Crescimento',
    headingStatic: 'Ideias que',
    rotatingTexts: ['convertem,', 'escalam,', 'dominam,', 'vendem!'],
    subtitle:
      'A maioria constrói. Poucos crescem. A Bitcraft faz os dois! Engenharia que entrega e marketing que converte.',
    nav: {
      software: 'Software',
      agency: 'Agency',
      contact: 'Contato',
    },
    btnSoftware: 'Construir meu produto →',
    btnAgency: 'Crescer meu negócio →',
  },
} satisfies Record<Locale, unknown>;

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const lang = navigator.language ?? navigator.languages?.[0] ?? 'en';
  return lang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}
