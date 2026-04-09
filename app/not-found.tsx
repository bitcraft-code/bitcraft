"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import FaultyTerminal from "../components/FaultyTerminal";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { detectLocale, saveLocale, type Locale } from "../lib/translations";

const ACCENT = "#e83535";
const ACCENT_DARK = "#b01e1e";

const COPY: Record<Locale, { title: string; subtitle: string; subtitleAccent: string; cta: string }> = {
  en: {
    title: "This page didn't ship.",
    subtitle: "Some things don't make it to production.",
    subtitleAccent: "Your idea should!",
    cta: "Let's build it →",
  },
  pt: {
    title: "Esta página não foi entregue.",
    subtitle: "Nem tudo vai para produção.",
    subtitleAccent: "A sua ideia deveria!",
    cta: "Vamos construir →",
  },
};

const FONT_SIZE = "clamp(7rem, 25vw, 18rem)";

const TEXT_BASE: React.CSSProperties = {
  fontSize: FONT_SIZE,
  fontWeight: 900,
  lineHeight: 1,
  letterSpacing: "-0.04em",
  userSelect: "none",
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
};

function Glitch404() {
  const [glitch, setGlitch] = useState<{
    sliceY: number;
    sliceH: number;
    offsetX: number;
    flicker: boolean;
  } | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function scheduleNext() {
      timeoutRef.current = setTimeout(() => {
        const sliceY = 8 + Math.random() * 78;
        const sliceH = 3 + Math.random() * 22;
        const offsetX = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 20);
        const flicker = Math.random() > 0.5;

        setGlitch({ sliceY, sliceH, offsetX, flicker });

        // Hold duration
        timeoutRef.current = setTimeout(() => {
          setGlitch(null);

          // Sometimes double-fire
          if (Math.random() > 0.55) {
            timeoutRef.current = setTimeout(() => {
              const sy = 8 + Math.random() * 78;
              const sh = 3 + Math.random() * 22;
              const ox = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 20);
              setGlitch({ sliceY: sy, sliceH: sh, offsetX: ox, flicker: false });
              timeoutRef.current = setTimeout(() => {
                setGlitch(null);
                scheduleNext();
              }, 50 + Math.random() * 100);
            }, 40 + Math.random() * 80);
          } else {
            scheduleNext();
          }
        }, 70 + Math.random() * 160);
      }, 600 + Math.random() * 2400);
    }

    timeoutRef.current = setTimeout(scheduleNext, 300 + Math.random() * 800);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const gradStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 60%, rgba(232,53,53,0.4) 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  };

  const clipSlice = glitch
    ? `inset(${glitch.sliceY}% 0 ${Math.max(0, 100 - glitch.sliceY - glitch.sliceH)}% 0)`
    : "none";
  const clipAbove = glitch ? `inset(0 0 ${Math.max(0, 100 - glitch.sliceY)}% 0)` : "none";
  const clipBelow = glitch
    ? `inset(${Math.min(100, glitch.sliceY + glitch.sliceH)}% 0 0 0)`
    : "none";

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        fontSize: FONT_SIZE,
        lineHeight: 1,
        filter: `drop-shadow(0 0 60px rgba(232,53,53,0.3))`,
        opacity: glitch?.flicker ? 0.7 : 1,
      }}
    >
      {/* Base layer */}
      <div style={{ ...TEXT_BASE, position: "relative", ...gradStyle }}>404</div>

      {/* Sliced shifted layer */}
      {glitch && (
        <div
          style={{
            ...TEXT_BASE,
            ...gradStyle,
            clipPath: clipSlice,
            transform: `translateX(${glitch.offsetX}px)`,
            filter: `drop-shadow(${glitch.offsetX > 0 ? -3 : 3}px 0 0 rgba(0,200,255,0.7))`,
          }}
        >
          404
        </div>
      )}

      {/* Chromatic split — above slice, red channel */}
      {glitch && (
        <div
          style={{
            ...TEXT_BASE,
            color: "rgba(255,20,20,0.55)",
            clipPath: clipAbove,
            transform: `translateX(${-glitch.offsetX * 0.25}px)`,
            mixBlendMode: "screen",
          }}
        >
          404
        </div>
      )}

      {/* Chromatic split — below slice, cyan channel */}
      {glitch && (
        <div
          style={{
            ...TEXT_BASE,
            color: "rgba(0,210,255,0.45)",
            clipPath: clipBelow,
            transform: `translateX(${glitch.offsetX * 0.25}px)`,
            mixBlendMode: "screen",
          }}
        >
          404
        </div>
      )}
    </div>
  );
}

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
          background: `radial-gradient(ellipse 80% 60% at 20% 20%, rgba(232,53,53,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(176,30,30,0.07) 0%, transparent 60%), linear-gradient(180deg, #130404 0%, #1a0505 100%)`,
        }} />
        <div className="fixed inset-0 -z-10 ambient-noise" />
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,53,53,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(232,53,53,0.05) 1px, transparent 1px)",
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
            >
              <Glitch404 />
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
              className="text-base sm:text-xl max-w-sm leading-relaxed"
              style={{ color: "rgba(255,220,220,0.93)" }}
            >
              {c.subtitle}
              <span className="block" style={{ fontFamily: "var(--font-caveat)", fontSize: "1.5em", color: ACCENT }}>
                {c.subtitleAccent}
              </span>
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
                  color: "#fff",
                  boxShadow: `0 0 32px rgba(232,53,53,0.35)`,
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
