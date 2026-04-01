"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const cinematicChapters = [
  {
    tag: "01 / IA Aplicada",
    title: "Automação inteligente que vira vantagem competitiva.",
    description:
      "Da estratégia ao deploy, criamos produtos com IA que escalam operação, reduzem custo e aceleram receita.",
    prompt: "Mapear oportunidades de IA e implementar agente de atendimento omnichannel.",
    states: ["Lendo documentação", "Analisando API legada", "Gerando plano de migração", "Aplicando alterações"],
  },
  {
    tag: "02 / Engenharia de Produto",
    title: "Sistemas digitais construídos para performance contínua.",
    description:
      "Arquitetura robusta, UX premium e squads de alta entrega para transformar roadmap em resultado real.",
    prompt: "Refatorar módulo de pagamentos para arquitetura orientada a eventos.",
    states: ["Abrindo worktree", "Executando testes", "Refatorando serviços", "Criando pull request"],
  },
  {
    tag: "03 / Growth & Marketing",
    title: "Dados, criativos e mídia alinhados para crescimento previsível.",
    description:
      "Unimos software + marketing para criar um motor de aquisição, retenção e autoridade da sua marca.",
    prompt: "Criar funil completo com tracking, experimentos e otimização de CAC.",
    states: ["Conectando fontes de dados", "Modelando audiência", "Gerando insights", "Publicando dashboard"],
  },
];

const milestones = [
  {
    year: "2020",
    title: "Fundação BITCRAFT",
    description:
      "Nascemos com foco em engenharia de software de alta performance para negócios digitais.",
  },
  {
    year: "2022",
    title: "Expansão em IA",
    description:
      "Iniciamos squads especializados em automação inteligente e produtos com IA aplicada.",
  },
  {
    year: "2024",
    title: "Digital + Marketing",
    description:
      "Unimos software, dados e marketing para criar experiências completas de crescimento.",
  },
  {
    year: "2026",
    title: "Escala Global",
    description:
      "Entregamos soluções digitais e inteligência artificial para empresas em múltiplos mercados.",
  },
];

const bentoItems = [
  {
    title: "Início Visionário",
    text: "Começamos como uma célula de inovação focada em resolver problemas reais com software sob medida.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    className: "md:col-span-2 md:row-span-1",
  },
  {
    title: "Cultura de Engenharia",
    text: "Criamos uma cultura onde design, código e estratégia caminham juntos para acelerar resultados.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "IA com Impacto",
    text: "Transformamos IA em vantagem competitiva, conectando dados, automação e produtos inteligentes.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    className: "md:col-span-1 md:row-span-2",
  },
  {
    title: "Produtos Escaláveis",
    text: "Arquiteturas robustas e cloud-native para suportar crescimento contínuo sem perder performance.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Agência de Marketing",
    text: "Estratégia, conteúdo e mídia orientados por dados para gerar aquisição, retenção e autoridade.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Parcerias de Longo Prazo",
    text: "Atuamos como extensão do time dos clientes, entregando evolução contínua de produto e marca.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    className: "md:col-span-2 md:row-span-1",
  },
];

const features = [
  {
    icon: "AI",
    title: "Plataformas de IA",
    description:
      "Copilotos, agentes e automações integradas ao seu fluxo para multiplicar produtividade com governança.",
  },
  {
    icon: "DX",
    title: "Produtos Digitais",
    description:
      "Apps e sistemas completos com arquitetura escalável, UX premium e aceleração contínua de roadmap.",
  },
  {
    icon: "MK",
    title: "Growth Marketing",
    description:
      "Estratégia, criativo e mídia orientados por dados para crescimento previsível em aquisição e retenção.",
  },
  {
    icon: "CL",
    title: "Cloud & Integrações",
    description:
      "Infraestrutura moderna, observabilidade e integrações críticas para operar com alta performance e segurança.",
  },
];

const faq = [
  {
    q: "Quais serviços a BITCRAFT oferece?",
    a: "Desenvolvimento de IA, software sob medida, produtos digitais, integrações e marketing orientado por dados.",
  },
  {
    q: "Vocês atendem empresas de qualquer porte?",
    a: "Sim. Atendemos startups, scale-ups e empresas estabelecidas com times dedicados conforme a necessidade.",
  },
  {
    q: "Em quanto tempo um projeto começa?",
    a: "Após o diagnóstico inicial, conseguimos iniciar em poucos dias úteis com escopo, roadmap e squad alinhados.",
  },
  {
    q: "Como entrar em contato?",
    a: "Você pode usar o formulário nesta página ou o botão Fale Conosco para abrir nossa conversa imediata.",
  },
];

const socialLinks = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "GitHub", href: "#" },
];

const workSurfaces = [
  {
    title: "Começar na plataforma",
    text: "Centro de comando com visão de tarefas, progresso em tempo real e contexto contínuo por squad.",
  },
  {
    title: "Continuar no editor",
    text: "Fluxo fluido entre ideação, implementação e revisão para reduzir fricção no ciclo de entrega.",
  },
  {
    title: "Finalizar no terminal",
    text: "Execução assistida de ponta a ponta para manter velocidade sem abrir mão de qualidade.",
  },
];

const brandLogos = [
  {
    src: "/BITCRAFT-SOFTWARE_FACTORY.png",
    alt: "Logo BITCRAFT Software Factory",
  },
  {
    src: "/BITCRAFT-MARKETING_AGENCY.png",
    alt: "Logo BITCRAFT Marketing Agency",
  },
];

const HERO_TRAIL_CHARS = ["0", "1", "{", "}", "<", ">", "/", "_", "=", "+", ";", "[", "]", "*"];

const initialForm = { name: "", email: "", message: "" };

export default function Page() {
  const [theme, setTheme] = useState("dark");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const heroRef = useRef(null);
  const heroCardRef = useRef(null);
  const heroTrailCanvasRef = useRef(null);
  const heroPointerRef = useRef({
    targetX: 50,
    targetY: 44,
    currentX: 50,
    currentY: 44,
    targetStrength: 0,
    currentStrength: 0,
    targetOffsetX: 0,
    targetOffsetY: 0,
    currentOffsetX: 0,
    currentOffsetY: 0,
    rafId: 0,
  });
  const heroTrailRef = useRef({
    particles: [],
    lastX: null,
    lastY: null,
    lastTime: 0,
    pointerX: null,
    pointerY: null,
    pointerInside: false,
    rafId: 0,
    lastFrameTime: 0,
    resizeObserver: null,
  });
  const cinematicRef = useRef(null);
  const chapterRefs = useRef([]);
  const timelineRef = useRef(null);
  const featuresRef = useRef([]);
  const featureWrapperRef = useRef(null);

  const year = useMemo(() => new Date().getFullYear(), []);

  const { scrollYProgress: pageProgress } = useScroll();
  const pageProgressSpring = useSpring(pageProgress, { stiffness: 90, damping: 22 });

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end 30%"],
  });

  const heroContentY = useTransform(heroProgress, [0, 1], [0, -62]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.7, 1], [1, 0.92, 0.78]);
  const heroPanelY = useTransform(heroProgress, [0, 1], [52, -24]);
  const heroPanelScale = useTransform(heroProgress, [0, 0.45, 1], [0.94, 1, 1.02]);
  const heroPanelOpacity = useTransform(heroProgress, [0, 0.18, 1], [0, 1, 1]);
  const heroBackgroundFade = useTransform(heroProgress, [0, 1], [1, 0.55]);

  const heroTiltX = useMotionValue(0);
  const heroTiltY = useMotionValue(0);
  const heroGlowX = useMotionValue(50);
  const heroGlowY = useMotionValue(50);

  const heroTiltXSpring = useSpring(heroTiltX, { stiffness: 132, damping: 28, mass: 0.82 });
  const heroTiltYSpring = useSpring(heroTiltY, { stiffness: 132, damping: 28, mass: 0.82 });
  const heroGlowXCss = useMotionTemplate`${heroGlowX}%`;
  const heroGlowYCss = useMotionTemplate`${heroGlowY}%`;
  const heroLayerX = useTransform(heroTiltYSpring, [-8, 8], [-12, 12]);
  const heroLayerY = useTransform(heroTiltXSpring, [-8, 8], [12, -12]);
  const heroSidebarX = useTransform(heroLayerX, (value) => value * 0.42);
  const heroSidebarY = useTransform(heroLayerY, (value) => value * 0.42);
  const heroMainX = useTransform(heroLayerX, (value) => value * -0.2);
  const heroMainY = useTransform(heroLayerY, (value) => value * -0.2);
  const heroShadowX = useTransform(heroTiltYSpring, [-8, 8], [-18, 18]);
  const heroShadowY = useTransform(heroTiltXSpring, [-8, 8], [16, -10]);
  const heroDynamicShadow = useMotionTemplate`${heroShadowX}px ${heroShadowY}px 90px rgba(0,0,0,0.46), 0 0 0 1px rgba(255,255,255,0.06) inset`;

  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 25%"],
  });
  const timelineScale = useSpring(timelineProgress, { stiffness: 110, damping: 26 });

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("bitcraft-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem("bitcraft-theme", theme);
  }, [theme]);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const state = heroPointerRef.current;
    const lerp = (start, end, amount) => start + (end - start) * amount;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const updateTargets = (clientX, clientY) => {
      const rect = heroEl.getBoundingClientRect();
      const relativeX = clamp((clientX - rect.left) / rect.width, 0, 1);
      const relativeY = clamp((clientY - rect.top) / rect.height, 0, 1);
      const rawX = relativeX * 100;
      const rawY = relativeY * 100;

      state.targetX = rawX;
      state.targetY = rawY;
      state.targetStrength = 1;
      state.targetOffsetX = (relativeX - 0.5) * 30;
      state.targetOffsetY = (relativeY - 0.5) * 20;

      heroEl.style.setProperty("--mouse-x-raw", `${rawX}%`);
      heroEl.style.setProperty("--mouse-y-raw", `${rawY}%`);

      const cardEl = heroCardRef.current;
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        const cardX = clamp(((clientX - cardRect.left) / cardRect.width) * 100, 0, 100);
        const cardY = clamp(((clientY - cardRect.top) / cardRect.height) * 100, 0, 100);
        heroGlowX.set(cardX);
        heroGlowY.set(cardY);
      } else {
        heroGlowX.set(rawX);
        heroGlowY.set(rawY);
      }

      heroTiltY.set((state.targetX - 50) / 7.6);
      heroTiltX.set(-(state.targetY - 50) / 8.4);
    };

    const resetTargets = () => {
      state.targetStrength = 0;
      state.targetOffsetX = 0;
      state.targetOffsetY = 0;
      heroTiltX.set(0);
      heroTiltY.set(0);
    };

    const animate = () => {
      state.currentX = lerp(state.currentX, state.targetX, 0.062);
      state.currentY = lerp(state.currentY, state.targetY, 0.062);
      state.currentStrength = lerp(state.currentStrength, state.targetStrength, 0.065);
      state.currentOffsetX = lerp(state.currentOffsetX, state.targetOffsetX, 0.054);
      state.currentOffsetY = lerp(state.currentOffsetY, state.targetOffsetY, 0.054);

      heroEl.style.setProperty("--mouse-x", `${state.currentX}%`);
      heroEl.style.setProperty("--mouse-y", `${state.currentY}%`);
      heroEl.style.setProperty("--hero-hover-strength", `${state.currentStrength.toFixed(3)}`);
      heroEl.style.setProperty("--offset-x", `${state.currentOffsetX.toFixed(2)}px`);
      heroEl.style.setProperty("--offset-y", `${state.currentOffsetY.toFixed(2)}px`);
      heroEl.style.setProperty("--grid-x", `${(state.currentOffsetX * -0.8).toFixed(2)}px`);
      heroEl.style.setProperty("--grid-y", `${(state.currentOffsetY * -0.8).toFixed(2)}px`);

      state.rafId = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      updateTargets(event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
      resetTargets();
    };

    heroEl.addEventListener("pointermove", handlePointerMove);
    heroEl.addEventListener("pointerleave", handlePointerLeave);
    state.rafId = window.requestAnimationFrame(animate);

    return () => {
      heroEl.removeEventListener("pointermove", handlePointerMove);
      heroEl.removeEventListener("pointerleave", handlePointerLeave);
      window.cancelAnimationFrame(state.rafId);
    };
  }, [heroGlowX, heroGlowY, heroTiltX, heroTiltY]);

  useEffect(() => {
    const heroEl = heroRef.current;
    const canvas = heroTrailCanvasRef.current;
    if (!heroEl || !canvas) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = heroTrailRef.current;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      const rect = heroEl.getBoundingClientRect();
      canvas.width = Math.round(rect.width * DPR);
      canvas.height = Math.round(rect.height * DPR);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const createParticle = (x, y, options = {}) => {
      const {
        spread = 18,
        intensity = 1,
        speedFactor = 0.5,
        directionX = 0,
        directionY = 0,
        trailStretch = 0,
      } = options;

      const speedRatio = clamp(speedFactor / 1.4, 0, 1);
      const directionLength = Math.hypot(directionX, directionY) || 1;
      const unitDirX = directionX / directionLength;
      const unitDirY = directionY / directionLength;
      const tangentX = -unitDirY;
      const tangentY = unitDirX;
      const tailOffset = trailStretch * (0.2 + Math.random() * 0.9);
      const lateralOffset = (Math.random() - 0.5) * spread;
      const seededX = x - unitDirX * tailOffset + tangentX * lateralOffset;
      const seededY = y - unitDirY * tailOffset + tangentY * lateralOffset;

      return {
        x: seededX,
        y: seededY,
        originX: seededX,
        originY: seededY,
        angle: Math.random() * Math.PI * 2,
        radius: 2 + Math.random() * (8 + intensity * 1.3 + speedFactor * 5),
        speed: 0.26 + intensity * 0.16 + Math.random() * (0.42 + speedFactor * 0.4),
        alpha: 0.42 + intensity * 0.06 + Math.random() * (0.08 + (1 - speedRatio) * 0.08),
        initialAlpha: 0.42 + intensity * 0.06 + Math.random() * (0.08 + (1 - speedRatio) * 0.08),
        lifetime: 2300 + intensity * 280 + speedFactor * 760 + Math.random() * 520,
        age: 0,
        size: 9 + intensity * 1.1 + Math.random() * (6 + (1 - speedRatio) * 4),
        rotation: (Math.random() - 0.5) * 0.22,
        spin: (Math.random() - 0.5) * 0.012,
        driftX: (Math.random() - 0.5) * (0.08 + intensity * 0.035),
        driftY: (Math.random() - 0.5) * (0.06 + intensity * 0.028),
        char: randomFrom(HERO_TRAIL_CHARS),
        color:
          Math.random() > 0.78 ? "rgba(255,215,0,1)" : Math.random() > 0.45 ? "rgba(0,255,159,1)" : "rgba(0,170,255,1)",
      };
    };

    const spawnTrail = (x, y, intensity = 1, speedFactor = 0.5, options = {}) => {
      const speedRatio = clamp(speedFactor / 1.4, 0, 1);
      const densityScale = 1.05 - speedRatio * 0.62;
      const count = Math.max(1, Math.round(0.5 + intensity * densityScale));

      for (let index = 0; index < count; index += 1) {
        state.particles.push(
          createParticle(x, y, {
            spread: 10 + intensity * 5 + (1 - speedRatio) * 8,
            intensity,
            speedFactor,
            ...options,
          })
        );
      }
      if (state.particles.length > 440) {
        state.particles.splice(0, state.particles.length - 440);
      }
    };

    const handlePointerMove = (event) => {
      const now = performance.now();
      const rect = heroEl.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (state.lastX == null || state.lastY == null) {
        state.lastX = x;
        state.lastY = y;
        state.lastTime = now;
      }

      const dx = x - state.lastX;
      const dy = y - state.lastY;
      const distance = Math.hypot(dx, dy);
      const deltaTime = Math.max(now - state.lastTime, 8);
      const velocity = distance / deltaTime;
      const speedFactor = clamp(velocity / 1.1, 0, 1.4);
      const speedRatio = clamp(speedFactor / 1.4, 0, 1);
      const directionX = distance > 0.001 ? dx / distance : 0;
      const directionY = distance > 0.001 ? dy / distance : 0;

      if (distance > 2) {
        const stepSpacing = clamp(18 - speedRatio * 7, 9, 18);
        const steps = Math.max(1, Math.floor(distance / stepSpacing));
        const baseStretch = 10 + distance * 0.22 + speedFactor * 22;

        for (let index = 0; index <= steps; index += 1) {
          const progress = index / steps;
          const intensity = clamp(0.34 + distance / 52 + speedFactor * 0.28, 0.34, 1.8);
          const trailStretch = baseStretch * (0.82 + progress * 0.28);

          spawnTrail(state.lastX + dx * progress, state.lastY + dy * progress, intensity, speedFactor, {
            directionX,
            directionY,
            trailStretch,
          });
        }
      } else {
        spawnTrail(x, y, 0.24, 0.04, {
          directionX,
          directionY,
          trailStretch: 6,
        });
      }

      state.lastX = x;
      state.lastY = y;
      state.lastTime = now;
      state.pointerX = x;
      state.pointerY = y;
      state.pointerInside = true;
    };

    const handlePointerLeave = () => {
      state.pointerInside = false;
      state.lastX = null;
      state.lastY = null;
      state.lastTime = 0;
      state.pointerX = null;
      state.pointerY = null;
    };

    const render = (time) => {
      const width = canvas.width / DPR;
      const height = canvas.height / DPR;
      const deltaTime = state.lastFrameTime ? Math.min(time - state.lastFrameTime, 32) : 16.67;
      state.lastFrameTime = time;
      ctx.clearRect(0, 0, width, height);

      state.particles = state.particles.filter((particle) => particle.age < particle.lifetime);

      state.particles.forEach((particle) => {
        particle.age += deltaTime;
        particle.radius += particle.speed * (deltaTime / 16.67);
        particle.x = particle.originX + Math.cos(particle.angle) * particle.radius + particle.driftX * particle.radius;
        particle.y = particle.originY + Math.sin(particle.angle) * particle.radius + particle.driftY * particle.radius;
        particle.rotation += particle.spin;
        particle.speed *= 0.9974;

        if (state.pointerInside && state.pointerX != null && state.pointerY != null) {
          const cursorDx = particle.x - state.pointerX;
          const cursorDy = particle.y - state.pointerY;
          const cursorDistance = Math.hypot(cursorDx, cursorDy);
          const repelRadius = 180;

          if (cursorDistance < repelRadius && cursorDistance > 0.001) {
            const repelStrength = ((repelRadius - cursorDistance) / repelRadius) * 18;
            particle.x += (cursorDx / cursorDistance) * repelStrength;
            particle.y += (cursorDy / cursorDistance) * repelStrength;
          }
        }

        const fadeProgress = particle.age / particle.lifetime;
        const fadeCurve = 1 - Math.pow(fadeProgress, 1.65);
        particle.alpha = particle.initialAlpha * Math.max(fadeCurve, 0);

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.alpha;
        ctx.font = `600 ${particle.size}px var(--font-space-grotesk), monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 14;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color;
        ctx.fillText(particle.char, 0, 0);
        ctx.restore();
      });

      state.rafId = window.requestAnimationFrame(render);
    };

    resizeCanvas();
    render();

    heroEl.addEventListener("pointermove", handlePointerMove);
    heroEl.addEventListener("pointerleave", handlePointerLeave);

    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(heroEl);
    state.resizeObserver = resizeObserver;

    return () => {
      heroEl.removeEventListener("pointermove", handlePointerMove);
      heroEl.removeEventListener("pointerleave", handlePointerLeave);
      window.cancelAnimationFrame(state.rafId);
      state.resizeObserver?.disconnect();
      state.particles = [];
      state.lastX = null;
      state.lastY = null;
      state.lastTime = 0;
      state.pointerX = null;
      state.pointerY = null;
      state.lastFrameTime = 0;
    };
  }, []);

  useEffect(() => {
    const triggerEl = cinematicRef.current;
    const items = chapterRefs.current.filter(Boolean);
    if (!triggerEl || items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { autoAlpha: 0, y: 56, scale: 0.94 });
      gsap.set(items[0], { autoAlpha: 1, y: 0, scale: 1 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: triggerEl,
          start: "top top",
          end: `+=${items.length * 560}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      items.forEach((item, index) => {
        if (index === 0) return;

        tl.to(
          items[index - 1],
          {
            autoAlpha: 0,
            y: -58,
            scale: 0.92,
            duration: 0.65,
          },
          index - 0.08
        ).to(
          item,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.72,
          },
          index - 0.05
        );
      });
    }, cinematicRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const cards = featuresRef.current.filter(Boolean);
    if (!cards.length || !featureWrapperRef.current) return;

    const ctx = gsap.context(() => {
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            y: 60,
            rotateX: -8,
            opacity: 0.35,
            transformPerspective: 1200,
            transformOrigin: "50% 100%",
          },
          {
            y: -32,
            rotateX: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              end: "bottom 25%",
              scrub: true,
            },
            delay: index * 0.03,
          }
        );
      });
    }, featureWrapperRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (selectedFaq == null) return;

    const fullText = faq[selectedFaq].a;
    let index = 0;
    setTypedAnswer("");

    const interval = setInterval(() => {
      index += 1;
      setTypedAnswer(fullText.slice(0, index));
      if (index >= fullText.length) clearInterval(interval);
    }, 15);

    return () => clearInterval(interval);
  }, [selectedFaq]);

  useEffect(() => {
    if (!showToast) return;
    const timeout = setTimeout(() => setShowToast(false), 2800);
    return () => clearTimeout(timeout);
  }, [showToast]);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Nome é obrigatório.";
        if (value.trim().length < 2) return "Informe um nome válido.";
        return "";
      case "email":
        if (!value.trim()) return "Email é obrigatório.";
        if (!/^\S+@\S+\.\S+$/.test(value.trim())) return "Email inválido.";
        return "";
      case "message":
        if (!value.trim()) return "Mensagem é obrigatória.";
        if (value.trim().length < 10) return "A mensagem deve ter ao menos 10 caracteres.";
        return "";
      default:
        return "";
    }
  };

  const validateForm = (data) => {
    const newErrors = {
      name: validateField("name", data.name),
      email: validateField("email", data.email),
      message: validateField("message", data.message),
    };

    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm(form);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1300));
    setIsSubmitting(false);
    setShowToast(true);
    setForm(initialForm);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-300">
      <motion.div
        aria-hidden="true"
        className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)]"
        style={{ scaleX: pageProgressSpring }}
      />

      <div aria-hidden="true" className="ambient-noise fixed inset-0 z-0" />
      <div aria-hidden="true" className="ambient-aurora fixed inset-0 z-0" />

      <main className="relative z-10">
        <section
          ref={heroRef}
          className="relative min-h-[100svh] overflow-hidden cursor-default"
          aria-labelledby="hero-title"
          style={{
            "--mouse-x": "50%",
            "--mouse-y": "44%",
            "--mouse-x-raw": "50%",
            "--mouse-y-raw": "44%",
            "--hero-hover-strength": "0",
            "--offset-x": "0px",
            "--offset-y": "0px",
            "--grid-x": "0px",
            "--grid-y": "0px",
          }}
        >
          <motion.div style={{ opacity: heroBackgroundFade }} className="hero-minimal-bg absolute inset-0" aria-hidden="true" />
          <div className="hero-color-field absolute inset-0" aria-hidden="true">
            <div className="hero-color-orbit hero-color-orbit-a">
              <div className="hero-color-core hero-color-core-a" />
            </div>
            <div className="hero-color-orbit hero-color-orbit-b">
              <div className="hero-color-core hero-color-core-b" />
            </div>
            <div className="hero-color-orbit hero-color-orbit-c">
              <div className="hero-color-core hero-color-core-c" />
            </div>
          </div>
          <div className="hero-interactive-grid absolute inset-0" aria-hidden="true" />
          <div className="hero-interactive-particles absolute inset-0" aria-hidden="true" />
          <canvas ref={heroTrailCanvasRef} className="hero-character-trail absolute inset-0" aria-hidden="true" />
          <div className="hero-spotlight absolute inset-0" aria-hidden="true" />
          <div className="spotlight-beam absolute inset-0" aria-hidden="true" />

          <div className="relative mx-auto grid min-h-[100svh] w-full max-w-7xl gap-10 px-5 pb-14 pt-24 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <motion.div style={{ y: heroContentY, opacity: heroContentOpacity }} className="max-w-2xl">
              <p className="mb-5 inline-flex rounded-full border border-white/18 bg-white/[0.04] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                BITCRAFT // Software House + IA + Marketing
              </p>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                {brandLogos.map((logo) => (
                  <div
                    key={logo.src}
                    className="rounded-xl border border-white/14 bg-white/[0.03] px-3 py-2 backdrop-blur-md"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={300}
                      height={90}
                      priority
                      sizes="(max-width: 640px) 180px, 240px"
                      className="h-8 w-auto object-contain sm:h-10"
                    />
                  </div>
                ))}
              </div>

              <h1
                id="hero-title"
                className="text-balance text-4xl font-extrabold leading-[1.02] sm:text-6xl lg:text-[4.45rem]"
              >
                BITCRAFT: Código que Transforma
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--text-main)]/80 sm:text-xl">
                Desenvolvemos IA que impulsiona negócios.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#contato"
                  className="cta-ripple inline-flex items-center justify-center rounded-xl border border-[var(--accent)] bg-[linear-gradient(120deg,var(--primary),var(--accent))] px-7 py-3 text-sm font-bold uppercase tracking-wide text-[#041018] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
                  aria-label="Ir para a seção de contato"
                >
                  Fale Conosco
                </a>
                <p className="text-sm text-[var(--text-main)]/66">Fluxo de engenharia completo em um único parceiro.</p>
              </div>
            </motion.div>

            <motion.div
              ref={heroCardRef}
              style={{
                y: heroPanelY,
                scale: heroPanelScale,
                opacity: heroPanelOpacity,
                rotateX: heroTiltXSpring,
                rotateY: heroTiltYSpring,
                transformPerspective: 1400,
                boxShadow: heroDynamicShadow,
                "--mx": heroGlowXCss,
                "--my": heroGlowYCss,
              }}
              className="hero-workspace-card relative overflow-hidden rounded-3xl border border-white/15 bg-[rgba(8,15,28,0.78)] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5"
            >
              <div className="hero-card-glow absolute inset-0 pointer-events-none" aria-hidden="true" />

              <div className="hero-card-content relative z-10 mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/22" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/14" />
                </div>
                <span className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70">
                  BITCRAFT AI
                </span>
              </div>

              <div className="hero-card-content relative z-10 grid gap-3 sm:grid-cols-[170px_1fr]">
                <motion.aside
                  style={{ x: heroSidebarX, y: heroSidebarY }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/55">Tarefas</p>
                  <ul className="space-y-2 text-xs text-white/76">
                    <li className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-1.5">Criar hero principal</li>
                    <li className="rounded-md border border-white/10 px-2 py-1.5">Implementar modo claro</li>
                    <li className="rounded-md border border-white/10 px-2 py-1.5">Refinar onboarding</li>
                  </ul>
                </motion.aside>

                <motion.div
                  style={{ x: heroMainX, y: heroMainY }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="rounded-lg border border-[var(--primary)]/40 bg-[rgba(0,170,255,0.08)] px-3 py-2 text-sm leading-relaxed text-white/92">
                    Criar lançamento da BITCRAFT com foco em IA aplicada, produto digital e growth.
                  </p>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5 text-xs text-white/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_rgba(0,255,159,0.9)]" />
                      A ler ficheiros e contexto de produto...
                    </div>
                    <div className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5 text-xs text-white/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_10px_rgba(0,170,255,0.8)]" />
                      A gerar estrutura e interações...
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-white/12 bg-black/25 px-3 py-2 text-xs text-white/58">
                    Pergunte qualquer coisa ao agente...
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative py-24" aria-label="Destaques em movimento">
          <div ref={cinematicRef} className="mx-auto flex h-[80vh] w-full max-w-7xl items-center px-5 sm:px-8">
            <div className="relative h-[62vh] w-full overflow-hidden rounded-3xl border border-[var(--accent)]/45 bg-[rgba(7,17,33,0.66)] p-6 sm:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(0,170,255,0.24),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,rgba(0,255,159,0.18),transparent_45%)]" />

              {cinematicChapters.map((chapter, index) => (
                <article
                  key={chapter.title}
                  ref={(el) => {
                    chapterRefs.current[index] = el;
                  }}
                  className="absolute inset-0 grid content-center gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center sm:p-10"
                >
                  <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--secondary)]">
                      {chapter.tag}
                    </p>
                    <h2 className="max-w-4xl text-balance text-3xl font-extrabold leading-tight sm:text-5xl">
                      {chapter.title}
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-main)]/82 sm:text-xl">
                      {chapter.description}
                    </p>
                  </div>

                  <div className="interface-panel rounded-2xl border border-white/15 bg-[rgba(7,14,28,0.66)] p-4 shadow-[0_20px_55px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5">
                    <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">workspace.bitcraft</span>
                      <span className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70">
                        BITCRAFT AI
                      </span>
                    </div>

                    <p className="rounded-xl border border-[var(--primary)]/30 bg-[rgba(0,170,255,0.08)] px-3 py-2 text-sm leading-relaxed text-white/90">
                      {chapter.prompt}
                    </p>

                    <div className="mt-4 space-y-2">
                      {chapter.states.map((state) => (
                        <div
                          key={state}
                          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/80"
                        >
                          <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(0,255,159,0.9)]" />
                          {state}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={timelineRef}
          className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8"
          aria-labelledby="quem-somos-title"
        >
          <motion.h2
            id="quem-somos-title"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            className="text-3xl font-bold sm:text-4xl"
          >
            Quem Somos
          </motion.h2>

          <div className="relative mt-12 overflow-x-auto pb-3" role="region" aria-label="Linha do tempo da empresa">
            <div className="absolute left-0 right-0 top-16 h-[2px] bg-[rgba(0,170,255,0.24)]" />
            <motion.div
              aria-hidden="true"
              className="absolute left-0 top-16 h-[2px] origin-left bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)]"
              style={{ scaleX: timelineScale, width: "100%" }}
            />

            <div className="relative flex min-w-max gap-6 pr-4">
              {milestones.map((item, i) => (
                <motion.article
                  key={item.year}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="glass neon-border mt-6 w-[290px] rounded-2xl p-5"
                  aria-label={`${item.year} - ${item.title}`}
                >
                  <p className="text-sm font-bold text-[var(--secondary)]">{item.year}</p>
                  <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-main)]/84">{item.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8" aria-labelledby="historia-title">
          <motion.h2
            id="historia-title"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            className="text-3xl font-bold sm:text-4xl"
          >
            Nossa História
          </motion.h2>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-2">
            {bentoItems.map((item) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.28 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35 }}
                className={`group relative overflow-hidden rounded-2xl ${item.className}`}
              >
                <img
                  src={item.image}
                  loading="lazy"
                  alt={item.title}
                  className="h-full min-h-[220px] w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,7,14,0.98)] via-[rgba(2,7,14,0.55)] to-transparent" />
                <div className="absolute inset-0 flex translate-y-5 flex-col justify-end p-5 transition duration-500 group-hover:translate-y-0">
                  <h3 className="text-xl font-semibold text-[#f3fffe]">{item.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#d4f9ff] transition duration-500 group-hover:text-white">
                    {item.text}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section
          ref={featureWrapperRef}
          className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8"
          aria-labelledby="features-title"
        >
          <motion.h2
            id="features-title"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            className="text-3xl font-bold sm:text-4xl"
          >
            O Que Entregamos
          </motion.h2>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 [transform-style:preserve-3d]">
            {features.map((feature, i) => (
              <motion.article
                key={feature.title}
                ref={(el) => {
                  featuresRef.current[i] = el;
                }}
                whileHover={{ scale: 1.03, y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="feature-card group glass neon-border rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
              >
                <motion.div
                  animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.07, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--secondary)] bg-[rgba(255,215,0,0.12)] text-sm font-extrabold text-[var(--secondary)]"
                  aria-hidden="true"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-relaxed text-[var(--text-main)]/84">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 pb-6 sm:px-8" aria-labelledby="surfaces-title">
          <motion.h2
            id="surfaces-title"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            className="text-3xl font-bold sm:text-4xl"
          >
            O Mesmo Fluxo em Todo Lugar
          </motion.h2>

          <p className="mt-4 max-w-3xl text-[var(--text-main)]/78">
            Da visão estratégica à entrega em produção, mantemos continuidade de contexto para sua equipe ganhar
            velocidade sem perder consistência técnica.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {workSurfaces.map((item) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                className="surface-card rounded-2xl border border-white/12 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-lg"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Bitcraft Flow</p>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-main)]/78">{item.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section
          id="contato"
          className="mx-auto w-full max-w-7xl px-5 py-8 pb-24 sm:px-8"
          aria-labelledby="contato-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="glass neon-border relative overflow-hidden rounded-3xl p-6 sm:p-8"
          >
            <div className="absolute -left-10 -top-20 h-40 w-40 rounded-full bg-[rgba(0,170,255,0.3)] blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-[rgba(0,255,159,0.22)] blur-3xl" aria-hidden="true" />

            <h2 id="contato-title" className="relative text-3xl font-bold sm:text-4xl">
              Vamos Construir Seu Próximo Salto Digital
            </h2>
            <p className="relative mt-3 max-w-2xl text-[var(--text-main)]/84">
              Fale com a BITCRAFT e receba um plano inicial para IA, produto digital e estratégia de marketing.
            </p>

            <form className="relative mt-8 grid gap-4" onSubmit={handleSubmit} noValidate aria-label="Formulário de contato">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className="w-full rounded-xl border border-[var(--primary)]/50 bg-[var(--surface)] px-4 py-3 outline-none ring-0 transition focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(0,255,159,0.3)]"
                  placeholder="Seu nome"
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-[#ff7f7f]">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="w-full rounded-xl border border-[var(--primary)]/50 bg-[var(--surface)] px-4 py-3 outline-none ring-0 transition focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(0,255,159,0.3)]"
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-[#ff7f7f]">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className="min-h-[130px] w-full rounded-xl border border-[var(--primary)]/50 bg-[var(--surface)] px-4 py-3 outline-none ring-0 transition focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(0,255,159,0.3)]"
                  placeholder="Conte seu desafio e objetivos"
                />
                {errors.message && (
                  <p id="message-error" className="mt-1 text-sm text-[#ff7f7f]">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 inline-flex w-fit items-center gap-3 rounded-xl border border-[var(--accent)] bg-[linear-gradient(120deg,var(--primary),var(--accent))] px-6 py-3 font-bold text-[#03131b] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-[#033147] border-t-transparent"
                    aria-hidden="true"
                  />
                )}
                {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
              </button>
            </form>
          </motion.div>
        </section>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsChatOpen((prev) => !prev)}
          aria-label="Abrir chatbot da BITCRAFT"
          aria-expanded={isChatOpen}
          className="pulse-ring relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent)] bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-xl font-extrabold text-[#052032] shadow-[0_0_25px_rgba(0,255,159,0.45)] transition hover:scale-105"
        >
          ?
        </button>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-label="FAQ da BITCRAFT"
            className="fixed bottom-24 right-6 z-50 w-[min(92vw,390px)] rounded-2xl border border-[var(--accent)] bg-[rgba(10,25,47,0.92)] p-4 text-[var(--text-main)] shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <header className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">BITCRAFT Assistant</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                aria-label="Fechar chatbot"
                className="rounded-md px-2 py-1 text-sm hover:bg-[rgba(255,255,255,0.08)]"
              >
                Fechar
              </button>
            </header>

            <div className="chat-scroll max-h-72 overflow-auto pr-1">
              <p className="mb-3 text-sm text-[var(--text-main)]/80">Perguntas frequentes:</p>
              <div className="space-y-2">
                {faq.map((item, index) => (
                  <button
                    key={item.q}
                    onClick={() => setSelectedFaq(index)}
                    className="w-full rounded-lg border border-[var(--primary)]/35 bg-[rgba(0,170,255,0.1)] px-3 py-2 text-left text-sm transition hover:border-[var(--accent)] hover:bg-[rgba(0,255,159,0.12)]"
                  >
                    {item.q}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-[var(--accent)]/40 bg-[rgba(0,255,159,0.08)] p-3 text-sm leading-relaxed">
                {selectedFaq == null ? (
                  <p>Selecione uma pergunta para ver a resposta.</p>
                ) : (
                  <>
                    <p className="mb-2 font-semibold text-[var(--accent)]">Resposta:</p>
                    <p aria-live="polite">{typedAnswer}</p>
                  </>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <footer className="border-t border-[var(--primary)]/25 px-5 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-lg border border-[var(--primary)]/35 px-3 py-2 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                aria-label={`Acessar ${item.label}`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <p className="text-sm text-[var(--text-main)]/80">© {year} BITCRAFT. Todos os direitos reservados.</p>

          <button
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className="rounded-xl border border-[var(--secondary)]/70 px-4 py-2 text-sm font-semibold transition hover:bg-[rgba(255,215,0,0.12)]"
            aria-label="Alternar entre tema escuro e claro"
          >
            {theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="fixed bottom-6 left-6 z-50 rounded-xl border border-[var(--accent)] bg-[rgba(0,255,159,0.16)] px-4 py-3 text-sm font-semibold text-[var(--text-main)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-lg"
            role="status"
            aria-live="polite"
          >
            Mensagem enviada com sucesso. Retornaremos em breve.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
