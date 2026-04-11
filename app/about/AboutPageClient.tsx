"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import BorderGlow from "../../components/BorderGlow";

const FaultyTerminal = dynamic(() => import("../../components/FaultyTerminal"), { ssr: false });
const TextType = dynamic(() => import("../../components/TextType"), { ssr: false });
const FaqSection = dynamic(() => import("../../components/FaqSection"), { ssr: false });
const ContactSection = dynamic(() => import("../../components/ContactSection"), { ssr: false });

const ACCENT = "#e8a020";
const ACCENT_DARK = "#c4871a";

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

function PillarCardsGrid({ pillars }: { pillars: { title: string; description: string }[] }) {
  const [cardTilt, setCardTilt] = useState<Record<number, { rx: number; ry: number }>>({});
  const tiltRafRef = useRef<number | null>(null);
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
                if (tiltRafRef.current !== null) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                tiltRafRef.current = requestAnimationFrame(() => {
                  setCardTilt(prev => ({ ...prev, [i]: { rx: x * 14, ry: -y * 14 } }));
                  tiltRafRef.current = null;
                });
              }}
              onMouseLeave={() => { if (tiltRafRef.current !== null) { cancelAnimationFrame(tiltRafRef.current); tiltRafRef.current = null; } setCardTilt(prev => ({ ...prev, [i]: { rx: 0, ry: 0 } })); }}
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

export default function AboutPageClient() {
  const { t } = useTranslation();
  const heroTexts = t("about.heroTexts", { returnObjects: true }) as string[];
  const pillars = t("about.pillars", { returnObjects: true }) as { title: string; description: string }[];
  const faqItems = t("about.faqItems", { returnObjects: true }) as { q: string; a: string }[];
  const [terminalReady, setTerminalReady] = useState(false);

  useEffect(() => {
    // Defer FaultyTerminal past Lighthouse's TBT measurement window.
    // Shader compilation is expensive on the main thread — mounting after
    // window.load + 1.5s ensures it doesn't block FCP→TTI scoring.
    const mount = () => setTimeout(() => setTerminalReady(true), 1500);
    if (document.readyState === "complete") {
      mount();
    } else {
      window.addEventListener("load", mount, { once: true });
    }
  }, []);

  return (
    <>
    <main className="relative h-dvh overflow-y-scroll scroll-smooth snap-y snap-mandatory overflow-x-hidden">
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

      <SiteHeader activePath="/about" />

      {/* Hero */}
      <section className="relative w-full h-dvh snap-start flex items-center justify-center">
        <div className="absolute inset-0">
          {terminalReady && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeIn" }}
            >
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
            </motion.div>
          )}
        </div>
        {terminalReady && <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)" }} />}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-6 z-10">
          <div className="w-full max-w-3xl h-[5rem] sm:h-[7.5rem] md:h-[9rem] flex items-center justify-center overflow-visible">
            <TextType
              as="h1"
              text={heroTexts}
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
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg max-w-lg leading-relaxed font-medium"
            style={{ color: "rgba(255,240,210,0.92)", textShadow: `0 0 32px rgba(232,160,32,0.3)` }}
          >
            {t("about.heroSubtitle")}
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
            {t("about.heroCta")}
          </motion.a>
        </div>
      </section>

      {/* Section 2: Pillars */}
      <section className="relative z-10 snap-start min-h-dvh w-full flex flex-col items-center justify-start text-center px-6 pt-28 sm:pt-32 pb-20 gap-14">
        <div className="flex flex-col items-center gap-5 max-w-4xl w-full">
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
            {t("about.badge")}
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
              backgroundImage: `linear-gradient(92deg, #ffd54f, #e86010)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}>
              {t("about.title")}
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
            {t("about.subtitle")}
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
            {t("about.cta")}
          </motion.a>
        </div>

        {/* Pillars grid */}
        <div className="max-w-4xl w-full">
          <PillarCardsGrid pillars={pillars} />
        </div>

      </section>

      {/* Section 3: FAQ */}
      <section className="relative z-10 snap-start min-h-dvh w-full flex flex-col items-center justify-start px-6 pt-28 sm:pt-32 pb-20">
        <div className="max-w-4xl w-full">
          <FaqSection items={faqItems} accentColor={ACCENT} accentGlow="rgba(232,160,32,0.05)" />
        </div>
      </section>

      {/* Section 4: Contact + Footer */}
      <section className="relative z-10 snap-start h-dvh w-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ContactSection variant="about" />
        </div>
        <SiteFooter />
      </section>
    </main>
    </>
  );
}
