"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LetterGlitch from "../../components/LetterGlitch";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import HeroCycle, { type HeroAnimation } from "../../components/HeroCycle";
import ContactSection from "../../components/ContactSection";
import BorderGlow from "../../components/BorderGlow";
import { detectLocale, saveLocale, type Locale } from "../../lib/translations";

// ▼ Change this one value to swap the hero animation
const HERO_ANIMATION: HeroAnimation = "decrypt"; // "decrypt" | "split" | "type"

const TYPING_TEXTS: Record<Locale, string[]> = {
  en: [
    "Your next product will [[dominate|accent,bold]] the market.",
    "AI that [[works|accent,bold]] while you [[sleep|accent,bold]].",
    "From [[zero|accent,bold]] to scalable in [[record time|accent,bold]].",
  ],
  pt: [
    "Seu próximo produto vai [[dominar|accent,bold]] o mercado.",
    "IA que [[trabalha|accent,bold]] enquanto você [[dorme|accent,bold]].",
    "Do [[zero|accent,bold]] ao escalável em [[tempo recorde|accent,bold]].",
  ],
};

const COPY: Record<Locale, {
  badge: string;
  heroSubtitle: string;
  heroCta: string;
  subtitle: string;
  cta: string;
  services: { title: string; description: string }[];
}> = {
  pt: {
    badge: "Engenharia de Alta Performance",
    heroSubtitle: "Cada semana sem o sistema certo é receita que o seu concorrente está embolsando.",
    heroCta: "Destrave meu produto →",
    subtitle: "Pare de financiar código que não vende. A Bitcraft transforma ideias em máquinas de crescimento, do MVP ao produto escalável, com IA integrada desde o primeiro dia.",
    cta: "Destrave meu produto →",
    services: [
      { title: "Entregue mais rápido, quebre menos", description: "Squads focados em resultado, não em reuniões. Arquitetura que aguenta o crescimento antes de ele chegar." },
      { title: "Automatize o que devora seu tempo", description: "Agentes e modelos que eliminam tarefas repetitivas e transformam dados em decisões, enquanto você foca no que só você pode fazer." },
      { title: "Interfaces que convertem na primeira visita", description: "UX que guia o usuário até a ação certa, sem fricção, sem desculpa para não comprar." },
      { title: "Cresça 10x sem reescrever nada", description: "Cloud-native, CI/CD e sistemas que escalam com o negócio, não contra ele." },
    ],
  },
  en: {
    badge: "High Performance Engineering",
    heroSubtitle: "Every week without the right system is revenue your competitor is pocketing.",
    heroCta: "Unlock my product →",
    subtitle: "Stop funding code that doesn't sell. Bitcraft turns ideas into growth machines, from MVP to scalable product, with AI baked in from day one.",
    cta: "Unlock my product →",
    services: [
      { title: "Ship faster, break less", description: "Squads focused on results, not meetings. Architecture that handles growth before it arrives." },
      { title: "Automate what's eating your time", description: "Agents and models that kill repetitive tasks and turn data into decisions, while you focus on what only you can do." },
      { title: "Interfaces that convert on the first visit", description: "UX that drives users to the right action, no friction, no excuses not to buy." },
      { title: "Scale 10x without rewriting a thing", description: "Cloud-native, CI/CD and systems that scale with the business, not against it." },
    ],
  },
};

const SERVICE_ICONS = [
  <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>,
  <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
  </svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
  </svg>,
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const cardsContainerVariant = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function SoftwarePage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [cardTilt, setCardTilt] = useState<Record<number, { rx: number; ry: number }>>({});
  useEffect(() => { setLocale(detectLocale()); }, []);
  return (
    <>
    <title>{locale === "pt" ? "BITCRAFT Software | Engenharia de Alta Performance" : "BITCRAFT Software | High Performance Engineering"}</title>
    <main className="relative flex flex-col overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0,255,159,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(255,215,0,0.07) 0%, transparent 60%), linear-gradient(180deg, #07130f 0%, #091a14 100%)",
      }} />
      <div className="absolute inset-0 ambient-noise" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,159,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,159,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      <SiteHeader activePath="/software" locale={locale} onToggleLocale={() => setLocale((l) => { const next = l === "en" ? "pt" : "en"; saveLocale(next); return next; })} />

      {/* LetterGlitch hero section */}
      <section className="relative w-full h-[100dvh] flex items-center justify-center">
        <div className="absolute inset-0">
          <LetterGlitch
            glitchColors={["#07130f", "#00ff9f", "#00b870"]}
            glitchSpeed={60}
            outerVignette
            centerVignette
            smooth
          />
        </div>
        {/* Extra vignette for text legibility */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-6 z-10">
          <HeroCycle
            animation={HERO_ANIMATION}
            phrases={TYPING_TEXTS[locale]}
            accentColor="#00ff9f"
            accentFont="var(--font-caveat)"
            speed={90}
            displayDuration={2800}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight text-center w-full max-w-3xl"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg max-w-lg leading-relaxed font-medium"
            style={{ color: "rgba(224,247,250,0.92)", textShadow: "0 0 32px rgba(0,255,159,0.25)" }}
          >
            {COPY[locale].heroSubtitle}
          </motion.p>
          <motion.a
            href="mailto:software@bitcraft.dev.br"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="px-8 py-3 rounded-full text-sm font-bold tracking-wide"
            style={{
              background: "linear-gradient(135deg, var(--accent), #00b870)",
              color: "#05120d",
              boxShadow: "0 0 32px rgba(0,255,159,0.3)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            {COPY[locale].heroCta}
          </motion.a>
        </div>
      </section>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto w-full gap-14">

        {/* Intro */}
        <div className="flex flex-col items-center gap-5">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{
              background: "rgba(0,255,159,0.07)",
              border: "1px solid rgba(0,255,159,0.2)",
              color: "var(--accent)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {COPY[locale].badge}
          </motion.div>

          <motion.h2
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight"
          >
            <span className="text-white">Bitcraft </span>
            <span style={{
              backgroundImage: "linear-gradient(92deg, #00ff9f, #00d47a)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}>
              Software
            </span>
          </motion.h2>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-base sm:text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(224,247,250,0.88)" }}
          >
            {COPY[locale].subtitle}
          </motion.p>

          <motion.a
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            href="mailto:software@bitcraft.dev.br"
            className="cta-ripple mt-2 px-7 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, var(--accent), #00b870)",
              color: "#05120d",
              boxShadow: "0 0 24px rgba(0,255,159,0.25)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {COPY[locale].cta}
          </motion.a>
        </div>

        {/* Services grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={cardsContainerVariant}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
        >
          {COPY[locale].services.map((s, i) => {
            const tilt = cardTilt[i] ?? { rx: 0, ry: 0 };
            return (
            <motion.div
              key={s.title}
              variants={cardVariant}
              style={{ perspective: "800px" }}
            >
              <div
                style={{
                  transform: `rotateX(${tilt.ry}deg) rotateY(${tilt.rx}deg)`,
                  transition: "transform 0.18s ease-out",
                  transformStyle: "preserve-3d",
                  height: "100%",
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width - 0.5;
                  const y = (e.clientY - rect.top) / rect.height - 0.5;
                  setCardTilt(p => ({ ...p, [i]: { rx: x * 14, ry: -y * 14 } }));
                }}
                onMouseLeave={() => setCardTilt(p => ({ ...p, [i]: { rx: 0, ry: 0 } }))}
              >
                <BorderGlow
                  className="h-full backdrop-blur-md"
                  colors={["#00ff9f", "#00cc7a", "#00aaff"]}
                  glowColor="153 100 60"
                  backgroundColor="rgba(7,22,14,0.72)"
                  borderRadius={12}
                  edgeSensitivity={0}
                  glowRadius={80}
                  glowIntensity={3}
                  coneSpread={27}
                  fillOpacity={0}
                  animated
                  animationDelay={i * 500}
                >
                  <div className="flex gap-4 items-start p-5 text-left" style={{ transformStyle: "preserve-3d" }}>
                    <div
                      className="mt-0.5 shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(0,255,159,0.08)", color: "var(--accent)", transform: "translateZ(28px)" }}
                    >
                      {SERVICE_ICONS[i]}
                    </div>
                    <div style={{ transformStyle: "preserve-3d" }}>
                      <h3 className="font-semibold text-white text-base mb-1" style={{ transform: "translateZ(20px)" }}>{s.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(224,247,250,0.93)", transform: "translateZ(10px)" }}>
                        {s.description}
                      </p>
                    </div>
                  </div>
                </BorderGlow>
              </div>
            </motion.div>
            );
          })}
        </motion.div>
      </div>

      <ContactSection variant="software" locale={locale} />

      <SiteFooter locale={locale} />
    </main>
    </>
  );
}
