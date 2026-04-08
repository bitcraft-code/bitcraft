"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const services = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Engenharia de Produto",
    description: "Arquitetura robusta, stack moderna e squads de alta entrega.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
    title: "IA Aplicada",
    description: "Automação inteligente, agentes e modelos que viram vantagem competitiva.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Web & Mobile",
    description: "Interfaces rápidas, acessíveis e com UX que converte.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
      </svg>
    ),
    title: "Infraestrutura & Scale",
    description: "Cloud-native, CI/CD e sistemas que crescem com o negócio.",
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

export default function SoftwarePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0,170,255,0.14) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(0,170,255,0.08) 0%, transparent 60%), linear-gradient(180deg, #080f1e 0%, #0a192f 100%)",
      }} />
      <div className="absolute inset-0 ambient-noise" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,170,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,170,255,0.07) 1px, transparent 1px)",
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
              background: "rgba(0,170,255,0.08)",
              border: "1px solid rgba(0,170,255,0.22)",
              color: "var(--primary)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Engenharia & IA
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
              backgroundImage: "linear-gradient(92deg, #00aaff, #00d4ff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}>
              Software
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
            Construímos sistemas digitais de alto desempenho — do MVP ao produto escalável,
            com IA integrada em cada camada.
          </motion.p>

          <motion.a
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            href="mailto:software@bitcraft.dev.br"
            className="cta-ripple mt-2 px-7 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, var(--primary), #0090d4)",
              color: "#fff",
              boxShadow: "0 0 24px rgba(0,170,255,0.3)",
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
                background: "rgba(14,34,56,0.55)",
                border: "1px solid rgba(0,170,255,0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="mt-0.5 shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,170,255,0.1)", color: "var(--primary)" }}
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
