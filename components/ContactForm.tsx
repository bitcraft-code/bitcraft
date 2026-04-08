"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/lib/translations";

export type ContactVariant = "default" | "software" | "agency";

const COPY = {
  en: {
    name: "Name", email: "Email", message: "Message",
    namePlaceholder: "Your name",
    emailPlaceholder: "your@email.com",
    messagePlaceholder: "Tell us about your project...",
    submit: "Send message", sending: "Sending...",
    success: "Message sent! We'll be in touch soon.",
    error: "Something went wrong. Please try again.",
  },
  pt: {
    name: "Nome", email: "Email", message: "Mensagem",
    namePlaceholder: "O seu nome",
    emailPlaceholder: "seu@email.com",
    messagePlaceholder: "Fale-nos sobre o seu projeto...",
    submit: "Enviar mensagem", sending: "A enviar...",
    success: "Mensagem enviada! Entraremos em contacto em breve.",
    error: "Algo correu mal. Por favor tente novamente.",
  },
};

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
};

type Props = { variant?: ContactVariant; locale?: Locale };

export default function ContactForm({ variant = "default", locale = "en" }: Props) {
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const c = COPY[locale];
  const t = THEMES[variant];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // TODO: replace with actual API endpoint
    await new Promise(r => setTimeout(r, 1000));
    setStatus("success");
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    background: t.inputBg,
    border: `1px solid ${focused === field ? t.focusBorder : t.inputBorder}`,
    boxShadow: focused === field ? t.focusShadow : "none",
    color: t.inputColor,
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    width: "100%",
    outline: "none",
    fontSize: "0.875rem",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  });

  return (
    <div style={{ ...t.card, borderRadius: "1.5rem", padding: "2rem", width: "100%" }}>
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-10 text-center"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={t.successColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p style={{ color: "#ffffff", fontSize: "1rem", fontWeight: 600 }}>{c.success}</p>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="flex flex-col gap-5">
            {[
              { field: "name", label: c.name, type: "text", placeholder: c.namePlaceholder },
              { field: "email", label: c.email, type: "email", placeholder: c.emailPlaceholder },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label style={{ color: t.label, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</label>
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
              <label style={{ color: t.label, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.message}</label>
              <textarea
                required
                placeholder={c.messagePlaceholder}
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
                background: t.btnBg,
                color: t.btnColor,
                boxShadow: t.btnShadow,
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
              {status === "sending" ? c.sending : c.submit}
            </motion.button>

            {status === "error" && (
              <p style={{ color: "#ff6b6b", fontSize: "0.8rem", textAlign: "center" }}>{c.error}</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
