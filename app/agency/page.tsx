"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const services = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "Growth & Performance",
    description: "Funis, mídia paga e otimização de CAC para crescimento previsível.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Branding & Identidade",
    description: "Marca com propósito — posicionamento, visual e tom que ficam na memória.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Social & Conteúdo",
    description: "Estratégia editorial, criativos e comunidade que constrói autoridade.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Analytics & Dados",
    description: "Dashboards, atribuição e insights que transformam dados em decisão.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function AgencyPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0,255,159,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(255,215,0,0.07) 0%, transparent 60%), linear-gradient(180deg, #07130f 0%, #091a14 100%)",
      }} />
      <div className="absolute inset-0 ambient-noise" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,159,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,159,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
          style={{ color: "rgba(224,247,250,0.45)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          bitcraft
        </Link>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-20 max-w-4xl mx-auto w-full gap-14">

        {/* Hero */}
        <div className="flex flex-col items-center gap-5">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{
              background: "rgba(0,255,159,0.07)",
              border: "1px solid rgba(0,255,159,0.2)",
              color: "var(--accent)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Growth & Marketing
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none"
          >
            <span className="text-white">Bitcraft </span>
            <span style={{
              backgroundImage: "linear-gradient(92deg, #00ff9f, #00d47a)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}>
              Agency
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-base sm:text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(224,247,250,0.6)" }}
          >
            Unimos dados, criatividade e tecnologia para construir um motor de
            aquisição, retenção e autoridade da sua marca.
          </motion.p>

          <motion.a
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            href="mailto:agency@bitcraft.dev.br"
            className="cta-ripple mt-2 px-7 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, var(--accent), #00b870)",
              color: "#05120d",
              boxShadow: "0 0 24px rgba(0,255,159,0.25)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Falar com a equipe
          </motion.a>
        </div>

        {/* Services grid */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
        >
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              custom={4 + i * 0.5}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex gap-4 items-start rounded-xl p-5 text-left"
              style={{
                background: "rgba(7,22,14,0.65)",
                border: "1px solid rgba(0,255,159,0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="mt-0.5 shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,255,159,0.08)", color: "var(--accent)" }}
              >
                {s.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(224,247,250,0.5)" }}>
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
