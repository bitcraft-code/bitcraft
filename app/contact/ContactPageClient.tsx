"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactForm, { type ContactVariant } from "@/components/ContactForm";
import { detectLocale, saveLocale, type Locale } from "@/lib/translations";

const HEADINGS: Record<Locale, Record<ContactVariant, string>> = {
  en: {
    default: "Let's build something great",
    software: "Ready to ship?",
    agency: "Ready to grow?",
    about: "Let's work together",
    home: "Let's build something great",
  },
  pt: {
    default: "Vamos construir algo incrível",
    software: "Pronto para lançar?",
    agency: "Pronto para crescer?",
    about: "Vamos trabalhar juntos",
    home: "Vamos construir algo incrível",
  },
};

const SUBHEADINGS: Record<Locale, Record<ContactVariant, string>> = {
  en: {
    default: "Tell us about your project and we'll get back to you within 24 hours.",
    software: "Tell us about your product. Let's turn your idea into a growth machine.",
    agency: "Tell us about your business. Let's build your acquisition engine.",
    about: "Tell us about your project and we'll get back to you within 24 hours.",
    home: "Tell us about your project and we'll get back to you within 24 hours.",
  },
  pt: {
    default: "Fale-nos sobre o seu projeto e responderemos em 24 horas.",
    software: "Fale-nos sobre o seu produto. Vamos transformar a sua ideia numa máquina de crescimento.",
    agency: "Fale-nos sobre o seu negócio. Vamos construir o seu motor de aquisição.",
    about: "Fale-nos sobre o seu projeto e responderemos em 24 horas.",
    home: "Fale-nos sobre o seu projeto e responderemos em 24 horas.",
  },
};

const CONFIG: Record<ContactVariant, {
  background: string;
  gridColor: string;
  accentColor: string;
  badgeLabel: string;
}> = {
  default: {
    background: `radial-gradient(ellipse 90% 70% at 15% 25%, rgba(0,170,255,0.28) 0%, transparent 55%),
                 radial-gradient(ellipse 70% 90% at 85% 75%, rgba(0,255,159,0.20) 0%, transparent 55%),
                 #0d2d45`,
    gridColor: "rgba(0,170,255,0.07)",
    accentColor: "#00ff9f",
    badgeLabel: "Contact",
  },
  software: {
    background: `radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0,255,159,0.10) 0%, transparent 60%),
                 radial-gradient(ellipse 60% 60% at 80% 80%, rgba(255,215,0,0.05) 0%, transparent 60%),
                 linear-gradient(180deg, #07130f 0%, #091a14 100%)`,
    gridColor: "rgba(0,255,159,0.05)",
    accentColor: "#00ff9f",
    badgeLabel: "Software",
  },
  agency: {
    background: `radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0,170,255,0.14) 0%, transparent 60%),
                 radial-gradient(ellipse 60% 60% at 80% 80%, rgba(0,170,255,0.08) 0%, transparent 60%),
                 linear-gradient(180deg, #080f1e 0%, #0a192f 100%)`,
    gridColor: "rgba(0,170,255,0.07)",
    accentColor: "#00aaff",
    badgeLabel: "Agency",
  },
  about: {
    background: `radial-gradient(ellipse 90% 70% at 15% 25%, rgba(0,170,255,0.28) 0%, transparent 55%),
                 radial-gradient(ellipse 70% 90% at 85% 75%, rgba(0,255,159,0.20) 0%, transparent 55%),
                 #0d2d45`,
    gridColor: "rgba(0,170,255,0.07)",
    accentColor: "#00ff9f",
    badgeLabel: "Contact",
  },
  home: {
    background: `radial-gradient(ellipse 80% 55% at 15% 30%, rgba(0,170,255,0.12) 0%, transparent 55%),
                 radial-gradient(ellipse 65% 55% at 85% 70%, rgba(0,255,159,0.09) 0%, transparent 55%),
                 linear-gradient(180deg, #0a1f35 0%, #071a14 100%)`,
    gridColor: "rgba(0,170,255,0.06)",
    accentColor: "#00aaff",
    badgeLabel: "Contact",
  },
};

export default function ContactPageClient() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const variant: ContactVariant = from === "software" ? "software" : from === "agency" ? "agency" : "default";
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { setLocale(detectLocale()); }, []);

  const cfg = CONFIG[variant];

  return (
    <>
    <title>{locale === "pt" ? "BITCRAFT | Contato" : "BITCRAFT | Contact"}</title>
    <main className="relative min-h-[100dvh] flex flex-col" style={{ background: cfg.background }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${cfg.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${cfg.gridColor} 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      <SiteHeader activePath="/contact" locale={locale} onToggleLocale={() => setLocale(l => { const next = l === "en" ? "pt" : "en"; saveLocale(next); return next; })} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-6 pb-16 pt-8 gap-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="text-center max-w-lg"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.accentColor }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: cfg.accentColor }}>
              {cfg.badgeLabel}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3">
            {HEADINGS[locale][variant]}
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "rgba(224,240,255,0.65)" }}>
            {SUBHEADINGS[locale][variant]}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="w-full max-w-lg"
        >
          <ContactForm variant={variant} locale={locale} />
        </motion.div>
      </div>

      <SiteFooter locale={locale} />
    </main>
    </>
  );
}
