"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useTranslation } from "react-i18next";
import Grainient from "../components/Grainient";
import RotatingText from "../components/RotatingText";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ContactSection from "../components/ContactSection";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
  show: { opacity: 1, y: 0 },
};

const DARK = {
  grainient: { color1: "#00aaff", color2: "#0d2d45", color3: "#00ff9f", contrast: 1.3, gamma: 1.1, saturation: 0.9, zoom: 0.85 },
  overlay: "rgba(6,14,28,0.38)",
  header: { bg: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", shadow: "0 4px 24px rgba(0,0,0,0.12)" },
  logoBg: "rgba(255,255,255,0.18)", logoBorder: "1px solid rgba(255,255,255,0.25)", logoStroke: "#ffffff", logoText: "#ffffff",
  navText: "rgba(255,255,255,0.75)", navHoverText: "#ffffff", navHoverBg: "rgba(255,255,255,0.12)",
  badge: { bg: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.28)", color: "#ffffff", dot: "#00ff9f" },
  heading: "#ffffff", subtitle: "rgba(255,255,255,0.82)",
  btnPrimary: { bg: "#ffffff", color: "#0a192f", shadow: "0 0 24px rgba(0,255,159,0.28), 0 2px 20px rgba(255,255,255,0.25)" },
  btnSecondary: { bg: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", color: "#ffffff" },
  toggleBg: "rgba(255,255,255,0.14)", toggleBorder: "1px solid rgba(255,255,255,0.28)", toggleColor: "#ffffff",
};

const LIGHT = {
  grainient: { color1: "#00aaff", color2: "#b0dcf8", color3: "#00cc88", contrast: 1.05, gamma: 0.95, saturation: 0.75, zoom: 0.88 },
  overlay: "rgba(240,252,255,0.28)",
  header: { bg: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,100,160,0.18)", shadow: "0 4px 24px rgba(0,120,200,0.10)" },
  logoBg: "rgba(0,170,255,0.12)", logoBorder: "1px solid rgba(0,170,255,0.25)", logoStroke: "#0a192f", logoText: "#0a192f",
  navText: "rgba(10,25,47,0.65)", navHoverText: "#0a192f", navHoverBg: "rgba(0,170,255,0.10)",
  badge: { bg: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,170,255,0.25)", color: "#0a192f", dot: "#00aaff" },
  heading: "#0a192f", subtitle: "rgba(10,25,47,0.75)",
  btnPrimary: { bg: "#0a192f", color: "#ffffff", shadow: "0 2px 20px rgba(10,25,47,0.20)" },
  btnSecondary: { bg: "rgba(255,255,255,0.55)", border: "1px solid rgba(0,170,255,0.28)", color: "#0a192f" },
  toggleBg: "rgba(255,255,255,0.55)", toggleBorder: "1px solid rgba(0,170,255,0.28)", toggleColor: "#0a192f",
};


export default function HomeContent() {
  const router = useRouter();
  const { t: translate, i18n } = useTranslation();
  const locale = i18n.language;
  const [dark, setDark] = useState(true);
  const lastTouchAt = useRef(0);
  const pointerFrameMapRef = useRef(new Map<HTMLElement, number>());
  const pointerPayloadMapRef = useRef(
    new Map<HTMLElement, { active: boolean; x: number; y: number; tx?: number; ty?: number }>(),
  );
  const theme = dark ? DARK : LIGHT;
  const rotatingTexts = translate("home.rotatingTexts", { returnObjects: true }) as string[];

  useEffect(() => {
    return () => {
      for (const frame of pointerFrameMapRef.current.values()) {
        cancelAnimationFrame(frame);
      }
      pointerFrameMapRef.current.clear();
      pointerPayloadMapRef.current.clear();
    };
  }, []);

  const wasTouched = () => Date.now() - lastTouchAt.current < 600;
  const schedulePointerStyles = useCallback(
    (
      element: HTMLElement,
      payload: { active: boolean; x: number; y: number; tx?: number; ty?: number },
    ) => {
      pointerPayloadMapRef.current.set(element, payload);
      if (pointerFrameMapRef.current.has(element)) return;

      const frame = requestAnimationFrame(() => {
        const nextPayload = pointerPayloadMapRef.current.get(element);
        pointerFrameMapRef.current.delete(element);
        if (!nextPayload) return;

        element.style.setProperty("--spotlight-opacity", nextPayload.active ? "1" : "0");
        element.style.setProperty("--spotlight-x", `${nextPayload.x}px`);
        element.style.setProperty("--spotlight-y", `${nextPayload.y}px`);

        if (typeof nextPayload.tx === "number") {
          element.style.setProperty("--btn-tx", `${nextPayload.tx}`);
        }
        if (typeof nextPayload.ty === "number") {
          element.style.setProperty("--btn-ty", `${nextPayload.ty}`);
        }
      });

      pointerFrameMapRef.current.set(element, frame);
    },
    [],
  );
  const resetPointerStyles = useCallback((element: HTMLElement, resetParallax = false) => {
    const frame = pointerFrameMapRef.current.get(element);
    if (typeof frame === "number") {
      cancelAnimationFrame(frame);
      pointerFrameMapRef.current.delete(element);
    }
    pointerPayloadMapRef.current.delete(element);
    element.style.setProperty("--spotlight-opacity", "0");
    if (resetParallax) {
      element.style.setProperty("--btn-tx", "0");
      element.style.setProperty("--btn-ty", "0");
    }
  }, []);
  const onTouchBegin = (setter: (element: HTMLElement, x: number, y: number) => void) => (e: React.TouchEvent) => {
    lastTouchAt.current = Date.now();
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    setter(element, touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const primaryHoverShadow = dark
    ? "0 0 0 1.5px rgba(0,255,159,0.7), 0 0 28px rgba(0,255,159,0.35), 0 2px 20px rgba(255,255,255,0.10)"
    : "0 0 0 1.5px rgba(0,130,90,0.6), 0 0 22px rgba(0,180,120,0.28), 0 2px 16px rgba(10,25,47,0.15)";
  const primaryTint = dark
    ? "linear-gradient(135deg, rgba(0,255,159,0.13) 0%, rgba(0,170,255,0.08) 100%)"
    : "linear-gradient(135deg, rgba(0,170,255,0.10) 0%, rgba(0,255,159,0.07) 100%)";

  return (
    <>
    <main
      className="relative h-dvh overflow-y-scroll scroll-smooth snap-y snap-mandatory overflow-x-hidden select-none"
      style={{ background: dark ? "#071a14" : "#edfaf4", transition: "background 0.6s ease" }}
    >
      {/* ── Header ── */}
      <SiteHeader
        activePath="/"
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
      />

      {/* ── Hero ── */}
      <section className="relative w-full h-dvh snap-start flex items-center justify-center overflow-hidden">
        {/* Grainient background — scoped to hero only */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            style={{
              background: dark
                ? `radial-gradient(ellipse 90% 70% at 15% 25%, rgba(0,170,255,0.35) 0%, transparent 55%),
                   radial-gradient(ellipse 70% 90% at 85% 75%, rgba(0,255,159,0.25) 0%, transparent 55%),
                   radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,100,200,0.15) 0%, transparent 70%),
                   #0d2d45`
                : `radial-gradient(ellipse 90% 70% at 15% 25%, rgba(0,170,255,0.30) 0%, transparent 55%),
                   radial-gradient(ellipse 70% 90% at 85% 75%, rgba(0,204,136,0.20) 0%, transparent 55%),
                   #e8f7ff`,
              transition: "background 0.6s ease",
            }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={dark ? "dark" : "light"}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Grainient
                color1={theme.grainient.color1}
                color2={theme.grainient.color2}
                color3={theme.grainient.color3}
                timeSpeed={0.32}
                colorBalance={0.0}
                warpStrength={1.4}
                warpFrequency={3.5}
                warpSpeed={1.2}
                warpAmplitude={55}
                blendAngle={20}
                blendSoftness={0.08}
                rotationAmount={400}
                noiseScale={2}
                grainAmount={0.05}
                grainScale={2}
                grainAnimated={false}
                contrast={theme.grainient.contrast}
                gamma={theme.grainient.gamma}
                saturation={theme.grainient.saturation}
                centerX={0}
                centerY={0}
                zoom={theme.grainient.zoom}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ background: theme.overlay }}
          transition={{ duration: 0.5 }}
          style={{ background: theme.overlay }}
        />


        <div className="relative z-10 flex flex-col items-center justify-center text-center w-full px-5 py-8 sm:px-6 sm:pb-24 sm:pt-8 gap-10 sm:gap-10 md:gap-12">

        {/* Heading */}
        <motion.h1
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-black leading-[1.1] tracking-tight flex items-baseline justify-center gap-x-2 sm:gap-x-3 max-w-full px-4"
          style={{ fontFamily: "var(--font-manrope)", fontSize: "clamp(1.5rem, 7.5vw, 5rem)", whiteSpace: "nowrap" }}
        >
          <LayoutGroup id="hero-heading">
          <motion.span layout animate={{ color: theme.heading }} transition={{ duration: 0.4, layout: { type: "spring", damping: 30, stiffness: 150 } }} style={{ color: theme.heading, whiteSpace: "nowrap" }}>
            {translate("home.headingStatic")}
          </motion.span>
          <RotatingText
            key={locale}
            texts={rotatingTexts}
            mainClassName={`px-3 sm:px-6 md:px-8 py-1 sm:py-2 md:py-3 items-center justify-center rounded-full leading-normal backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(255,255,255,0.1)] ${dark ? "bg-white/[0.13] text-white border border-white/[0.22]" : "bg-white/[0.35] text-[#0a192f] border border-white/[0.5]"}`}
            onMouseMove={(e) => {
              if (wasTouched()) return;
              const element = e.currentTarget as HTMLElement;
              const rect = element.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              schedulePointerStyles(element, { active: true, x, y });
            }}
            onMouseLeave={(e) => {
              if (wasTouched()) return;
              resetPointerStyles(e.currentTarget as HTMLElement);
            }}
            onTouchStart={onTouchBegin((element, x, y) => {
              schedulePointerStyles(element, { active: true, x, y });
            })}
            onTouchEnd={(e) => resetPointerStyles(e.currentTarget as HTMLElement)}
            onTouchCancel={(e) => resetPointerStyles(e.currentTarget as HTMLElement)}
            overlay={(
              <>
                <span
                  className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                  style={{
                    opacity: "var(--spotlight-opacity, 0)",
                    transition: "opacity 0.3s ease",
                    background:
                      "radial-gradient(circle 160px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.12), transparent 70%)",
                  }}
                />
                <span
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    opacity: "var(--spotlight-opacity, 0)",
                    transition: "opacity 0.3s ease",
                    background:
                      "radial-gradient(circle 160px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,1), transparent 70%)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    padding: "1.5px",
                  }}
                />
              </>
            )}
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.015}
            splitLevelClassName="overflow-hidden"
            transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
            rotationInterval={3000}
          />
          </LayoutGroup>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-sm sm:text-base md:text-lg lg:text-xl max-w-xl leading-relaxed font-medium text-balance"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={locale + "-subtitle"}
              className="block"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <motion.span
                animate={{ color: dark ? "rgba(255,255,255,0.82)" : "rgba(10,25,47,0.75)" }}
                transition={{ duration: 0.4 }}
              >{translate("home.subtitle")}</motion.span>
            </motion.span>
          </AnimatePresence>
        </motion.p>

        {/* Badge — repositioned below subtitle, above CTAs */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mt-6 sm:mt-10"
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", background: theme.badge.bg, border: theme.badge.border, color: theme.badge.color }}
          whileInView={{ background: theme.badge.bg, border: theme.badge.border, color: theme.badge.color }}
          viewport={{ once: true }}
        >
          <span className="relative flex shrink-0 w-2 h-2">
            <motion.span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" animate={{ background: theme.badge.dot }} transition={{ duration: 0.4 }} />
            <motion.span className="relative inline-flex w-2 h-2 rounded-full" animate={{ background: theme.badge.dot }} transition={{ duration: 0.4 }} />
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={locale + "-badge"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {translate("home.badge")}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8"
        >
          <motion.a
            href="/software"
            onClick={(e) => { e.preventDefault(); router.push("/software"); }}
            className="relative w-full sm:w-auto sm:min-w-[200px] px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-bold text-center overflow-hidden"
            animate={{ background: theme.btnPrimary.bg, color: theme.btnPrimary.color, boxShadow: theme.btnPrimary.shadow }}
            transition={{ duration: 0.4 }}
            style={{
              background: theme.btnPrimary.bg,
              color: theme.btnPrimary.color,
              boxShadow: theme.btnPrimary.shadow,
              transform: "translate(calc(var(--btn-tx, 0) * 2px), calc(var(--btn-ty, 0) * 1.5px))",
              transition: "transform 0.15s ease-out, background 0.4s, box-shadow 0.4s",
            }}
            whileHover={{ scale: 1.04, boxShadow: primaryHoverShadow }}
            whileTap={{ scale: 0.97 }}
            onMouseMove={(e) => {
              if (wasTouched()) return;
              const element = e.currentTarget as HTMLElement;
              const rect = element.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const tx = (x - rect.width / 2) / (rect.width / 2);
              const ty = (y - rect.height / 2) / (rect.height / 2);
              schedulePointerStyles(element, { active: true, x, y, tx, ty });
            }}
            onMouseLeave={(e) => {
              if (wasTouched()) return;
              resetPointerStyles(e.currentTarget as HTMLElement, true);
            }}
            onTouchStart={onTouchBegin((element, x, y) => {
              schedulePointerStyles(element, { active: true, x, y, tx: 0, ty: 0 });
            })}
            onTouchEnd={(e) => resetPointerStyles(e.currentTarget as HTMLElement, true)}
            onTouchCancel={(e) => resetPointerStyles(e.currentTarget as HTMLElement, true)}
          >
            <>
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  opacity: "var(--spotlight-opacity, 0)",
                  transition: "opacity 0.35s ease",
                  background: primaryTint,
                }}
              />
              <span
                className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                style={{
                  opacity: "var(--spotlight-opacity, 0)",
                  transition: "opacity 0.3s ease",
                  background:
                    "radial-gradient(circle 80px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.20), transparent 70%)",
                }}
              />
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  opacity: "var(--spotlight-opacity, 0)",
                  transition: "opacity 0.3s ease",
                  background:
                    "radial-gradient(circle 80px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,1), transparent 70%)",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  padding: "1.5px",
                }}
              />
              <span
                style={{
                  display: "inline-block",
                  transform:
                    "translate(calc(var(--btn-tx, 0) * 4px), calc(var(--btn-ty, 0) * 2.5px))",
                  transition: "transform 0.12s ease-out",
                }}
              >
                {translate("home.btnSoftware")}
              </span>
            </>
          </motion.a>

          <motion.a
            href="/agency"
            onClick={(e) => { e.preventDefault(); router.push("/agency"); }}
            className="relative w-full sm:w-auto sm:min-w-[200px] px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-medium text-center"
            animate={{ background: theme.btnSecondary.bg, border: theme.btnSecondary.border, color: theme.btnSecondary.color }}
            transition={{ duration: 0.4 }}
            style={{
              background: theme.btnSecondary.bg,
              border: theme.btnSecondary.border,
              color: theme.btnSecondary.color,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              transform: "translate(calc(var(--btn-tx, 0) * 2px), calc(var(--btn-ty, 0) * 1.5px))",
              transition: "transform 0.15s ease-out, background 0.4s, border 0.4s",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onMouseMove={(e) => {
              if (wasTouched()) return;
              const element = e.currentTarget as HTMLElement;
              const rect = element.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const tx = (x - rect.width / 2) / (rect.width / 2);
              const ty = (y - rect.height / 2) / (rect.height / 2);
              schedulePointerStyles(element, { active: true, x, y, tx, ty });
            }}
            onMouseLeave={(e) => {
              if (wasTouched()) return;
              resetPointerStyles(e.currentTarget as HTMLElement, true);
            }}
            onTouchStart={onTouchBegin((element, x, y) => {
              schedulePointerStyles(element, { active: true, x, y, tx: 0, ty: 0 });
            })}
            onTouchEnd={(e) => resetPointerStyles(e.currentTarget as HTMLElement, true)}
            onTouchCancel={(e) => resetPointerStyles(e.currentTarget as HTMLElement, true)}
          >
            <>
              <span
                className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                style={{
                  opacity: "var(--spotlight-opacity, 0)",
                  transition: "opacity 0.3s ease",
                  background:
                    "radial-gradient(circle 80px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.10), transparent 70%)",
                }}
              />
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  opacity: "var(--spotlight-opacity, 0)",
                  transition: "opacity 0.3s ease",
                  background:
                    "radial-gradient(circle 80px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,1), transparent 70%)",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  padding: "1.5px",
                }}
              />
              <span
                style={{
                  display: "inline-block",
                  transform:
                    "translate(calc(var(--btn-tx, 0) * 4px), calc(var(--btn-ty, 0) * 2.5px))",
                  transition: "transform 0.12s ease-out",
                }}
              >
                {translate("home.btnAgency")}
              </span>
            </>
          </motion.a>
        </motion.div>
        </div>
      </section>

      {/* ── Contact + Footer ── */}
      <section className="relative snap-start h-dvh flex flex-col overflow-hidden">
        <ContactSection variant="home" dark={dark} />
        <SiteFooter dark={dark} />
      </section>
    </main>
    </>
  );
}
