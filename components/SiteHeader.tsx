"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Locale } from "../lib/translations";

const NAV_LABELS: Record<Locale, { home: string; software: string; agency: string; about: string; contact: string }> = {
  en: { home: "Home", software: "Software", agency: "Agency", about: "About", contact: "Contact" },
  pt: { home: "Início", software: "Software", agency: "Agency", about: "Quem Somos", contact: "Contato" },
};

function scrollToSection(selector: string) {
  requestAnimationFrame(() => {
    const el = document.querySelector(selector);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = window.scrollY + rect.top - 16;
    window.scrollTo({ top, behavior: 'smooth' });
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
  locale?: Locale;
  activePath?: string;
  entranceDelay?: number;
  onToggleDark?: () => void;
  onToggleLocale?: () => void;
};

export default function SiteHeader({
  dark = true,
  locale = "en",
  activePath,
  entranceDelay = 0,
  onToggleDark,
  onToggleLocale,
}: Props) {
  const [headerMouse, setHeaderMouse] = useState({ x: 0, y: 0, hover: false });
  const [navSpotlight, setNavSpotlight] = useState<{ idx: number | null; x: number; y: number }>({ idx: null, x: 0, y: 0 });
  const [ctrlSpotlight, setCtrlSpotlight] = useState<{ id: string | null; x: number; y: number }>({ id: null, x: 0, y: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pillExpanded, setPillExpanded] = useState(false);
  const lastTouchAt = useRef(0);

  useEffect(() => {
    if (mobileOpen) {
      setPillExpanded(true);
    } else {
      const t = setTimeout(() => setPillExpanded(false), 300);
      return () => clearTimeout(t);
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
      ? { bg: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", shadow: "0 4px 24px rgba(0,0,0,0.12)" }
      : { bg: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,100,160,0.18)", shadow: "0 4px 24px rgba(0,120,200,0.10)" },
    logoBg: dark ? "rgba(255,255,255,0.18)" : "rgba(0,170,255,0.12)",
    logoBorder: dark ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(0,170,255,0.25)",
    logoStroke: dark ? "#ffffff" : "#0a192f",
    logoText: dark ? "#ffffff" : "#0a192f",
    navText: dark ? "rgba(255,255,255,0.75)" : "rgba(10,25,47,0.65)",
    navHoverText: dark ? "#ffffff" : "#0a192f",
    navHoverBg: dark ? "rgba(255,255,255,0.12)" : "rgba(0,170,255,0.10)",
    divider: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    toggleBg: dark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.55)",
    toggleBorder: dark ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(0,170,255,0.28)",
    toggleColor: dark ? "#ffffff" : "#0a192f",
    spotlightFill: dark ? "rgba(255,255,255,0.10)" : "rgba(0,170,255,0.10)",
    spotlightBorder: dark ? "rgba(255,255,255,1)" : "rgba(0,110,255,1)",
  };

  const pageAccent =
    activePath === "/software" ? "#00ff9f" :
    activePath === "/agency"   ? "#00aaff" :
    activePath === "/about"    ? "#e8a020" :
    "#00ff9f"; // home

  const navItems = [
    { label: NAV_LABELS[locale].software, href: "/software", activeColor: "#00ff9f" },
    { label: NAV_LABELS[locale].agency,   href: "/agency",   activeColor: "#00aaff" },
    { label: NAV_LABELS[locale].about,    href: "/about",    activeColor: "#e8a020" },
    { label: NAV_LABELS[locale].contact,  href: "#contact",  activeColor: pageAccent, alwaysAccent: false },
  ];

  const mobileNavItems = [
    { label: NAV_LABELS[locale].home,     href: "/",         activeColor: "#00ff9f" },
    { label: NAV_LABELS[locale].software, href: "/software", activeColor: "#00ff9f" },
    { label: NAV_LABELS[locale].agency,   href: "/agency",   activeColor: "#00aaff" },
    { label: NAV_LABELS[locale].about,    href: "/about",    activeColor: "#e8a020" },
    { label: NAV_LABELS[locale].contact,  href: "#contact",  activeColor: pageAccent, alwaysAccent: false },
  ];

  const spotlightSpans = (active: boolean, x: number, y: number, r: number) => (
    <>
      <span className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: "inherit", opacity: active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle ${r}px at ${x}px ${y}px, ${T.spotlightFill}, transparent 70%)` }} />
      <span className="absolute inset-0 pointer-events-none" style={{ borderRadius: "inherit", opacity: active ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle ${r}px at ${x}px ${y}px, ${T.spotlightBorder}, transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "1.5px" }} />
    </>
  );

  const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];

  return (
    <>
      {/* Invisible backdrop to close on outside tap */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-10 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: entranceDelay, ease: easeOut }}
        className="absolute top-0 left-0 right-0 z-20 flex justify-center px-4 pt-5"
      >
        {/* Unified pill — expands to include mobile nav */}
        <motion.div
          className="relative w-full max-w-5xl overflow-hidden"
          animate={{
            background: T.header.bg,
            border: T.header.border,
            boxShadow: T.header.shadow,
          }}
          transition={{ duration: 0.4 }}
          style={{
            borderRadius: pillExpanded ? 25 : 9999,
            background: T.header.bg,
            border: T.header.border,
            boxShadow: T.header.shadow,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
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
          {/* Spotlight overlay on the pill */}
          <span className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: "inherit", opacity: headerMouse.hover ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 200px at ${headerMouse.x}px ${headerMouse.y}px, ${T.spotlightFill}, transparent 70%)` }} />
          <span className="absolute inset-0 pointer-events-none" style={{ borderRadius: "inherit", opacity: headerMouse.hover ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 120px at ${headerMouse.x}px ${headerMouse.y}px, ${T.spotlightBorder}, transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "2px" }} />

          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-2 sm:px-5 sm:py-2.5 md:px-7 md:py-3">
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
            <div className="flex items-center gap-3 sm:gap-4">
              <nav className="hidden sm:flex items-center gap-0.5">
                {navItems.map((item, i) => (
                  <motion.a
                    key={item.href + item.label}
                    href={item.href.startsWith('#') ? undefined : item.href}
                    onClick={item.href.startsWith('#') ? (e) => {
                      e.preventDefault();
                      scrollToSection(item.href);
                    } : undefined}
                    className="relative px-4 py-2 md:px-5 rounded-full text-sm font-medium transition-colors duration-200"
                    animate={{ color: item.alwaysAccent ? item.activeColor : (activePath === item.href ? T.navHoverText : T.navText) }}
                    style={{ background: activePath === item.href ? T.navHoverBg : "transparent" }}
                    transition={{ duration: 0.4 }}
                    onMouseMove={(e) => {
                      if (wasTouched()) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setNavSpotlight({ idx: i, x: e.clientX - rect.left, y: e.clientY - rect.top });
                      (e.currentTarget as HTMLAnchorElement).style.color = T.navHoverText;
                      (e.currentTarget as HTMLAnchorElement).style.background = T.navHoverBg;
                    }}
                    onMouseLeave={(e) => {
                      if (wasTouched()) return;
                      setNavSpotlight((p) => ({ ...p, idx: null }));
                      const restColor = item.alwaysAccent ? item.activeColor : (activePath === item.href ? T.navHoverText : T.navText);
                      (e.currentTarget as HTMLAnchorElement).style.color = restColor;
                      (e.currentTarget as HTMLAnchorElement).style.background = activePath === item.href ? T.navHoverBg : "transparent";
                    }}
                    onTouchStart={onTouchBegin((x, y) => setNavSpotlight({ idx: i, x, y }))}
                    onTouchEnd={(e) => {
                      setNavSpotlight((p) => ({ ...p, idx: null }));
                      (e.currentTarget as HTMLAnchorElement).style.color = item.alwaysAccent ? item.activeColor : (activePath === item.href ? T.navHoverText : T.navText);
                    }}
                    onTouchCancel={(e) => {
                      setNavSpotlight((p) => ({ ...p, idx: null }));
                      (e.currentTarget as HTMLAnchorElement).style.color = item.alwaysAccent ? item.activeColor : (activePath === item.href ? T.navHoverText : T.navText);
                    }}
                  >
                    {spotlightSpans(navSpotlight.idx === i, navSpotlight.x, navSpotlight.y, 60)}
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              {onToggleLocale && (
                <motion.button
                  onClick={onToggleLocale}
                  className="relative h-7 px-2.5 sm:h-8 sm:px-3 rounded-full flex items-center justify-center text-xs font-bold tracking-widest transition-colors duration-200"
                  animate={{ background: T.toggleBg, border: T.toggleBorder, color: T.toggleColor }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  aria-label="Toggle language"
                  style={{ background: T.toggleBg, border: T.toggleBorder, color: T.toggleColor, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", minWidth: "2.5rem" }}
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
                  {spotlightSpans(ctrlSpotlight.id === "locale", ctrlSpotlight.x, ctrlSpotlight.y, 50)}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={locale} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                      {locale === "en" ? "EN" : "PT"}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              )}

              {onToggleDark && (
                <motion.button
                  onClick={onToggleDark}
                  className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                  animate={{ background: T.toggleBg, border: T.toggleBorder, color: T.toggleColor }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  aria-label="Toggle theme"
                  style={{ background: T.toggleBg, border: T.toggleBorder, color: T.toggleColor, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
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
                  {spotlightSpans(ctrlSpotlight.id === "theme", ctrlSpotlight.x, ctrlSpotlight.y, 50)}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={dark ? "moon" : "sun"} initial={{ opacity: 0, rotate: -30, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 30, scale: 0.7 }} transition={{ duration: 0.2 }}>
                      {dark ? <MoonIcon /> : <SunIcon />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Hamburger — mobile only, rightmost */}
              <button
                className="sm:hidden relative flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
                style={{ background: T.toggleBg, border: T.toggleBorder, color: T.toggleColor }}
              >
                <span className="relative w-4 h-4 flex items-center justify-center">
                  <motion.span
                    className="absolute block h-[1.5px] w-4 rounded-full bg-current"
                    animate={mobileOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                  />
                  <motion.span
                    className="absolute block h-[1.5px] w-4 rounded-full bg-current"
                    animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.15 }}
                  />
                  <motion.span
                    className="absolute block h-[1.5px] w-4 rounded-full bg-current"
                    animate={mobileOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                  />
                </span>
              </button>
            </div>
          </div>

          {/* Mobile expandable nav — inside the pill */}
          <AnimatePresence initial={false}>
            {mobileOpen && (
              <motion.div
                key="mobile-nav"
                className="sm:hidden overflow-hidden"
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
                      href={item.href.startsWith('#') ? undefined : item.href}
                      onClick={(e) => {
                        if (item.href.startsWith('#')) {
                          e.preventDefault();
                          setMobileOpen(false);
                          setTimeout(() => {
                            scrollToSection(item.href);
                          }, 320);
                        } else {
                          setMobileOpen(false);
                        }
                      }}
                      className="flex items-center justify-end px-4 py-3 rounded-xl text-base font-bold transition-colors duration-150 cursor-pointer"
                      style={{
                        color: item.alwaysAccent ? item.activeColor : (activePath === item.href ? item.activeColor : T.navText),
                        background: "transparent",
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
                {onToggleLocale && (
                  <div className="px-3 pb-3">
                    <div style={{ height: "1px", background: T.divider, marginBottom: "8px" }} />
                    <button
                      onClick={() => { onToggleLocale(); setMobileOpen(false); }}
                      className="w-full flex items-center justify-end gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                      style={{ color: T.navText }}
                    >
                      <span className="text-xs font-bold tracking-widest opacity-60">{locale === "en" ? "EN" : "PT"}</span>
                      <span>{locale === "en" ? "English" : "Português"}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.header>
    </>
  );
}
