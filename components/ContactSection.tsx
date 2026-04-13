"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ContactForm, { type ContactVariant } from "./ContactForm";

const ACCENT: Record<ContactVariant, string | ((dark: boolean) => string)> = {
  default: "#00ff9f",
  software: "#00ff9f",
  agency: "#00aaff",
  about: "#e8a020",
  home: (dark: boolean) => dark ? "#00ff9f" : "#00aaff",
};

const DIVIDER: Record<ContactVariant, string | ((dark: boolean) => string)> = {
  default: "rgba(255,255,255,0.07)",
  software: "rgba(0,255,159,0.10)",
  agency: "rgba(0,170,255,0.10)",
  about: "rgba(232,160,32,0.10)",
  home: (dark: boolean) => dark ? "rgba(0,255,159,0.10)" : "rgba(0,170,255,0.10)",
};


type Props = { variant?: ContactVariant; dark?: boolean };

export default function ContactSection({ variant = "default", dark = true }: Props) {
  const { t } = useTranslation();
  const accentValue = ACCENT[variant];
  const dividerValue = DIVIDER[variant];
  const accent = typeof accentValue === "function" ? accentValue(dark) : accentValue;
  const divider = typeof dividerValue === "function" ? dividerValue(dark) : dividerValue;

  const headingColor = variant === "home" ? (dark ? "#ffffff" : "#0a192f") : "#ffffff";
  const subtitleColor = variant === "home"
    ? (dark ? "rgba(224,240,255,0.93)" : "rgba(10,25,47,0.88)")
    : "rgba(224,240,255,0.93)";

  const sectionStyle = variant === "home" ? {
    background: dark
      ? `radial-gradient(ellipse 80% 55% at 15% 30%, rgba(0,170,255,0.12) 0%, transparent 55%),
         radial-gradient(ellipse 65% 55% at 85% 70%, rgba(0,255,159,0.09) 0%, transparent 55%),
         linear-gradient(180deg, #0a1f35 0%, #071a14 100%)`
      : `radial-gradient(ellipse 80% 55% at 15% 30%, rgba(0,170,255,0.14) 0%, transparent 55%),
         radial-gradient(ellipse 65% 55% at 85% 70%, rgba(0,204,136,0.12) 0%, transparent 55%),
         linear-gradient(180deg, #e6f4ff 0%, #edfaf4 100%)`,
  } : undefined;

  return (
    <section
      id="contact"
      className="relative z-10 w-full flex-1 min-h-0 overflow-y-auto"
      style={sectionStyle}
    >
      {/* Top divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${divider}, transparent)` }}
      />

      {/* Grid lines — home variant */}
      {variant === "home" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${dark ? "rgba(255,255,255,0.05)" : "rgba(0,100,160,0.07)"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,100,160,0.07)"} 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 100%)",
          }}
        />
      )}

      {/* Inner wrapper: centers content when it fits, scrolls from top when it doesn't */}
      <div className="min-h-full flex flex-col items-center justify-center px-5 sm:px-6 py-16 sm:py-24 gap-10">
        <motion.div
          initial={{ y: 16 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="text-center max-w-lg"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: accent }}>
              {t("contact.badge")}
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-3" style={{ color: headingColor }}>
            {t(`contact.headings.${variant}`)}
          </h2>
          <p className="text-base leading-relaxed" style={{ color: subtitleColor }}>
            {t(`contact.subheadings.${variant}`)}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 24 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="w-full max-w-lg"
        >
          <ContactForm variant={variant} dark={dark} />
        </motion.div>
      </div>
    </section>
  );
}
