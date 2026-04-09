"use client";

import { motion } from "framer-motion";
import ContactForm, { type ContactVariant } from "./ContactForm";
import type { Locale } from "@/lib/translations";

const HEADINGS: Record<Locale, Record<ContactVariant, string>> = {
  en: {
    default: "Let's build something great",
    software: "Ready to ship?",
    agency: "Ready to grow?",
    about: "Let's talk.",
    home: "Let's build something great",
  },
  pt: {
    default: "Vamos construir algo incrível",
    software: "Pronto para lançar?",
    agency: "Pronto para crescer?",
    about: "Vamos conversar.",
    home: "Vamos construir algo incrível",
  },
};

const SUBHEADINGS: Record<Locale, Record<ContactVariant, string>> = {
  en: {
    default: "Tell us about your project and we'll get back to you within 24 hours.",
    software: "Tell us about your product. Let's turn your idea into a growth machine.",
    agency: "Tell us about your business. Let's build your acquisition engine.",
    about: "Tell us what you're building. We'll tell you how we can help.",
    home: "Tell us about your project and we'll get back to you within 24 hours.",
  },
  pt: {
    default: "Fale-nos sobre o seu projeto e responderemos em 24 horas.",
    software: "Fale-nos sobre o seu produto. Vamos transformar a sua ideia numa máquina de crescimento.",
    agency: "Fale-nos sobre o seu negócio. Vamos construir o seu motor de aquisição.",
    about: "Fale-nos o que está construindo. A gente diz como podemos ajudar.",
    home: "Fale-nos sobre o seu projeto e responderemos em 24 horas.",
  },
};

const ACCENT: Record<ContactVariant, string | ((dark: boolean) => string)> = {
  default: "#00ff9f",
  software: "#00ff9f",
  agency: "#00aaff",
  about: "#e8a020",
  home: (dark: boolean) => dark ? "#00ff9f" : "#00aaff",
};

const DIVIDER: Record<ContactVariant, string | ((dark: boolean) => string)> = {
  default: "rgba(255,255,255,0.07)",
  software: "rgba(0,255,159,0.10)",
  agency: "rgba(0,170,255,0.10)",
  about: "rgba(232,160,32,0.10)",
  home: (dark: boolean) => dark ? "rgba(0,255,159,0.10)" : "rgba(0,170,255,0.10)",
};


type Props = { variant?: ContactVariant; locale?: Locale; dark?: boolean };

export default function ContactSection({ variant = "default", locale = "en", dark = true }: Props) {
  const accentValue = ACCENT[variant];
  const dividerValue = DIVIDER[variant];
  const accent = typeof accentValue === "function" ? accentValue(dark) : accentValue;
  const divider = typeof dividerValue === "function" ? dividerValue(dark) : dividerValue;

  const headingColor = variant === "home" ? (dark ? "#ffffff" : "#0a192f") : "#ffffff";
  const subtitleColor = variant === "home"
    ? (dark ? "rgba(224,240,255,0.65)" : "rgba(10,25,47,0.65)")
    : "rgba(224,240,255,0.65)";

  return (
    <section
      id="contact"
      className="relative z-10 w-full flex flex-col items-center justify-center px-5 sm:px-6 py-28 gap-10 min-h-[100dvh]"
    >
      {/* Top divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${divider}, transparent)` }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="text-center max-w-lg"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: accent }}>
            Contact
          </span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-3" style={{ color: headingColor }}>
          {HEADINGS[locale][variant]}
        </h2>
        <p className="text-base leading-relaxed" style={{ color: subtitleColor }}>
          {SUBHEADINGS[locale][variant]}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="w-full max-w-lg"
      >
        <ContactForm variant={variant} locale={locale} dark={dark} />
      </motion.div>
    </section>
  );
}
