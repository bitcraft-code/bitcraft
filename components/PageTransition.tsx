"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const ThinkingOrb = dynamic(() => import("./ThinkingOrb"), { ssr: false });

const ORB_HOLD_MS = 1400;
const SESSION_KEY = "__orb_deadline";

// Module-level: persists across remounts in the same module instance
let seenPath: string | null = null;

function getRemainingMs(): number {
  if (typeof window === "undefined") return 0;
  const v = sessionStorage.getItem(SESSION_KEY);
  if (!v) return 0;
  return Math.max(0, parseInt(v) - Date.now());
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [orbVisible, setOrbVisible] = useState(() => getRemainingMs() > 0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // On remount: restore timer if there's still time left on the deadline
  useEffect(() => {
    const remaining = getRemainingMs();
    if (remaining > 0) {
      setOrbVisible(true);
      timerRef.current = setTimeout(() => {
        sessionStorage.removeItem(SESSION_KEY);
        setOrbVisible(false);
      }, remaining);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On navigation: start a fresh orb cycle
  useEffect(() => {
    if (seenPath !== null && seenPath !== pathname) {
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
          backgroundColor: "#060c18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: orbVisible ? 1 : 0,
          transition: "opacity 0.25s ease-in-out",
          pointerEvents: "none",
        }}
      >
        {orbVisible && <ThinkingOrb />}
      </div>
    </>
  );
}
