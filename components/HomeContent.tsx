"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Grainient from "../components/Grainient";
import RotatingText from "../components/RotatingText";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { translations, detectLocale, type Locale } from "../lib/translations";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
  show: { opacity: 1, y: 0 },
};

const DARK = {
  grainient: { color1: "#00aaff", color2: "#0d2d45", color3: "#00ff9f", contrast: 1.3, gamma: 1.1, saturation: 0.9, zoom: 0.85 },
  overlay: "rgba(6,14,28,0.38)",
  header: { bg: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", shadow: "0 4px 24px rgba(0,0,0,0.12)" },
  logoBg: "rgba(255,255,255,0.18)", logoBorder: "1px solid rgba(255,255,255,0.25)", logoStroke: "#ffffff", logoText: "#ffffff",
  navText: "rgba(255,255,255,0.75)", navHoverText: "#ffffff", navHoverBg: "rgba(255,255,255,0.12)",
  badge: { bg: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.28)", color: "#ffffff", dot: "#00ff9f" },
  heading: "#ffffff", subtitle: "rgba(255,255,255,0.75)",
  btnPrimary: { bg: "#ffffff", color: "#0a192f", shadow: "0 2px 20px rgba(255,255,255,0.25)" },
  btnSecondary: { bg: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", color: "#ffffff" },
  toggleBg: "rgba(255,255,255,0.14)", toggleBorder: "1px solid rgba(255,255,255,0.28)", toggleColor: "#ffffff",
};

const LIGHT = {
  grainient: { color1: "#00aaff", color2: "#e8f7ff", color3: "#00cc88", contrast: 1.0, gamma: 0.95, saturation: 0.7, zoom: 0.88 },
  overlay: "rgba(240,252,255,0.28)",
  header: { bg: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,100,160,0.18)", shadow: "0 4px 24px rgba(0,120,200,0.10)" },
  logoBg: "rgba(0,170,255,0.12)", logoBorder: "1px solid rgba(0,170,255,0.25)", logoStroke: "#0a192f", logoText: "#0a192f",
  navText: "rgba(10,25,47,0.65)", navHoverText: "#0a192f", navHoverBg: "rgba(0,170,255,0.10)",
  badge: { bg: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,170,255,0.25)", color: "#0a192f", dot: "#00aaff" },
  heading: "#0a192f", subtitle: "rgba(10,25,47,0.65)",
  btnPrimary: { bg: "#0a192f", color: "#ffffff", shadow: "0 2px 20px rgba(10,25,47,0.20)" },
  btnSecondary: { bg: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,170,255,0.28)", color: "#0a192f" },
  toggleBg: "rgba(255,255,255,0.55)", toggleBorder: "1px solid rgba(0,170,255,0.28)", toggleColor: "#0a192f",
};


export default function HomeContent() {
  const [dark, setDark] = useState(true);
  const [locale, setLocale] = useState<Locale>("en");
  const [heroSpotlight, setHeroSpotlight] = useState<{ id: string | null; x: number; y: number }>({ id: null, x: 0, y: 0 });
  const [pillSpotlight, setPillSpotlight] = useState({ hover: false, x: 0, y: 0 });
  const lastTouchAt = useRef(0);
  const t = dark ? DARK : LIGHT;
  const copy = translations[locale];

  useEffect(() => { setLocale(detectLocale()); }, []);

  const wasTouched = () => Date.now() - lastTouchAt.current < 600;
  const onTouchBegin = (setter: (x: number, y: number) => void) => (e: React.TouchEvent) => {
    lastTouchAt.current = Date.now();
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setter(touch.clientX - rect.left, touch.clientY - rect.top);
  };
  const sp = (hover: boolean, x: number, y: number) => ({ active: hover, pos: `${x}px ${y}px` });

  return (
    <main className="relative min-h-[100dvh] flex flex-col select-none overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {/* CSS gradient fallback, sempre visível quando WebGL falha (mobile) */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: 1 }}
          style={{
            background: dark
              ? `radial-gradient(ellipse 90% 70% at 15% 25%, rgba(0,170,255,0.35) 0%, transparent 55%),
                 radial-gradient(ellipse 70% 90% at 85% 75%, rgba(0,255,159,0.25) 0%, transparent 55%),
                 radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,100,200,0.15) 0%, transparent 70%),
                 #0d2d45`
              : `radial-gradient(ellipse 90% 70% at 15% 25%, rgba(0,170,255,0.30) 0%, transparent 55%),
                 radial-gradient(ellipse 70% 90% at 85% 75%, rgba(0,204,136,0.20) 0%, transparent 55%),
                 #e8f7ff`,
            transition: "background 0.6s ease",
          }}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={dark ? "dark" : "light"}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Grainient
              color1={t.grainient.color1}
              color2={t.grainient.color2}
              color3={t.grainient.color3}
              timeSpeed={0.32}
              colorBalance={0.1}
              warpStrength={1.2}
              warpFrequency={4}
              warpSpeed={1.5}
              warpAmplitude={60}
              blendAngle={15}
              blendSoftness={0.08}
              rotationAmount={400}
              noiseScale={2}
              grainAmount={0.06}
              grainScale={2}
              grainAnimated={false}
              contrast={t.grainient.contrast}
              gamma={t.grainient.gamma}
              saturation={t.grainient.saturation}
              centerX={0}
              centerY={0}
              zoom={t.grainient.zoom}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ background: t.overlay }}
        transition={{ duration: 0.5 }}
        style={{ background: t.overlay }}
      />

      {/* ── Header ── */}
      <SiteHeader
        dark={dark}
        locale={locale}
        onToggleDark={() => setDark((d) => !d)}
        onToggleLocale={() => setLocale((l) => (l === "en" ? "pt" : "en"))}
      />

      {/* ── Hero ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1 px-5 pb-8 pt-4 sm:px-6 sm:pb-16 sm:pt-8 gap-6 sm:gap-10 md:gap-12">

        {/* Badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
          whileInView={{ background: t.badge.bg, border: t.badge.border, color: t.badge.color }}
          viewport={{ once: true }}
          style={{ background: t.badge.bg, border: t.badge.border, color: t.badge.color }}
        >
          <span className="relative flex shrink-0 w-2 h-2">
            <motion.span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" animate={{ background: t.badge.dot }} transition={{ duration: 0.4 }} />
            <motion.span className="relative inline-flex w-2 h-2 rounded-full" animate={{ background: t.badge.dot }} transition={{ duration: 0.4 }} />
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={locale + "-badge"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {copy.badge}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Heading */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-black leading-[1.1] tracking-tight flex flex-nowrap items-baseline justify-center gap-x-2 sm:gap-x-3 max-w-full px-4"
          style={{ fontFamily: "var(--font-manrope)", fontSize: "clamp(1.25rem, 5.8vw, 3.75rem)" }}
        >
          <LayoutGroup id="hero-heading">
          <motion.span layout animate={{ color: t.heading }} transition={{ duration: 0.4, layout: { type: "spring", damping: 30, stiffness: 150 } }} style={{ color: t.heading }}>
            {copy.headingStatic}
          </motion.span>
          <RotatingText
            key={locale}
            texts={copy.rotatingTexts}
            mainClassName={`px-5 sm:px-6 md:px-8 py-1 sm:py-2 md:py-3 items-center justify-center rounded-full leading-normal backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(255,255,255,0.1)] ${dark ? "bg-white/[0.08] text-white border border-white/[0.18]" : "bg-white/[0.35] text-[#0a192f] border border-white/[0.5]"}`}
            onMouseMove={(e) => {
              if (wasTouched()) return;
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setPillSpotlight({ hover: true, x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseLeave={() => { if (!wasTouched()) setPillSpotlight((p) => ({ ...p, hover: false })); }}
            onTouchStart={onTouchBegin((x, y) => setPillSpotlight({ hover: true, x, y }))}
            onTouchEnd={() => setPillSpotlight((p) => ({ ...p, hover: false }))}
            onTouchCancel={() => setPillSpotlight((p) => ({ ...p, hover: false }))}
            overlay={(() => { const s = sp(pillSpotlight.hover, pillSpotlight.x, pillSpotlight.y); return (<>
                <span className="absolute inset-0 rounded-full pointer-events-none overflow-hidden" style={{ opacity: s.active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 160px at ${s.pos}, ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,170,255,0.12)"}, transparent 70%)` }} />
                <span className="absolute inset-0 rounded-full pointer-events-none" style={{ opacity: s.active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 160px at ${s.pos}, ${dark ? "rgba(255,255,255,1)" : "rgba(0,110,255,1)"}, transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "1.5px" }} />
              </>); })()}
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.015}
            splitLevelClassName="overflow-hidden"
            transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
            rotationInterval={3000}
          />
          </LayoutGroup>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-sm sm:text-base md:text-lg lg:text-xl max-w-xl leading-relaxed font-medium text-balance"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={locale + "-subtitle"}
              className="block"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <motion.span
                animate={{ color: dark ? "rgba(255,255,255,0.65)" : "rgba(10,25,47,0.60)" }}
                transition={{ duration: 0.4 }}
              >{copy.subtitle}</motion.span>
            </motion.span>
          </AnimatePresence>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8"
        >
          <motion.a
            href="/software"
            className="relative w-full sm:w-auto sm:min-w-[200px] px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-bold text-center overflow-hidden"
            animate={{ background: t.btnPrimary.bg, color: t.btnPrimary.color, boxShadow: t.btnPrimary.shadow }}
            transition={{ duration: 0.4 }}
            style={{ background: t.btnPrimary.bg, color: t.btnPrimary.color, boxShadow: t.btnPrimary.shadow }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onMouseMove={(e) => {
              if (wasTouched()) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setHeroSpotlight({ id: "software", x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseLeave={() => { if (!wasTouched()) setHeroSpotlight((p) => ({ ...p, id: null })); }}
            onTouchStart={onTouchBegin((x, y) => setHeroSpotlight({ id: "software", x, y }))}
            onTouchEnd={() => setHeroSpotlight((p) => ({ ...p, id: null }))}
            onTouchCancel={() => setHeroSpotlight((p) => ({ ...p, id: null }))}
          >
            {(() => { const s = sp(heroSpotlight.id === "software", heroSpotlight.x, heroSpotlight.y); return (<>
            <span className="absolute inset-0 rounded-full pointer-events-none overflow-hidden" style={{ opacity: s.active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 80px at ${s.pos}, ${dark ? "rgba(0,170,255,0.25)" : "rgba(255,255,255,0.35)"}, transparent 70%)` }} />
            <span className="absolute inset-0 rounded-full pointer-events-none" style={{ opacity: s.active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 80px at ${s.pos}, ${dark ? "rgba(0,150,255,1)" : "rgba(255,255,255,0.9)"}, transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "1.5px" }} />
            </>); })()}
            {copy.btnSoftware}
          </motion.a>

          <motion.a
            href="/agency"
            className="relative w-full sm:w-auto sm:min-w-[200px] px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-bold text-center"
            animate={{ background: t.btnSecondary.bg, border: t.btnSecondary.border, color: t.btnSecondary.color }}
            transition={{ duration: 0.4 }}
            style={{ background: t.btnSecondary.bg, border: t.btnSecondary.border, color: t.btnSecondary.color, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onMouseMove={(e) => {
              if (wasTouched()) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setHeroSpotlight({ id: "agency", x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseLeave={() => { if (!wasTouched()) setHeroSpotlight((p) => ({ ...p, id: null })); }}
            onTouchStart={onTouchBegin((x, y) => setHeroSpotlight({ id: "agency", x, y }))}
            onTouchEnd={() => setHeroSpotlight((p) => ({ ...p, id: null }))}
            onTouchCancel={() => setHeroSpotlight((p) => ({ ...p, id: null }))}
          >
            {(() => { const s = sp(heroSpotlight.id === "agency", heroSpotlight.x, heroSpotlight.y); return (<>
            <span className="absolute inset-0 rounded-full pointer-events-none overflow-hidden" style={{ opacity: s.active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 80px at ${s.pos}, ${dark ? "rgba(255,255,255,0.10)" : "rgba(0,170,255,0.10)"}, transparent 70%)` }} />
            <span className="absolute inset-0 rounded-full pointer-events-none" style={{ opacity: s.active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 80px at ${s.pos}, ${dark ? "rgba(255,255,255,1)" : "rgba(0,110,255,1)"}, transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "1.5px" }} />
            </>); })()}
            {copy.btnAgency}
          </motion.a>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <SiteFooter dark={dark} locale={locale} />
    </main>
  );
}
