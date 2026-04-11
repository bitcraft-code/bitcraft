"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const ThinkingOrb = dynamic(() => import("./ThinkingOrb"), { ssr: false });

const ORB_HOLD_MS = 2200;
const ORB_FADE_MS = 400;
const SESSION_KEY = "__orb_deadline";
const SESSION_COLOR_KEY = "__orb_color";
const SESSION_ACCENT_KEY = "__orb_accent";
const SESSION_ACCENT2_KEY = "__orb_accent2";

const PAGE_COLORS: Record<string, string> = {
  "/": "linear-gradient(135deg, #071a14 0%, #0a192f 100%)",
  "/software": "#07130f",
  "/agency": "#080f1e",
  "/about": "#130e04",
  "/contact": "#0a192f",
};

const PAGE_ACCENTS: Record<string, string> = {
  "/": "0, 170, 255",
  "/software": "0, 255, 159",
  "/agency": "0, 170, 255",
  "/about": "232, 160, 32",
  "/contact": "0, 170, 255",
};

// Optional second accent for gradient-colored orb dots
const PAGE_ACCENTS2: Record<string, string> = {
  "/": "0, 255, 159",
};

const PATH_TO_KEY: Record<string, string> = {
  "/": "home",
  "/software": "software",
  "/agency": "agency",
  "/about": "about",
  "/contact": "contact",
};

function getRemainingMs(): number {
  if (typeof window === "undefined") return 0;
  const v = sessionStorage.getItem(SESSION_KEY);
  if (!v) return 0;
  return Math.max(0, parseInt(v) - Date.now());
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Page is hidden while the orb covers the screen so that page animations
  // start fresh exactly when the orb begins to fade out.
  const [pageVisible, setPageVisible] = useState(true);
  const [orbVisible, setOrbVisible] = useState(false);
  const [orbColor, setOrbColor] = useState("#071a14");
  const [orbAccent, setOrbAccent] = useState("0, 170, 255");
  const [orbAccent2, setOrbAccent2] = useState<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const seenPathRef = useRef<string | null>(null);

  const pageKey = PATH_TO_KEY[pathname] ?? "home";
  const tasks = t(`transition.${pageKey}`, { returnObjects: true }) as string[];
  const safeTasks = Array.isArray(tasks) ? tasks : undefined;

  // On remount: restore orb if a deadline is still active
  useEffect(() => {
    const remaining = getRemainingMs();
    if (remaining > 0) {
      setPageVisible(false);
      setOrbVisible(true);
      setOrbColor(sessionStorage.getItem(SESSION_COLOR_KEY) ?? "#071a14");
      setOrbAccent(sessionStorage.getItem(SESSION_ACCENT_KEY) ?? "0, 170, 255");
      setOrbAccent2(sessionStorage.getItem(SESSION_ACCENT2_KEY) ?? undefined);
      timerRef.current = setTimeout(() => {
        sessionStorage.removeItem(SESSION_KEY);
        setOrbVisible(false);
        setPageVisible(true);
      }, remaining);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On navigation: hide page, show orb, reveal page when orb dismisses.
  // useLayoutEffect fires before the browser paints, preventing a one-frame
  // flash of the new page before the overlay covers the screen.
  useLayoutEffect(() => {
    if (seenPathRef.current !== null && seenPathRef.current !== pathname) {
      const destBg = PAGE_COLORS[pathname] ?? "#071a14";
      const destAccent = PAGE_ACCENTS[pathname] ?? "0, 170, 255";
      const destAccent2 = PAGE_ACCENTS2[pathname];

      sessionStorage.setItem(SESSION_COLOR_KEY, destBg);
      sessionStorage.setItem(SESSION_ACCENT_KEY, destAccent);
      if (destAccent2) sessionStorage.setItem(SESSION_ACCENT2_KEY, destAccent2);
      else sessionStorage.removeItem(SESSION_ACCENT2_KEY);

      setOrbColor(destBg);
      setOrbAccent(destAccent);
      setOrbAccent2(destAccent2);
      setPageVisible(false); // unmount current page while orb covers screen
      setOrbVisible(true);

      clearTimeout(timerRef.current);
      const deadline = Date.now() + ORB_HOLD_MS;
      sessionStorage.setItem(SESSION_KEY, String(deadline));

      timerRef.current = setTimeout(() => {
        sessionStorage.removeItem(SESSION_KEY);
        // Mount the new page and dismiss the orb simultaneously — crossfade
        setOrbVisible(false);
        setPageVisible(true);
      }, ORB_HOLD_MS);
    }
    seenPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <>
      <AnimatePresence mode="wait">
        {pageVisible && (
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ORB_FADE_MS / 1000, ease: "easeInOut" }}
            style={{ width: "100%" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: orbVisible ? orbColor : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: orbVisible ? 1 : 0,
          transition: orbVisible ? "none" : `opacity ${ORB_FADE_MS}ms ease-in-out`,
          pointerEvents: "none",
        }}
      >
        {orbVisible && (
          <ThinkingOrb accentRgb={orbAccent} accentRgb2={orbAccent2} tasks={safeTasks} />
        )}
      </div>
    </>
  );
}
