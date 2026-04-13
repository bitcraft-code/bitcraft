"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export type FaqItem = { q: string; a: string };

type Props = {
  items: FaqItem[];
  accentColor: string;
  accentGlow: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const slideUp = {
  hidden: { y: 24 },
  visible: (i: number) => ({
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function FaqSection({ items, accentColor, accentGlow }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <div ref={ref} className="w-full flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.h2
          custom={0}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUp}
          className="text-3xl sm:text-4xl font-black tracking-tight text-white"
        >
          {t("faq.title")}
        </motion.h2>
        <motion.p
          custom={1}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUp}
          className="text-sm sm:text-base max-w-md"
          style={{ color: "rgba(255,255,255,0.50)" }}
        >
          {t("faq.subtitle")}
        </motion.p>
      </div>

      <div className="w-full flex flex-col gap-3">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={i}
              custom={i + 2}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={slideUp}
            >
              <div
                className="rounded-xl backdrop-blur-md cursor-pointer select-none text-left"
                style={{
                  border: `1px solid ${isOpen ? accentColor + "40" : "rgba(255,255,255,0.08)"}`,
                  background: isOpen ? accentGlow : "rgba(255,255,255,0.03)",
                  transition: "border-color 0.25s ease, background 0.25s ease",
                }}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="text-sm sm:text-base font-semibold text-white leading-snug">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="shrink-0 w-5 h-5 flex items-center justify-center text-xl font-light leading-none"
                    style={{ color: accentColor }}
                  >
                    +
                  </motion.span>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <p
                        className="px-5 pb-5 text-sm leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.68)" }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
