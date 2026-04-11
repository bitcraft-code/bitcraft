"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import HeroCycle, { type HeroAnimation } from "../../components/HeroCycle";
import BorderGlow from "../../components/BorderGlow";

const LetterGlitch = dynamic(() => import("@/components/LetterGlitch"), { ssr: false });
const FaqSection = dynamic(() => import("@/components/FaqSection"), { ssr: false });
const ContactSection = dynamic(() => import("@/components/ContactSection"), { ssr: false });

// ▼ Change this one value to swap the hero animation
const HERO_ANIMATION: HeroAnimation = "decrypt"; // "decrypt" | "split" | "type"

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
  hidden: { opacity: 0, y: 48, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const cardsContainerVariant = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function SoftwarePageClient() {
  const { t } = useTranslation();
  const [cardTilt, setCardTilt] = useState<Record<number, { rx: number; ry: number }>>({});
  const tiltRafRef = useRef<number | null>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const isIntroInView = useInView(introRef, { once: true, amount: 0.3 });
  const gridRef = useRef<HTMLDivElement>(null);
  const isGridInView = useInView(gridRef, { once: true, amount: 0.1 });
  const heroTexts = t("software.heroTexts", { returnObjects: true }) as string[];
  const services = t("software.services", { returnObjects: true }) as { title: string; description: string }[];
  const faqItems = t("software.faqItems", { returnObjects: true }) as { q: string; a: string }[];
  return (
    <>
    <main className="relative h-dvh overflow-y-scroll scroll-smooth snap-y snap-mandatory overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10" style={{
        background: "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0,255,159,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(255,215,0,0.07) 0%, transparent 60%), linear-gradient(180deg, #07130f 0%, #091a14 100%)",
      }} />
      <div className="fixed inset-0 -z-10 ambient-noise" />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,159,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,159,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      <SiteHeader activePath="/software" />

      {/* LetterGlitch hero section */}
      <section className="relative w-full h-dvh snap-start flex items-center justify-center">
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
          <div className="w-full max-w-3xl h-[6rem] sm:h-[7.5rem] md:h-[9rem] flex items-center justify-center overflow-visible">
            <HeroCycle
              animation={HERO_ANIMATION}
              phrases={heroTexts}
              accentColor="#00ff9f"
              accentFont="var(--font-caveat)"
              speed={90}
              displayDuration={2800}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight text-center w-full max-w-3xl"
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg max-w-lg leading-relaxed font-medium"
            style={{ color: "rgba(224,247,250,0.92)", textShadow: "0 0 32px rgba(0,255,159,0.25)" }}
          >
            {t("software.heroSubtitle")}
          </motion.p>
          <motion.a
            href="#contact"
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
            {t("software.heroCta")}
          </motion.a>
        </div>
      </section>

      {/* Section 2: Services */}
      <section className="relative z-10 snap-start min-h-dvh w-full flex flex-col items-center justify-start text-center px-6 pt-28 sm:pt-32 pb-20 gap-14">

        {/* Intro */}
        <div ref={introRef} className="flex flex-col items-center gap-5 max-w-4xl w-full">
          <motion.div
            custom={0}
            initial="hidden"
            animate={isIntroInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{
              background: "rgba(0,255,159,0.07)",
              border: "1px solid rgba(0,255,159,0.2)",
              color: "var(--accent)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {t("software.badge")}
          </motion.div>

          <motion.h2
            custom={1}
            initial="hidden"
            animate={isIntroInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight"
          >
            <span className="text-white">Bitcraft </span>
            <span style={{
              backgroundImage: "linear-gradient(92deg, #00ff9f, #aaffd4)",
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
            animate={isIntroInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-base sm:text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(224,247,250,0.88)" }}
          >
            {t("software.subtitle")}
          </motion.p>

          <motion.a
            custom={3}
            initial="hidden"
            animate={isIntroInView ? "visible" : "hidden"}
            variants={fadeUp}
            href="#contact"
            className="cta-ripple mt-2 px-7 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, var(--accent), #00b870)",
              color: "#05120d",
              boxShadow: "0 0 24px rgba(0,255,159,0.25)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {t("software.cta")}
          </motion.a>
        </div>

        {/* Services grid */}
        <motion.div
          ref={gridRef}
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
          variants={cardsContainerVariant}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl"
        >
          {services.map((s, i) => {
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
                  if (tiltRafRef.current !== null) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width - 0.5;
                  const y = (e.clientY - rect.top) / rect.height - 0.5;
                  tiltRafRef.current = requestAnimationFrame(() => {
                    setCardTilt(p => ({ ...p, [i]: { rx: x * 14, ry: -y * 14 } }));
                    tiltRafRef.current = null;
                  });
                }}
                onMouseLeave={() => { if (tiltRafRef.current !== null) { cancelAnimationFrame(tiltRafRef.current); tiltRafRef.current = null; } setCardTilt(p => ({ ...p, [i]: { rx: 0, ry: 0 } })); }}
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
                  animationDelay={i * 4000}
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

      </section>

      {/* Section 3: FAQ */}
      <section className="relative z-10 snap-start min-h-dvh w-full flex flex-col items-center justify-start px-6 pt-28 sm:pt-32 pb-20">
        <div className="max-w-4xl w-full">
          <FaqSection items={faqItems} accentColor="#00ff9f" accentGlow="rgba(0,255,159,0.05)" />
        </div>
      </section>

      {/* Section 4: Contact + Footer */}
      <section className="relative z-10 snap-start h-dvh w-full flex flex-col overflow-hidden">
        <ContactSection variant="software" />
        <SiteFooter />
      </section>
    </main>
    </>
  );
}
