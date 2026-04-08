"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Grainient from "../components/Grainient";
import RotatingText from "../components/RotatingText";
import ShinyText from "../components/ShinyText";
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
  badge: { bg: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.28)", color: "#ffffff", dot: "#ffffff" },
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

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(true);
  const [locale, setLocale] = useState<Locale>("en");
  const [headerMouse, setHeaderMouse] = useState({ x: 0, y: 0, hover: false });
  const [navSpotlight, setNavSpotlight] = useState<{ idx: number | null; x: number; y: number }>({ idx: null, x: 0, y: 0 });
  const [heroSpotlight, setHeroSpotlight] = useState<{ id: string | null; x: number; y: number }>({ id: null, x: 0, y: 0 });
  const [ctrlSpotlight, setCtrlSpotlight] = useState<{ id: string | null; x: number; y: number }>({ id: null, x: 0, y: 0 });
  const [pillSpotlight, setPillSpotlight] = useState({ hover: false, x: 0, y: 0 });
  const lastTouchAt = useRef(0);
  const t = dark ? DARK : LIGHT;
  const copy = translations[locale];

  // Mount + browser language detection
  useEffect(() => {
    setMounted(true);
    setLocale(detectLocale());
  }, []);

  const toggleLocale = () => setLocale((l) => (l === "en" ? "pt" : "en"));

  // Guard: ignora synthetic mousemove após touchend (600ms)
  const wasTouched = () => Date.now() - lastTouchAt.current < 600;

  // Factory: touch handler que atualiza posição do spotlight
  const onTouchBegin = (setter: (x: number, y: number) => void) => (e: React.TouchEvent) => {
    lastTouchAt.current = Date.now();
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setter(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  // Transition helper: aparece rápido, desaparece devagar
  const spT = (active: boolean) => active ? "opacity 0.12s ease" : "opacity 0.8s ease";

  // Helper: spotlight position string
  const sp = (hover: boolean, x: number, y: number) => ({
    active: hover,
    pos: `${x}px ${y}px`,
  });

  const navItems = [
    { label: copy.nav.software, href: "/software" },
    { label: copy.nav.agency, href: "/agency" },
    { label: copy.nav.contact, href: "#" },
  ];

  return (
    <main className="relative min-h-[100dvh] flex flex-col select-none overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {/* CSS gradient fallback — sempre visível quando WebGL falha (mobile) */}
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
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="relative z-20 flex justify-center px-4 pt-5"
      >
        <motion.div
          className="relative flex items-center justify-between w-full max-w-5xl px-4 py-2 sm:px-5 sm:py-2.5 md:px-7 md:py-3 rounded-full"
          animate={{ background: t.header.bg, border: t.header.border, boxShadow: t.header.shadow }}
          transition={{ duration: 0.4 }}
          style={{ background: t.header.bg, border: t.header.border, boxShadow: t.header.shadow, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
          onMouseMove={(e) => {
            if (wasTouched()) return;
            const rect = e.currentTarget.getBoundingClientRect();
            setHeaderMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top, hover: true });
          }}
          onMouseLeave={() => { if (!wasTouched()) setHeaderMouse((p) => ({ ...p, hover: false })); }}
          onTouchStart={onTouchBegin((x, y) => setHeaderMouse({ hover: true, x, y }))}
          onTouchEnd={() => setHeaderMouse((p) => ({ ...p, hover: false }))}
          onTouchCancel={() => setHeaderMouse((p) => ({ ...p, hover: false }))}
        >
          {/* Background fill spotlight */}
          <span
            className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
            style={{
              opacity: headerMouse.hover ? 1 : 0,
              transition: "opacity 0.3s ease",
              background: `radial-gradient(circle 200px at ${headerMouse.x}px ${headerMouse.y}px, ${dark ? "rgba(255,255,255,0.10)" : "rgba(0,170,255,0.10)"}, transparent 70%)`,
            }}
          />
          {/* Border spotlight */}
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              opacity: headerMouse.hover ? 1 : 0,
              transition: "opacity 0.3s ease",
              background: `radial-gradient(circle 120px at ${headerMouse.x}px ${headerMouse.y}px, ${dark ? "rgba(255,255,255,1)" : "rgba(0,110,255,1)"}, transparent 70%)`,
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              padding: "2px",
            }}
          />
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <motion.div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
              animate={{ background: t.logoBg, border: t.logoBorder }}
              transition={{ duration: 0.4 }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke={t.logoStroke}>
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </motion.div>
            <motion.span
              className="font-bold text-sm tracking-wide"
              animate={{ color: t.logoText }}
              transition={{ duration: 0.4 }}
            >
              Bitcraft
            </motion.span>
          </div>

          {/* Nav + controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden sm:flex items-center gap-0.5">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href + item.label}
                  href={item.href}
                  className="relative px-4 py-2 md:px-5 rounded-full text-sm font-medium transition-colors duration-200"
                  animate={{ color: t.navText }}
                  transition={{ duration: 0.4 }}
                  onMouseMove={(e) => {
                    if (wasTouched()) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setNavSpotlight({ idx: i, x: e.clientX - rect.left, y: e.clientY - rect.top });
                    (e.currentTarget as HTMLAnchorElement).style.color = t.navHoverText;
                    (e.currentTarget as HTMLAnchorElement).style.background = t.navHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    if (wasTouched()) return;
                    setNavSpotlight((p) => ({ ...p, idx: null }));
                    (e.currentTarget as HTMLAnchorElement).style.color = t.navText;
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }}
                  onTouchStart={onTouchBegin((x, y) => {
                    setNavSpotlight({ idx: i, x, y });
                  })}
                  onTouchEnd={(e) => {
                    setNavSpotlight((p) => ({ ...p, idx: null }));
                    (e.currentTarget as HTMLAnchorElement).style.color = t.navText;
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }}
                  onTouchCancel={(e) => {
                    setNavSpotlight((p) => ({ ...p, idx: null }));
                    (e.currentTarget as HTMLAnchorElement).style.color = t.navText;
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }}
                >
                  {/* Fill spotlight */}
                  <span
                    className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                    style={{
                      opacity: navSpotlight.idx === i ? 1 : 0,
                      transition: "opacity 0.3s ease",
                      background: `radial-gradient(circle 60px at ${navSpotlight.x}px ${navSpotlight.y}px, ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,170,255,0.12)"}, transparent 70%)`,
                    }}
                  />
                  {/* Border spotlight */}
                  <span
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      opacity: navSpotlight.idx === i ? 1 : 0,
                      transition: "opacity 0.3s ease",
                      background: `radial-gradient(circle 60px at ${navSpotlight.x}px ${navSpotlight.y}px, ${dark ? "rgba(255,255,255,1)" : "rgba(0,110,255,1)"}, transparent 70%)`,
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      maskComposite: "exclude",
                      padding: "1.5px",
                    }}
                  />
                  {item.label}
                </motion.a>
              ))}
            </nav>

            {/* Locale toggle */}
            <motion.button
              onClick={toggleLocale}
              className="relative h-7 px-2.5 sm:h-8 sm:px-3 rounded-full flex items-center justify-center text-xs font-bold tracking-widest transition-colors duration-200"
              animate={{ background: t.toggleBg, border: t.toggleBorder, color: t.toggleColor }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              aria-label="Toggle language"
              style={{ background: t.toggleBg, border: t.toggleBorder, color: t.toggleColor, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", minWidth: "2.5rem" }}
              onMouseMove={(e) => {
                if (wasTouched()) return;
                const rect = e.currentTarget.getBoundingClientRect();
                setCtrlSpotlight({ id: "locale", x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => { if (!wasTouched()) setCtrlSpotlight((p) => ({ ...p, id: null })); }}
              onTouchStart={onTouchBegin((x, y) => setCtrlSpotlight({ id: "locale", x, y }))}
              onTouchEnd={() => setCtrlSpotlight((p) => ({ ...p, id: null }))}
              onTouchCancel={() => setCtrlSpotlight((p) => ({ ...p, id: null }))}
            >
              {(() => { const s = sp(ctrlSpotlight.id === "locale", ctrlSpotlight.x, ctrlSpotlight.y); return (<>
              <span className="absolute inset-0 rounded-full pointer-events-none overflow-hidden" style={{ opacity: s.active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 50px at ${s.pos}, ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,170,255,0.12)"}, transparent 70%)` }} />
              <span className="absolute inset-0 rounded-full pointer-events-none" style={{ opacity: s.active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 50px at ${s.pos}, ${dark ? "rgba(255,255,255,1)" : "rgba(0,110,255,1)"}, transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "1.5px" }} />
              </>); })()}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={locale}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {locale === "en" ? "EN" : "PT"}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Theme toggle */}
            <motion.button
              onClick={() => setDark(!dark)}
              className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors duration-200"
              animate={{ background: t.toggleBg, border: t.toggleBorder, color: t.toggleColor }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              aria-label="Toggle theme"
              style={{ background: t.toggleBg, border: t.toggleBorder, color: t.toggleColor, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
              onMouseMove={(e) => {
                if (wasTouched()) return;
                const rect = e.currentTarget.getBoundingClientRect();
                setCtrlSpotlight({ id: "theme", x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => { if (!wasTouched()) setCtrlSpotlight((p) => ({ ...p, id: null })); }}
              onTouchStart={onTouchBegin((x, y) => setCtrlSpotlight({ id: "theme", x, y }))}
              onTouchEnd={() => setCtrlSpotlight((p) => ({ ...p, id: null }))}
              onTouchCancel={() => setCtrlSpotlight((p) => ({ ...p, id: null }))}
            >
              {(() => { const s = sp(ctrlSpotlight.id === "theme", ctrlSpotlight.x, ctrlSpotlight.y); return (<>
              <span className="absolute inset-0 rounded-full pointer-events-none overflow-hidden" style={{ opacity: s.active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 50px at ${s.pos}, ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,170,255,0.12)"}, transparent 70%)` }} />
              <span className="absolute inset-0 rounded-full pointer-events-none" style={{ opacity: s.active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 50px at ${s.pos}, ${dark ? "rgba(255,255,255,1)" : "rgba(0,110,255,1)"}, transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "1.5px" }} />
              </>); })()}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={dark ? "moon" : "sun"}
                  initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  {dark ? <MoonIcon /> : <SunIcon />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </motion.header>

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
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight flex flex-wrap items-baseline justify-center gap-x-2 sm:gap-x-3 gap-y-2 max-w-full px-4"
          style={{ fontFamily: "var(--font-manrope)" }}
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
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
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
      <footer className="relative z-10 w-full px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <motion.span
            className="text-xs font-medium"
            animate={{ color: t.subtitle }}
            transition={{ duration: 0.4 }}
          >
            © {new Date().getFullYear()} Bitcraft. All rights reserved.
          </motion.span>

          <nav className="flex items-center flex-wrap justify-center gap-x-5 gap-y-1">
            {[
              { label: locale === "en" ? "Privacy Policy" : "Política de Privacidade", href: "#" },
              { label: locale === "en" ? "Cookie Policy" : "Política de Cookies", href: "#" },
              { label: locale === "en" ? "Cookie Settings" : "Preferências de Cookies", href: "#" },
            ].map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="text-xs font-medium transition-opacity duration-200 hover:opacity-100"
                animate={{ color: t.subtitle, opacity: 0.7 }}
                transition={{ duration: 0.4 }}
                whileHover={{ opacity: 1 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}
