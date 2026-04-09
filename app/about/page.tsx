"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import FaultyTerminal from "../../components/FaultyTerminal";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import TextType from "../../components/TextType";
import ContactSection from "../../components/ContactSection";
import BorderGlow from "../../components/BorderGlow";
import { detectLocale, saveLocale, type Locale } from "../../lib/translations";

const ACCENT = "#e8a020";
const ACCENT_DARK = "#c4871a";

const TYPING_TEXTS: Record<Locale, string[]> = {
  en: [
    "We build what [[matters|accent,bold]].",
    "Code and strategy in [[one|accent,bold]] team.",
    "From [[idea|accent,bold]] to [[market|accent,bold]] without detours.",
  ],
  pt: [
    "Construímos o que [[importa|accent,bold]].",
    "Código e estratégia em [[uma só|accent,bold]] equipe.",
    "Da [[ideia|accent,bold]] ao [[mercado|accent,bold]] sem rodeios.",
  ],
};

const COPY: Record<Locale, {
  badge: string;
  heroSubtitle: string;
  heroCta: string;
  title: string;
  subtitle: string;
  cta: string;
  pillars: { title: string; description: string }[];
}> = {
  en: {
    badge: "Who We Are",
    heroSubtitle: "Two disciplines. One team. Zero excuses.",
    heroCta: "Let's talk →",
    title: "Built different.",
    subtitle: "Bitcraft was born from a simple frustration: great ideas stuck between agencies that can't code and developers who don't understand business. We are engineers who think about growth and strategists who understand code — in the same room, on the same team.",
    cta: "Let's talk →",
    pillars: [
      {
        title: "Results above all",
        description: "We don't sell hours. We sell results. Every decision — technical or strategic — is measured against one metric: does it move the business forward?",
      },
      {
        title: "Engineering with purpose",
        description: "Clean code is not enough. We build systems that scale, architectures that don't break under success, and products that users actually want to use.",
      },
      {
        title: "Growth as a product",
        description: "Marketing isn't a department. It's a layer of the product. We design acquisition, retention, and monetization from the first line of code.",
      },
      {
        title: "Team, not vendor",
        description: "We don't deliver and disappear. We embed ourselves in your business, challenge your assumptions, and share the obsession with your growth.",
      },
    ],
  },
  pt: {
    badge: "Quem Somos",
    heroSubtitle: "Duas disciplinas. Uma equipe. Zero desculpas.",
    heroCta: "Vamos conversar →",
    title: "Construídos diferente.",
    subtitle: "A Bitcraft nasceu de uma frustração simples: boas ideias presas entre agências que não sabem codar e devs que não entendem de negócio. Somos engenheiros que pensam em crescimento e estrategistas que entendem de código — na mesma sala, na mesma equipe.",
    cta: "Vamos conversar →",
    pillars: [
      {
        title: "Resultado acima de tudo",
        description: "Não vendemos horas. Vendemos resultado. Cada decisão — técnica ou estratégica — é medida contra uma métrica: isso move o negócio para frente?",
      },
      {
        title: "Engenharia com propósito",
        description: "Código limpo não é suficiente. Construímos sistemas que escalam, arquiteturas que não quebram sob o sucesso, e produtos que as pessoas realmente querem usar.",
      },
      {
        title: "Crescimento como produto",
        description: "Marketing não é um departamento. É uma camada do produto. Projetamos aquisição, retenção e monetização desde a primeira linha de código.",
      },
      {
        title: "Equipe, não fornecedor",
        description: "Não entregamos e desaparecemos. Nos incorporamos ao seu negócio, questionamos seus pressupostos e compartilhamos a obsessão pelo seu crescimento.",
      },
    ],
  },
};

const PILLAR_ICONS = [
  <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>,
  <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
  hidden: { opacity: 0, y: 48, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const cardsContainerVariant = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

function PillarCardsGrid({ pillars }: { pillars: typeof COPY["en"]["pillars"] }) {
  const [cardTilt, setCardTilt] = useState<Record<number, { rx: number; ry: number }>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  return (
    <motion.div
      ref={containerRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={cardsContainerVariant}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
    >
      {pillars.map((p, i) => {
        const tilt = cardTilt[i] ?? { rx: 0, ry: 0 };
        return (
          <motion.div
            key={p.title}
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
                setCardTilt(prev => ({ ...prev, [i]: { rx: x * 14, ry: -y * 14 } }));
              }}
              onMouseLeave={() => setCardTilt(prev => ({ ...prev, [i]: { rx: 0, ry: 0 } }))}
            >
              <BorderGlow
                className="h-full backdrop-blur-md"
                colors={["#e8a020", "#c4871a", "#f0c040"]}
                glowColor="38 90 52"
                backgroundColor="rgba(20,14,4,0.72)"
                borderRadius={12}
                edgeSensitivity={0}
                glowRadius={80}
                glowIntensity={3}
                coneSpread={27}
                fillOpacity={0}
                animated
                animationDelay={i * 4000}
              >
                <div className="flex gap-4 items-start p-5 text-left" style={{ transformStyle: "preserve-3d" }}>
                  <div
                    className="mt-0.5 shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(232,160,32,0.08)", color: ACCENT, transform: "translateZ(28px)" }}
                  >
                    {PILLAR_ICONS[i]}
                  </div>
                  <div style={{ transformStyle: "preserve-3d" }}>
                    <h3 className="font-semibold text-white text-base mb-1" style={{ transform: "translateZ(20px)" }}>{p.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,240,210,0.93)", transform: "translateZ(10px)" }}>
                      {p.description}
                    </p>
                  </div>
                </div>
              </BorderGlow>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function AboutPage() {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { setLocale(detectLocale()); }, []);
  const c = COPY[locale];

  return (
    <>
    <title>{locale === "pt" ? "BITCRAFT | Quem Somos" : "BITCRAFT | About Us"}</title>
    <main className="relative flex flex-col overflow-x-hidden">
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

      <SiteHeader activePath="/about" locale={locale} onToggleLocale={() => setLocale((l) => { const next = l === "en" ? "pt" : "en"; saveLocale(next); return next; })} />

      {/* Hero */}
      <section className="relative w-full h-[100dvh] flex items-center justify-center">
        <div className="absolute inset-0">
          <FaultyTerminal
            tint={ACCENT}
            scale={1.7}
            digitSize={1.7}
            timeScale={1.7}
            noiseAmp={0.7}
            brightness={0.7}
            scanlineIntensity={0.9}
            curvature={0.5}
            mouseReact
            mouseStrength={1}
            pageLoadAnimation
          />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-6 z-10">
          <TextType
            as="h1"
            text={TYPING_TEXTS[locale]}
            typingSpeed={55}
            deletingSpeed={30}
            pauseDuration={2500}
            initialDelay={400}
            loop
            showCursor
            cursorCharacter="|"
            cursorClassName="text-[#e8a020]"
            accentColor={ACCENT}
            accentFontFamily="var(--font-caveat)"
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight text-balance"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg max-w-lg leading-relaxed font-medium"
            style={{ color: "rgba(255,240,210,0.92)", textShadow: `0 0 32px rgba(232,160,32,0.3)` }}
          >
            {c.heroSubtitle}
          </motion.p>
          <motion.a
            href="#contact"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="px-8 py-3 rounded-full text-sm font-bold tracking-wide"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
              color: "#0d0900",
              boxShadow: `0 0 32px rgba(232,160,32,0.3)`,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            {c.heroCta}
          </motion.a>
        </div>
      </section>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto w-full gap-14">
        <div className="flex flex-col items-center gap-5">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{
              background: "rgba(232,160,32,0.08)",
              border: "1px solid rgba(232,160,32,0.22)",
              color: ACCENT,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {c.badge}
          </motion.div>

          <motion.h2
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight"
          >
            <span className="text-white">Bitcraft</span>
            <br />
            <span style={{
              backgroundImage: `linear-gradient(92deg, ${ACCENT}, ${ACCENT_DARK})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}>
              {c.title}
            </span>
          </motion.h2>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-base sm:text-lg max-w-2xl leading-relaxed"
            style={{ color: "rgba(255,240,210,0.95)" }}
          >
            {c.subtitle}
          </motion.p>

          <motion.a
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            href="#contact"
            className="cta-ripple mt-2 px-7 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
              color: "#0d0900",
              boxShadow: "0 0 24px rgba(232,160,32,0.25)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {c.cta}
          </motion.a>
        </div>

        {/* Pillars grid */}
        <PillarCardsGrid pillars={c.pillars} />
      </div>

      <ContactSection variant="about" locale={locale} />

      <SiteFooter locale={locale} />
    </main>
    </>
  );
}
