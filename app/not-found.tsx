"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import FaultyTerminal from "../components/FaultyTerminal";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { detectLocale, saveLocale, type Locale } from "../lib/translations";

const ACCENT = "#e8a020";
const ACCENT_DARK = "#c4871a";

const COPY: Record<Locale, { title: string; subtitle: string; cta: string }> = {
  en: {
    title: "Lost in the code.",
    subtitle: "This page doesn't exist — but your next project can.",
    cta: "Back to home →",
  },
  pt: {
    title: "Perdido no código.",
    subtitle: "Esta página não existe — mas o seu próximo projeto pode.",
    cta: "Voltar ao início →",
  },
};

export default function NotFound() {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { setLocale(detectLocale()); }, []);
  const c = COPY[locale];

  return (
    <>
      <title>BITCRAFT | 404</title>
      <main className="relative flex flex-col min-h-[100dvh] overflow-x-hidden">
        {/* Background */}
        <div className="fixed inset-0 -z-10" style={{
          background: `radial-gradient(ellipse 80% 60% at 20% 20%, rgba(232,160,32,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(196,135,26,0.07) 0%, transparent 60%), linear-gradient(180deg, #130e04 0%, #1a1205 100%)`,
        }} />
        <div className="fixed inset-0 -z-10 ambient-noise" />
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,160,32,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,32,0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 100%)",
          }}
        />

        <SiteHeader
          activePath="/"
          locale={locale}
          onToggleLocale={() => setLocale((l) => {
            const next = l === "en" ? "pt" : "en";
            saveLocale(next);
            return next;
          })}
        />

        {/* Hero */}
        <section className="relative flex-1 flex items-center justify-center">
          <div className="absolute inset-0">
            <FaultyTerminal
              tint={ACCENT}
              mouseReact
              curvature={0.1}
              scanlineIntensity={1.2}
              glitchAmount={2.0}
              noiseAmp={0.8}
              brightness={0.5}
              pageLoadAnimation
            />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)" }}
          />

          <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-black leading-none tracking-tighter"
              style={{
                fontSize: "clamp(7rem, 25vw, 18rem)",
                backgroundImage: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 60%, rgba(232,160,32,0.4) 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                textShadow: "none",
                filter: `drop-shadow(0 0 60px rgba(232,160,32,0.25))`,
              }}
            >
              404
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-xl sm:text-2xl font-bold text-white"
            >
              {c.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-base max-w-sm leading-relaxed"
              style={{ color: "rgba(255,240,210,0.72)" }}
            >
              {c.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href="/"
                className="inline-block px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
                  color: "#0d0900",
                  boxShadow: `0 0 32px rgba(232,160,32,0.3)`,
                }}
              >
                {c.cta}
              </Link>
            </motion.div>
          </div>
        </section>

        <SiteFooter locale={locale} />
      </main>
    </>
  );
}
