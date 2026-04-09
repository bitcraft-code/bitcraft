"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Iridescence from "../../components/Iridescence";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import TextType from "../../components/TextType";
import ContactSection from "../../components/ContactSection";
import BorderGlow from "../../components/BorderGlow";
import { detectLocale, saveLocale, type Locale } from "../../lib/translations";

const TYPING_TEXTS: Record<Locale, string[]> = {
  en: [
    "Turn [[attention|accent,bold]] into [[revenue|accent,bold]].",
    "Your [[brand|accent,bold]] in every [[feed|accent,bold]].",
    "Lower [[CAC|accent,bold]]. [[Higher|accent,bold]] revenue.",
  ],
  pt: [
    "Transforme [[atenção|accent,bold]] em [[receita|accent,bold]].",
    "Sua [[marca|accent,bold]] em todos os [[feeds|accent,bold]].",
    "[[CAC|accent,bold]] menor. Receita [[maior|accent,bold]].",
  ],
};

const COPY: Record<Locale, {
  badge: string;
  heroSubtitle: string;
  heroCta: string;
  subtitle: string;
  cta: string;
  services: { title: string; description: string }[];
}> = {
  pt: {
    badge: "Growth & Performance",
    heroSubtitle: "Enquanto você lê isso, o seu concorrente está capturando os clientes que deveriam ser seus.",
    heroCta: "Quero crescer agora →",
    subtitle: "Pare de apostar em achismos. A Bitcraft Agency constrói um motor de aquisição baseado em dados que trabalha enquanto você dorme.",
    cta: "Quero crescer agora →",
    services: [
      { title: "Esmague seu CAC", description: "Funis, mídia paga e otimização de conversão que transformam cada real investido em múltiplos de retorno." },
      { title: "Domine o mercado com sua marca", description: "Posicionamento, identidade e tom que ficam na memória e fazem o cliente escolher você sem precisar comparar preço." },
      { title: "Construa autoridade que vende", description: "Conteúdo e comunidade que atraem, educam e convertem. Sem precisar perseguir cliente nenhum." },
      { title: "Decisões baseadas em dados reais", description: "Dashboards, atribuição e relatórios que mostram exatamente o que funciona e cortam o que desperdiça dinheiro." },
    ],
  },
  en: {
    badge: "Growth & Performance",
    heroSubtitle: "While you read this, your competitor is capturing the customers that should be yours.",
    heroCta: "I want to grow now →",
    subtitle: "Stop betting on guesswork. Bitcraft Agency builds a data-driven acquisition engine that works while you sleep.",
    cta: "I want to grow now →",
    services: [
      { title: "Crush your CAC", description: "Funnels, paid media and conversion optimization that turn every dollar invested into multiples of return." },
      { title: "Dominate your market with your brand", description: "Positioning, identity and tone that stick in memory, making customers choose you without comparing prices." },
      { title: "Build authority that sells", description: "Content and community that attract, educate and convert. Without chasing a single customer." },
      { title: "Decisions based on real data", description: "Dashboards, attribution and reports that show exactly what works and cut what wastes money." },
    ],
  },
};

const SERVICE_ICONS = [
  <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>,
  <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>,
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
  const [locale, setLocale] = useState<Locale>("en");
  const [cardTilt, setCardTilt] = useState<Record<number, { rx: number; ry: number }>>({});
  useEffect(() => { setLocale(detectLocale()); }, []);
  const c = COPY[locale];

  return (
    <>
    <title>{"BITCRAFT Agency | Growth & Performance"}</title>
    <main className="relative flex flex-col overflow-x-hidden">
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

      <SiteHeader activePath="/agency" locale={locale} onToggleLocale={() => setLocale((l) => { const next = l === "en" ? "pt" : "en"; saveLocale(next); return next; })} />

      {/* Iridescence hero section */}
      <section className="relative w-full h-[100dvh] flex items-center justify-center">
        <div className="absolute inset-0">
          <Iridescence color={[0.15, 0.45, 1]} speed={0.8} amplitude={0.12} mouseReact />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 100%)" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-6 z-10">
          <TextType
            as="h1"
            text={TYPING_TEXTS[locale]}
            typingSpeed={55}
            deletingSpeed={30}
            pauseDuration={2500}
            initialDelay={400}
            loop
            showCursor
            cursorCharacter="|"
            cursorClassName="text-[#00aaff]"
            accentColor="#00aaff"
            accentFontFamily="var(--font-caveat)"
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight text-balance"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg max-w-lg leading-relaxed font-medium"
            style={{ color: "rgba(224,240,255,0.92)", textShadow: "0 0 32px rgba(0,170,255,0.3)" }}
          >
            {c.heroSubtitle}
          </motion.p>
          <motion.a
            href="mailto:agency@bitcraft.dev.br"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="px-8 py-3 rounded-full text-sm font-bold tracking-wide"
            style={{
              background: "linear-gradient(135deg, var(--primary), #0090d4)",
              color: "#fff",
              boxShadow: "0 0 32px rgba(0,170,255,0.35)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            {c.heroCta}
          </motion.a>
        </div>
      </section>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto w-full gap-14">
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
            {c.badge}
          </motion.div>

          <motion.h2
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight"
          >
            <span className="text-white">Bitcraft </span>
            <span style={{
              backgroundImage: "linear-gradient(92deg, #00aaff, #00d4ff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}>
              Agency
            </span>
          </motion.h2>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-base sm:text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(224,247,250,0.88)" }}
          >
            {c.subtitle}
          </motion.p>

          <motion.a
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            href="mailto:agency@bitcraft.dev.br"
            className="cta-ripple mt-2 px-7 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, var(--primary), #0090d4)",
              color: "#fff",
              boxShadow: "0 0 24px rgba(0,170,255,0.3)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {c.cta}
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
          {c.services.map((s, i) => {
            const tilt = cardTilt[i] ?? { rx: 0, ry: 0 };
            return (
            <motion.div
              key={s.title}
              custom={4 + i * 0.5}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              style={{ perspective: "800px" }}
            >
              <div
                style={{
                  transform: `rotateX(${tilt.ry}deg) rotateY(${tilt.rx}deg)`,
                  transition: "transform 0.18s ease-out",
                  transformStyle: "preserve-3d",
                  height: "100%",
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width - 0.5;
                  const y = (e.clientY - rect.top) / rect.height - 0.5;
                  setCardTilt(p => ({ ...p, [i]: { rx: x * 14, ry: -y * 14 } }));
                }}
                onMouseLeave={() => setCardTilt(p => ({ ...p, [i]: { rx: 0, ry: 0 } }))}
              >
                <BorderGlow
                  className="h-full backdrop-blur-md"
                  colors={["#00aaff", "#0090d4", "#00d4ff"]}
                  glowColor="200 100 55"
                  backgroundColor="rgba(14,34,56,0.72)"
                  borderRadius={12}
                  edgeSensitivity={0}
                  glowRadius={80}
                  glowIntensity={3}
                  coneSpread={27}
                  fillOpacity={0}
                  animated
                >
                  <div className="flex gap-4 items-start p-5 text-left" style={{ transformStyle: "preserve-3d" }}>
                    <div
                      className="mt-0.5 shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(0,170,255,0.1)", color: "var(--primary)", transform: "translateZ(28px)" }}
                    >
                      {SERVICE_ICONS[i]}
                    </div>
                    <div style={{ transformStyle: "preserve-3d" }}>
                      <h3 className="font-semibold text-white text-base mb-1" style={{ transform: "translateZ(20px)" }}>{s.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(224,247,250,0.72)", transform: "translateZ(10px)" }}>
                        {s.description}
                      </p>
                    </div>
                  </div>
                </BorderGlow>
              </div>
            </motion.div>
            );
          })}
        </motion.div>
      </div>

      <ContactSection variant="agency" locale={locale} />

      <SiteFooter locale={locale} />
    </main>
    </>
  );
}
