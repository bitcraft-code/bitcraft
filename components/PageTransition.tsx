"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const ThinkingOrb = dynamic(() => import("./ThinkingOrb"), { ssr: false });

const ORB_HOLD_MS = 1400;
const SESSION_KEY = "__orb_deadline";
const SESSION_COLOR_KEY = "__orb_color";
const SESSION_ACCENT_KEY = "__orb_accent";

// Background color of each page (used as overlay bg when leaving that page)
const PAGE_COLORS: Record<string, string> = {
  "/": "#071a14",
  "/software": "#07130f",
  "/agency": "#080f1e",
  "/about": "#130e04",
  "/contact": "#0a192f",
};

// Accent color (RGB triple) matching each page's visual language
const PAGE_ACCENTS: Record<string, string> = {
  "/": "0, 255, 159",
  "/software": "0, 255, 159",
  "/agency": "0, 170, 255",
  "/about": "232, 160, 32",
  "/contact": "0, 170, 255",
};

// Maps pathname to translation key for per-page loading tasks
const PATH_TO_KEY: Record<string, string> = {
  "/": "home",
  "/software": "software",
  "/agency": "agency",
  "/about": "about",
  "/contact": "contact",
};

// Module-level: persists across remounts in the same module instance
let seenPath: string | null = null;

function getRemainingMs(): number {
  if (typeof window === "undefined") return 0;
  const v = sessionStorage.getItem(SESSION_KEY);
  if (!v) return 0;
  return Math.max(0, parseInt(v) - Date.now());
}

function getStoredColor(): string {
  if (typeof window === "undefined") return "#071a14";
  return sessionStorage.getItem(SESSION_COLOR_KEY) ?? "#071a14";
}

function getStoredAccent(): string {
  if (typeof window === "undefined") return "0, 170, 255";
  return sessionStorage.getItem(SESSION_ACCENT_KEY) ?? "0, 170, 255";
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [orbVisible, setOrbVisible] = useState(() => getRemainingMs() > 0);
  const [orbColor, setOrbColor] = useState(getStoredColor);
  const [orbAccent, setOrbAccent] = useState(getStoredAccent);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Destination page tasks (locale-aware, reactive to i18n changes)
  const pageKey = PATH_TO_KEY[pathname] ?? "home";
  const tasks = t(`transition.${pageKey}`, { returnObjects: true }) as string[];
  const safeTasks = Array.isArray(tasks) ? tasks : undefined;

  // On remount: restore timer if there's still time left on the deadline
  useEffect(() => {
    const remaining = getRemainingMs();
    if (remaining > 0) {
      setOrbVisible(true);
      setOrbColor(getStoredColor());
      setOrbAccent(getStoredAccent());
      timerRef.current = setTimeout(() => {
        sessionStorage.removeItem(SESSION_KEY);
        setOrbVisible(false);
      }, remaining);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On navigation: capture source page color, then show orb
  useEffect(() => {
    if (seenPath !== null && seenPath !== pathname) {
      const sourceBg = PAGE_COLORS[seenPath] ?? "#071a14";
      const sourceAccent = PAGE_ACCENTS[seenPath] ?? "0, 170, 255";

      sessionStorage.setItem(SESSION_COLOR_KEY, sourceBg);
      sessionStorage.setItem(SESSION_ACCENT_KEY, sourceAccent);
      setOrbColor(sourceBg);
      setOrbAccent(sourceAccent);

      const deadline = Date.now() + ORB_HOLD_MS;
      sessionStorage.setItem(SESSION_KEY, String(deadline));
      setOrbVisible(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        sessionStorage.removeItem(SESSION_KEY);
        setOrbVisible(false);
      }, ORB_HOLD_MS);
    }
    seenPath = pathname;
  }, [pathname]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{ width: "100%" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: orbColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: orbVisible ? 1 : 0,
          transition: "opacity 0.25s ease-in-out",
          pointerEvents: "none",
        }}
      >
        {orbVisible && <ThinkingOrb accentRgb={orbAccent} tasks={safeTasks} />}
      </div>
    </>
  );
}
