"use client";

import { motion } from "framer-motion";
import type { Locale } from "../lib/translations";

type Props = {
  dark?: boolean;
  locale?: Locale;
};

const LABELS = {
  en: {
    copyright: `© ${new Date().getFullYear()} Bitcraft. All rights reserved.`,
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    settings: "Cookie Settings",
  },
  pt: {
    copyright: `© ${new Date().getFullYear()} Bitcraft. Todos os direitos reservados.`,
    privacy: "Política de Privacidade",
    cookies: "Política de Cookies",
    settings: "Preferências de Cookies",
  },
};

export default function SiteFooter({ dark = true, locale = "en" }: Props) {
  const subtitleColor = dark ? "rgba(255,255,255,0.55)" : "rgba(10,25,47,0.55)";
  const l = LABELS[locale];

  return (
    <footer className="relative z-10 w-full px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <motion.span
          className="text-xs font-medium"
          animate={{ color: subtitleColor }}
          transition={{ duration: 0.4 }}
        >
          {l.copyright}
        </motion.span>

        <nav className="flex items-center flex-wrap justify-center gap-x-5 gap-y-1">
          {[
            { label: l.privacy, href: "#" },
            { label: l.cookies, href: "#" },
            { label: l.settings, href: "#" },
          ].map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="text-xs font-medium transition-opacity duration-200 hover:opacity-100"
              animate={{ color: subtitleColor, opacity: 0.7 }}
              transition={{ duration: 0.4 }}
              whileHover={{ opacity: 1 }}
            >
              {item.label}
            </motion.a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
