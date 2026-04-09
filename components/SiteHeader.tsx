"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";

function scrollToSection(selector: string) {
  requestAnimationFrame(() => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

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

type Props = {
  dark?: boolean;
  activePath?: string;
  entranceDelay?: number;
  onToggleDark?: () => void;
};


export default function SiteHeader({
  dark = true,
  activePath,
  entranceDelay = 0,
  onToggleDark,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as "en" | "pt";
  const [scrolled, setScrolled] = useState(false);
  const [headerMouse, setHeaderMouse] = useState({ x: 0, y: 0, hover: false });
  const [navHovered, setNavHovered] = useState<string | null>(null);
  const [ctrlSpotlight, setCtrlSpotlight] = useState<{ id: string | null; x: number; y: number }>({ id: null, x: 0, y: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pillExpanded, setPillExpanded] = useState(false);
  const lastTouchAt = useRef(0);
  const headerRafRef = useRef<number | null>(null);
  const ctrlRafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      setPillExpanded(true);
    } else {
      const timer = setTimeout(() => setPillExpanded(false), 300);
      return () => clearTimeout(timer);
    }
  }, [mobileOpen]);

  const wasTouched = () => Date.now() - lastTouchAt.current < 600;
  const onTouchBegin = (setter: (x: number, y: number) => void) => (e: React.TouchEvent) => {
    lastTouchAt.current = Date.now();
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setter(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const T = {
    header: dark
      ? {
          bg: scrolled ? "rgba(8,8,18,0.82)" : "rgba(12,12,24,0.12)",
          border: scrolled ? "1px solid rgba(255,255,255,0.13)" : "1px solid rgba(255,255,255,0.18)",
          shadow: scrolled
            ? "0 8px 48px rgba(0,0,0,0.40)"
            : "0 4px 28px rgba(0,0,0,0.16)",
        }
      : {
          bg: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.50)",
          border: scrolled ? "1px solid rgba(0,100,160,0.22)" : "1px solid rgba(0,100,160,0.14)",
          shadow: scrolled
            ? "0 8px 48px rgba(0,100,200,0.18)"
            : "0 4px 28px rgba(0,120,200,0.12)",
        },
    logoBg: dark ? "rgba(255,255,255,0.14)" : "rgba(0,170,255,0.10)",
    logoBorder: dark ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(0,170,255,0.22)",
    logoStroke: dark ? "#ffffff" : "#0a192f",
    logoText: dark ? "#ffffff" : "#0a192f",
    navText: dark ? "rgba(255,255,255,0.62)" : "rgba(10,25,47,0.58)",
    navHoverText: dark ? "#ffffff" : "#0a192f",
    navPillBg: dark ? "rgba(255,255,255,0.10)" : "rgba(0,140,220,0.09)",
    divider: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
    toggleBg: dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.60)",
    toggleBorder: dark ? "1px solid rgba(255,255,255,0.20)" : "1px solid rgba(0,170,255,0.22)",
    toggleColor: dark ? "#ffffff" : "#0a192f",
    ctaBg: dark ? "rgba(255,255,255,0.13)" : "rgba(0,140,220,0.10)",
    ctaBorder: dark ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(0,140,220,0.32)",
    ctaText: dark ? "#ffffff" : "#0a192f",
    spotlightFill: "rgba(255,255,255,0.08)",
    spotlightBorder: "rgba(255,255,255,0.9)",
    // Liquid glass layers
    specular: dark
      ? "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)"
      : "linear-gradient(180deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.10) 50%, transparent 100%)",
    causticBorder: dark
      ? "linear-gradient(175deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.06) 65%, rgba(255,255,255,0.12) 100%)"
      : "linear-gradient(175deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.10) 65%, rgba(255,255,255,0.25) 100%)",
    iridescent: dark
      ? "linear-gradient(125deg, rgba(130,210,255,0.05) 0%, transparent 28%, rgba(210,160,255,0.04) 56%, transparent 78%, rgba(130,255,200,0.03) 100%)"
      : "linear-gradient(125deg, rgba(100,180,255,0.08) 0%, transparent 28%, rgba(180,130,255,0.06) 56%, transparent 78%, rgba(100,255,180,0.05) 100%)",
  };

  const pageAccent =
    activePath === "/software" ? "#00ff9f" :
    activePath === "/agency"   ? "#00aaff" :
    activePath === "/about"    ? "#e8a020" :
    "#00ff9f";

  const navItems = [
    { label: t("nav.software"), href: "/software", activeColor: "#00ff9f" },
    { label: t("nav.agency"),   href: "/agency",   activeColor: "#00aaff" },
    { label: t("nav.about"),    href: "/about",    activeColor: "#e8a020" },
  ];

  const mobileNavItems = [
    { label: t("nav.home"),     href: "/",         activeColor: "#00ff9f" },
    { label: t("nav.software"), href: "/software", activeColor: "#00ff9f" },
    { label: t("nav.agency"),   href: "/agency",   activeColor: "#00aaff" },
    { label: t("nav.about"),    href: "/about",    activeColor: "#e8a020" },
    { label: t("nav.contact"),  href: "#contact",  activeColor: pageAccent },
  ];

  const spotlightSpans = (active: boolean, x: number, y: number, r: number) => (
    <>
      <span className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: "inherit", opacity: active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle ${r}px at ${x}px ${y}px, ${T.spotlightFill}, transparent 70%)` }} />
      <span className="absolute inset-0 pointer-events-none" style={{ borderRadius: "inherit", opacity: active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle ${r}px at ${x}px ${y}px, ${T.spotlightBorder}, transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "1.5px" }} />
    </>
  );

  const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
  const springNav = { type: "spring" as const, stiffness: 380, damping: 32 };

  return (
    <>
      {/* Invisible backdrop to close mobile menu on outside tap */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-10 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, delay: entranceDelay, ease: easeOut }}
        className="fixed top-0 left-0 right-0 z-20 flex justify-center px-4 pt-5"
      >
        {/* Unified pill */}
        <motion.div
          className="relative w-full max-w-5xl overflow-hidden"
          animate={{
            background: T.header.bg,
            border: T.header.border,
            boxShadow: T.header.shadow,
            borderRadius: pillExpanded ? 25 : 9999,
          }}
          transition={{ duration: 0.35, borderRadius: { type: "spring", stiffness: 260, damping: 28 } }}
          style={{
            background: T.header.bg,
            border: T.header.border,
            boxShadow: T.header.shadow,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
          onMouseMove={(e) => {
            if (wasTouched() || headerRafRef.current !== null) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            headerRafRef.current = requestAnimationFrame(() => {
              setHeaderMouse({ x, y, hover: true });
              headerRafRef.current = null;
            });
          }}
          onMouseLeave={() => {
            if (!wasTouched()) {
              if (headerRafRef.current !== null) { cancelAnimationFrame(headerRafRef.current); headerRafRef.current = null; }
              setHeaderMouse((p) => ({ ...p, hover: false }));
            }
          }}
          onTouchStart={onTouchBegin((x, y) => setHeaderMouse({ hover: true, x, y }))}
          onTouchEnd={() => setHeaderMouse((p) => ({ ...p, hover: false }))}
          onTouchCancel={() => setHeaderMouse((p) => ({ ...p, hover: false }))}
        >
          {/* ── Liquid Glass Layers ────────────────────────────────── */}

          {/* 1. Specular top highlight — light reflecting off the curved top edge, breathing */}
          <motion.span
            className="absolute inset-x-0 top-0 pointer-events-none"
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            style={{
              height: "58%",
              borderRadius: "inherit",
              background: T.specular,
            }}
          />

          {/* 2. Caustic gradient border — brighter at top edge, dimmer at bottom (glass thickness illusion) */}
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: "inherit",
              background: T.causticBorder,
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              padding: "1px",
            }}
          />

          {/* 3. Iridescent prismatic overlay — very subtle rainbow refraction */}
          <span
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: "inherit", background: T.iridescent }}
          />

          {/* 4. Mouse spotlight (interactive) */}
          <span className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: "inherit", opacity: headerMouse.hover ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 220px at ${headerMouse.x}px ${headerMouse.y}px, ${T.spotlightFill}, transparent 70%)` }} />
          <span className="absolute inset-0 pointer-events-none" style={{ borderRadius: "inherit", opacity: headerMouse.hover ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 120px at ${headerMouse.x}px ${headerMouse.y}px, ${T.spotlightBorder}, transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "2px" }} />

          {/* ── Top bar ───────────────────────────────────────────── */}
          <motion.div
            className="relative flex items-center justify-between px-4 sm:px-5 md:pl-7 md:pr-5"
            animate={{ paddingTop: scrolled ? 8 : 12, paddingBottom: scrolled ? 8 : 12 }}
            transition={{ duration: 0.35 }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <motion.div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
                animate={{ background: T.logoBg, border: T.logoBorder }}
                transition={{ duration: 0.4 }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke={T.logoStroke}>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </motion.div>
              <motion.span className="font-bold text-sm tracking-wide" animate={{ color: T.logoText }} transition={{ duration: 0.4 }}>
                Bitcraft
              </motion.span>
            </Link>

            {/* Desktop nav + controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sliding pill nav */}
              <nav className="hidden lg:flex items-center gap-0.5">
                {navItems.map((item) => {
                  const isActive = activePath === item.href;
                  const isHighlighted = navHovered ? navHovered === item.href : isActive;
                  return (
                    <div key={item.href} className="relative">
                      {isHighlighted && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full"
                          style={{ background: T.navPillBg }}
                          transition={springNav}
                        />
                      )}
                      <Link
                        href={item.href}
                        className="relative z-10 flex px-4 py-2 md:px-5 rounded-full text-sm font-medium whitespace-nowrap"
                        style={{ color: isActive ? T.navHoverText : T.navText, transition: "color 0.22s ease" }}
                        onMouseEnter={() => setNavHovered(item.href)}
                        onMouseLeave={() => setNavHovered(null)}
                      >
                        {item.label}
                      </Link>
                    </div>
                  );
                })}
              </nav>

              <div className="hidden lg:block w-px h-5 shrink-0" style={{ background: T.divider }} />

              {/* CTA — Contact */}
              <motion.a
                href="#contact"
                onClick={(e) => { e.preventDefault(); scrollToSection("#contact"); }}
                className="hidden lg:flex items-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer"
                style={{ background: T.ctaBg, border: T.ctaBorder, color: T.ctaText, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
                animate={{ background: T.ctaBg, border: T.ctaBorder, color: T.ctaText }}
                transition={{ duration: 0.35 }}
                whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 22 } }}
                whileTap={{ scale: 0.96 }}
              >
                {t("nav.contact")}
              </motion.a>

              {/* Language toggle */}
              <motion.button
                onClick={() => i18n.changeLanguage(locale === "en" ? "pt" : "en")}
                className="relative h-7 px-2.5 sm:h-8 sm:px-3 rounded-full flex items-center justify-center text-xs font-bold tracking-widest"
                animate={{ background: T.toggleBg, border: T.toggleBorder, color: T.toggleColor }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                aria-label="Toggle language"
                style={{ background: T.toggleBg, border: T.toggleBorder, color: T.toggleColor, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", minWidth: "2.5rem" }}
                onMouseMove={(e) => {
                  if (wasTouched() || ctrlRafRef.current !== null) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  ctrlRafRef.current = requestAnimationFrame(() => {
                    setCtrlSpotlight({ id: "locale", x, y });
                    ctrlRafRef.current = null;
                  });
                }}
                onMouseLeave={() => { if (!wasTouched()) { if (ctrlRafRef.current !== null) { cancelAnimationFrame(ctrlRafRef.current); ctrlRafRef.current = null; } setCtrlSpotlight((p) => ({ ...p, id: null })); } }}
                onTouchStart={onTouchBegin((x, y) => setCtrlSpotlight({ id: "locale", x, y }))}
                onTouchEnd={() => setCtrlSpotlight((p) => ({ ...p, id: null }))}
                onTouchCancel={() => setCtrlSpotlight((p) => ({ ...p, id: null }))}
              >
                {spotlightSpans(ctrlSpotlight.id === "locale", ctrlSpotlight.x, ctrlSpotlight.y, 50)}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={locale} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                    {locale === "en" ? "EN" : "PT"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              {onToggleDark && (
                <motion.button
                  onClick={onToggleDark}
                  className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                  animate={{ background: T.toggleBg, border: T.toggleBorder, color: T.toggleColor }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  aria-label="Toggle theme"
                  style={{ background: T.toggleBg, border: T.toggleBorder, color: T.toggleColor, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
                  onMouseMove={(e) => {
                    if (wasTouched() || ctrlRafRef.current !== null) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    ctrlRafRef.current = requestAnimationFrame(() => {
                      setCtrlSpotlight({ id: "theme", x, y });
                      ctrlRafRef.current = null;
                    });
                  }}
                  onMouseLeave={() => { if (!wasTouched()) { if (ctrlRafRef.current !== null) { cancelAnimationFrame(ctrlRafRef.current); ctrlRafRef.current = null; } setCtrlSpotlight((p) => ({ ...p, id: null })); } }}
                  onTouchStart={onTouchBegin((x, y) => setCtrlSpotlight({ id: "theme", x, y }))}
                  onTouchEnd={() => setCtrlSpotlight((p) => ({ ...p, id: null }))}
                  onTouchCancel={() => setCtrlSpotlight((p) => ({ ...p, id: null }))}
                >
                  {spotlightSpans(ctrlSpotlight.id === "theme", ctrlSpotlight.x, ctrlSpotlight.y, 50)}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={dark ? "moon" : "sun"} initial={{ opacity: 0, rotate: -30, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 30, scale: 0.7 }} transition={{ duration: 0.2 }}>
                      {dark ? <MoonIcon /> : <SunIcon />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Hamburger */}
              <button
                className="lg:hidden relative flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
                style={{ background: T.toggleBg, border: T.toggleBorder, color: T.toggleColor }}
              >
                <span className="relative w-4 h-4 flex items-center justify-center">
                  <motion.span className="absolute block h-[1.5px] w-4 rounded-full bg-current" animate={mobileOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }} transition={{ duration: 0.25, ease: easeOut }} />
                  <motion.span className="absolute block h-[1.5px] w-4 rounded-full bg-current" animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.15 }} />
                  <motion.span className="absolute block h-[1.5px] w-4 rounded-full bg-current" animate={mobileOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }} transition={{ duration: 0.25, ease: easeOut }} />
                </span>
              </button>
            </div>
          </motion.div>

          {/* Mobile expandable nav — inside the pill */}
          <AnimatePresence initial={false}>
            {mobileOpen && (
              <motion.div
                key="mobile-nav"
                className="lg:hidden overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: easeOut }}
              >
                <div style={{ borderTop: `1px solid ${T.divider}`, margin: "0 12px" }} />
                <nav className="flex flex-col p-3 gap-1 pt-2">
                  {mobileNavItems.map((item) => (
                    <a
                      key={item.href + item.label}
                      href={item.href.startsWith("#") ? undefined : item.href}
                      onClick={(e) => {
                        if (item.href.startsWith("#")) {
                          e.preventDefault();
                          setMobileOpen(false);
                          setTimeout(() => scrollToSection(item.href), 320);
                        } else {
                          setMobileOpen(false);
                        }
                      }}
                      className="flex items-center justify-end px-4 py-3 rounded-xl text-base font-bold transition-colors duration-150 cursor-pointer"
                      style={{
                        color: activePath === item.href ? item.activeColor : T.navText,
                        background: "transparent",
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
                <div className="px-3 pb-3">
                  <div style={{ height: "1px", background: T.divider, marginBottom: "8px" }} />
                  <button
                    onClick={() => { i18n.changeLanguage(locale === "en" ? "pt" : "en"); setMobileOpen(false); }}
                    className="w-full flex items-center justify-end gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ color: T.navText }}
                  >
                    <span className="text-xs font-bold tracking-widest opacity-60">{locale === "en" ? "EN" : "PT"}</span>
                    <span>{t("nav.languageLabel")}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.header>
    </>
  );
}
