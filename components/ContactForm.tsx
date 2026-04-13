"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export type ContactVariant = "default" | "software" | "agency" | "about" | "home";

const THEMES = {
  default: {
    card: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(20px)" },
    label: "rgba(255,255,255,0.55)",
    inputBg: "rgba(255,255,255,0.06)",
    inputBorder: "rgba(255,255,255,0.12)",
    inputColor: "#ffffff",
    inputPlaceholder: "rgba(255,255,255,0.28)",
    focusBorder: "rgba(0,255,159,0.65)",
    focusShadow: "0 0 0 3px rgba(0,255,159,0.10)",
    btnBg: "#ffffff",
    btnColor: "#0a192f",
    btnShadow: "0 2px 20px rgba(255,255,255,0.2)",
    successColor: "#00ff9f",
  },
  software: {
    card: { background: "rgba(0,255,159,0.04)", border: "1px solid rgba(0,255,159,0.16)", backdropFilter: "blur(12px)" },
    label: "rgba(0,255,159,0.65)",
    inputBg: "rgba(0,18,8,0.7)",
    inputBorder: "rgba(0,255,159,0.12)",
    inputColor: "#e0ffe8",
    inputPlaceholder: "rgba(0,255,159,0.22)",
    focusBorder: "rgba(0,255,159,0.65)",
    focusShadow: "0 0 0 3px rgba(0,255,159,0.08)",
    btnBg: "linear-gradient(135deg, #00ff9f, #00b870)",
    btnColor: "#05120d",
    btnShadow: "0 0 24px rgba(0,255,159,0.28)",
    successColor: "#00ff9f",
  },
  agency: {
    card: { background: "rgba(0,170,255,0.05)", border: "1px solid rgba(0,170,255,0.18)", backdropFilter: "blur(12px)" },
    label: "rgba(0,200,255,0.65)",
    inputBg: "rgba(0,8,28,0.7)",
    inputBorder: "rgba(0,170,255,0.12)",
    inputColor: "#e0f7ff",
    inputPlaceholder: "rgba(0,170,255,0.28)",
    focusBorder: "rgba(0,170,255,0.65)",
    focusShadow: "0 0 0 3px rgba(0,170,255,0.08)",
    btnBg: "linear-gradient(135deg, #00aaff, #0090d4)",
    btnColor: "#ffffff",
    btnShadow: "0 0 24px rgba(0,170,255,0.32)",
    successColor: "#00aaff",
  },
  about: {
    card: { background: "rgba(232,160,32,0.05)", border: "1px solid rgba(232,160,32,0.18)", backdropFilter: "blur(12px)" },
    label: "rgba(232,160,32,0.70)",
    inputBg: "rgba(20,14,4,0.7)",
    inputBorder: "rgba(232,160,32,0.12)",
    inputColor: "#fff5e0",
    inputPlaceholder: "rgba(232,160,32,0.28)",
    focusBorder: "rgba(232,160,32,0.65)",
    focusShadow: "0 0 0 3px rgba(232,160,32,0.08)",
    btnBg: "linear-gradient(135deg, #e8a020, #c4871a)",
    btnColor: "#0d0900",
    btnShadow: "0 0 24px rgba(232,160,32,0.28)",
    successColor: "#e8a020",
  },
  home_dark: {
    card: { background: "rgba(0,80,120,0.14)", border: "1px solid rgba(0,170,255,0.18)", backdropFilter: "blur(20px)" },
    label: "rgba(180,230,255,0.65)",
    inputBg: "rgba(0,15,30,0.55)",
    inputBorder: "rgba(0,170,255,0.16)",
    inputColor: "#e0f4ff",
    inputPlaceholder: "rgba(180,220,255,0.30)",
    focusBorder: "rgba(0,200,180,0.70)",
    focusShadow: "0 0 0 3px rgba(0,200,180,0.12)",
    btnBg: "linear-gradient(135deg, #00aaff, #00cc88)",
    btnColor: "#04111a",
    btnShadow: "0 0 24px rgba(0,170,255,0.30)",
    successColor: "#00cc88",
  },
  home_light: {
    card: { background: "rgba(255,255,255,0.75)", border: "1px solid rgba(0,150,200,0.22)", backdropFilter: "blur(20px)" },
    label: "rgba(10,50,80,0.65)",
    inputBg: "rgba(235,248,255,0.80)",
    inputBorder: "rgba(0,150,200,0.20)",
    inputColor: "#0a2540",
    inputPlaceholder: "rgba(10,50,80,0.35)",
    focusBorder: "rgba(0,160,180,0.70)",
    focusShadow: "0 0 0 3px rgba(0,160,180,0.12)",
    btnBg: "linear-gradient(135deg, #0088cc, #00aa77)",
    btnColor: "#ffffff",
    btnShadow: "0 0 24px rgba(0,140,180,0.28)",
    successColor: "#00aa77",
  },
};

type Props = { variant?: ContactVariant; dark?: boolean };

export default function ContactForm({ variant = "default", dark = true }: Props) {
  const { t } = useTranslation();
  const [fields, setFields] = useState({ name: "", email: "", message: "", _honey: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const themeKey = variant === "home" ? (dark ? "home_dark" : "home_light") : variant;
  const theme = THEMES[themeKey as keyof typeof THEMES];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fields.name, email: fields.email, message: fields.message, _honey: fields._honey }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setStatus("success");
      setFields({ name: "", email: "", message: "", _honey: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    background: theme.inputBg,
    border: `1px solid ${focused === field ? theme.focusBorder : theme.inputBorder}`,
    boxShadow: focused === field ? theme.focusShadow : "none",
    color: theme.inputColor,
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    width: "100%",
    outline: "none",
    fontSize: "0.875rem",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  });

  return (
    <div style={{ ...theme.card, borderRadius: "1.5rem", padding: "2rem", width: "100%" }}>
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ y: 8 }}
            animate={{ y: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-10 text-center"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={theme.successColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p style={{ color: "#ffffff", fontSize: "1rem", fontWeight: 600 }}>{t("form.success")}</p>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ y: 8 }} animate={{ y: 0 }} onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              type="text"
              name="_honey"
              value={fields._honey}
              onChange={(e) => setFields((prev) => ({ ...prev, _honey: e.target.value }))}
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
              autoComplete="off"
            />
            {[
              { field: "name", label: t("form.name"), type: "text", placeholder: t("form.namePlaceholder") },
              { field: "email", label: t("form.email"), type: "email", placeholder: t("form.emailPlaceholder") },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label style={{ color: theme.label, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</label>
                <input
                  type={type}
                  required
                  placeholder={placeholder}
                  value={fields[field as keyof typeof fields]}
                  onChange={e => setFields(f => ({ ...f, [field]: e.target.value }))}
                  style={inputStyle(field)}
                  onFocus={() => setFocused(field)}
                  onBlur={() => setFocused(null)}
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label style={{ color: theme.label, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("form.message")}</label>
              <textarea
                required
                placeholder={t("form.messagePlaceholder")}
                rows={4}
                value={fields.message}
                onChange={e => setFields(f => ({ ...f, message: e.target.value }))}
                style={{ ...inputStyle("message"), resize: "vertical", minHeight: "110px" }}
                onFocus={() => setFocused("message")}
                onBlur={() => setFocused(null)}
              />
            </div>

            <motion.button
              type="submit"
              disabled={status === "sending"}
              style={{
                background: theme.btnBg,
                color: theme.btnColor,
                boxShadow: theme.btnShadow,
                border: "none",
                borderRadius: "999px",
                padding: "0.8rem 2rem",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: status === "sending" ? "not-allowed" : "pointer",
                width: "100%",
                opacity: status === "sending" ? 0.7 : 1,
                fontFamily: "inherit",
              }}
              whileHover={status !== "sending" ? { scale: 1.02 } : {}}
              whileTap={status !== "sending" ? { scale: 0.97 } : {}}
            >
              {status === "sending" ? t("form.sending") : t("form.submit")}
            </motion.button>

            {status === "error" && (
              <p style={{ color: "#ff6b6b", fontSize: "0.8rem", textAlign: "center" }}>{t("form.error")}</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
