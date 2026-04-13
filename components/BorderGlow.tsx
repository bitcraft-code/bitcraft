"use client";

import { useRef, useCallback, useEffect, type ReactNode, type FC, type CSSProperties } from 'react';

interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  animationDelay?: number;
  colors?: string[];
  fillOpacity?: number;
}

function parseHSL(hslStr: string): { h: number; s: number; l: number } {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildBoxShadow(glowColor: string, intensity: number): string {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const layers: [number, number, number, number, number, boolean][] = [
    [0, 0, 0, 1, 100, true], [0, 0, 1, 0, 60, true], [0, 0, 3, 0, 50, true],
    [0, 0, 6, 0, 40, true], [0, 0, 15, 0, 30, true], [0, 0, 25, 2, 20, true],
    [0, 0, 50, 2, 10, true],
    [0, 0, 1, 0, 60, false], [0, 0, 3, 0, 50, false], [0, 0, 6, 0, 40, false],
    [0, 0, 15, 0, 30, false], [0, 0, 25, 2, 20, false], [0, 0, 50, 2, 10, false],
  ];
  return layers.map(([x, y, blur, spread, alpha, inset]) => {
    const a = Math.min(alpha * intensity, 100);
    return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
  }).join(', ');
}

function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x: number) { return x * x * x; }

interface AnimateOpts {
  start?: number; end?: number; duration?: number; delay?: number;
  ease?: (t: number) => number; onUpdate: (v: number) => void; onEnd?: () => void;
}

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }: AnimateOpts) {
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  }
  setTimeout(() => requestAnimationFrame(tick), delay);
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors: string[]): string[] {
  const gradients: string[] = [];
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    gradients.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
  }
  gradients.push(`linear-gradient(${colors[0]} 0 100%)`);
  return gradients;
}

const BorderGlow: FC<BorderGlowProps> = ({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#060010',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  animationDelay = 0,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity = 0.5,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const pointerRafRef = useRef<number | null>(null);
  const edgeProximityRef = useRef(0);
  const cursorAngleRef = useRef(45);
  const hoverActiveRef = useRef(false);
  const sweepActiveRef = useRef(false);

  const getCenterOfElement = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }, [getCenterOfElement]);

  const getCursorAngle = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }, [getCenterOfElement]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || pointerRafRef.current !== null) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointerRafRef.current = requestAnimationFrame(() => {
      const nextEdgeProximity = getEdgeProximity(card, x, y);
      const nextCursorAngle = getCursorAngle(card, x, y);
      edgeProximityRef.current = nextEdgeProximity;
      cursorAngleRef.current = nextCursorAngle;
      const colorSensitivity = edgeSensitivity + 20;
      const isVisible = hoverActiveRef.current || sweepActiveRef.current;
      const borderOpacity = isVisible
        ? Math.max(0, (nextEdgeProximity * 100 - colorSensitivity) / (100 - colorSensitivity))
        : 0;
      const glowOpacity = isVisible
        ? Math.max(0, (nextEdgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity))
        : 0;
      card.style.setProperty("--glow-angle", `${nextCursorAngle.toFixed(3)}deg`);
      card.style.setProperty("--border-opacity", `${borderOpacity}`);
      card.style.setProperty("--glow-opacity", `${glowOpacity}`);
      pointerRafRef.current = null;
    });
  }, [edgeSensitivity, getEdgeProximity, getCursorAngle]);

  useEffect(() => {
    if (!animated) return;
    const el = cardRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout>;
    let triggered = false;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !triggered) {
        triggered = true;
        observer.disconnect();

        const angleStart = 110;
        const angleEnd = 465;

        timer = setTimeout(() => {
          sweepActiveRef.current = true;
          cursorAngleRef.current = angleStart;
          edgeProximityRef.current = 0;
          el.style.setProperty("--glow-angle", `${angleStart.toFixed(3)}deg`);
          el.style.setProperty("--border-opacity", "0");
          el.style.setProperty("--glow-opacity", "0");

          animateValue({
            duration: 500,
            onUpdate: v => {
              edgeProximityRef.current = v / 100;
              const colorSensitivity = edgeSensitivity + 20;
              const borderOpacity = Math.max(0, (v - colorSensitivity) / (100 - colorSensitivity));
              const glowOpacity = Math.max(0, (v - edgeSensitivity) / (100 - edgeSensitivity));
              el.style.setProperty("--border-opacity", `${borderOpacity}`);
              el.style.setProperty("--glow-opacity", `${glowOpacity}`);
            }
          });
          animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: v => {
            const nextAngle = (angleEnd - angleStart) * (v / 100) + angleStart;
            cursorAngleRef.current = nextAngle;
            el.style.setProperty("--glow-angle", `${nextAngle.toFixed(3)}deg`);
          }});
          animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => {
            const nextAngle = (angleEnd - angleStart) * (v / 100) + angleStart;
            cursorAngleRef.current = nextAngle;
            el.style.setProperty("--glow-angle", `${nextAngle.toFixed(3)}deg`);
          }});
          animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
            onUpdate: v => {
              edgeProximityRef.current = v / 100;
              const colorSensitivity = edgeSensitivity + 20;
              const borderOpacity = Math.max(0, (v - colorSensitivity) / (100 - colorSensitivity));
              const glowOpacity = Math.max(0, (v - edgeSensitivity) / (100 - edgeSensitivity));
              el.style.setProperty("--border-opacity", `${borderOpacity}`);
              el.style.setProperty("--glow-opacity", `${glowOpacity}`);
            },
            onEnd: () => {
              sweepActiveRef.current = false;
              el.style.setProperty("--border-opacity", "0");
              el.style.setProperty("--glow-opacity", "0");
            },
          });
        }, animationDelay);
      }
    }, { threshold: 0.2 });

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [animated, animationDelay, edgeSensitivity]);

  const meshGradients = buildMeshGradients(colors);
  const borderBg = meshGradients.map(g => `${g} border-box`);
  const fillBg = meshGradients.map(g => `${g} padding-box`);
  const cardStyle = {
    "--glow-angle": "45deg",
    "--border-opacity": 0,
    "--glow-opacity": 0,
    background: backgroundColor,
    borderRadius: `${borderRadius}px`,
    transform: "translate3d(0, 0, 0.01px)",
    boxShadow:
      "rgba(0,0,0,0.1) 0 1px 2px, rgba(0,0,0,0.1) 0 2px 4px, rgba(0,0,0,0.1) 0 4px 8px, rgba(0,0,0,0.1) 0 8px 16px",
  } as CSSProperties & Record<"--glow-angle" | "--border-opacity" | "--glow-opacity", string | number>;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={(e) => {
        hoverActiveRef.current = true;
        e.currentTarget.style.setProperty("--border-opacity", e.currentTarget.style.getPropertyValue("--border-opacity") || "0");
        e.currentTarget.style.setProperty("--glow-opacity", e.currentTarget.style.getPropertyValue("--glow-opacity") || "0");
      }}
      onPointerLeave={(e) => {
        hoverActiveRef.current = false;
        e.currentTarget.style.setProperty("--border-opacity", "0");
        e.currentTarget.style.setProperty("--glow-opacity", "0");
      }}
      className={`relative grid isolate border border-white/10 ${className}`}
      style={cardStyle}
    >
      {/* mesh gradient border */}
      <div
        className="absolute inset-0 rounded-[inherit] -z-[1]"
        style={{
          border: '1px solid transparent',
          background: [
            `linear-gradient(${backgroundColor} 0 100%) padding-box`,
            'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box',
            ...borderBg,
          ].join(', '),
          opacity: 'var(--border-opacity)',
          maskImage: `conic-gradient(from var(--glow-angle) at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          WebkitMaskImage: `conic-gradient(from var(--glow-angle) at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          transition: 'opacity 0.25s ease-out',
        }}
      />

      {/* mesh gradient fill near edges */}
      <div
        className="absolute inset-0 rounded-[inherit] -z-[1]"
        style={{
          border: '1px solid transparent',
          background: fillBg.join(', '),
          maskImage: [
            'linear-gradient(to bottom, black, black)',
            'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
            'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
            'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
            'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
            'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
            'conic-gradient(from var(--glow-angle) at center, transparent 5%, black 15%, black 85%, transparent 95%)',
          ].join(', '),
          WebkitMaskImage: [
            'linear-gradient(to bottom, black, black)',
            'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
            'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
            'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
            'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
            'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
            'conic-gradient(from var(--glow-angle) at center, transparent 5%, black 15%, black 85%, transparent 95%)',
          ].join(', '),
          maskComposite: 'subtract, add, add, add, add, add',
          WebkitMaskComposite: 'source-out, source-over, source-over, source-over, source-over, source-over',
          opacity: `calc(var(--border-opacity) * ${fillOpacity})`,
          mixBlendMode: 'soft-light',
          transition: 'opacity 0.25s ease-out',
        } as CSSProperties}
      />

      {/* outer glow */}
      <span
        className="absolute pointer-events-none z-[1] rounded-[inherit]"
        style={{
          inset: `${-glowRadius}px`,
          maskImage: 'conic-gradient(from var(--glow-angle) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)',
          WebkitMaskImage: 'conic-gradient(from var(--glow-angle) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)',
          opacity: 'var(--glow-opacity)',
          mixBlendMode: 'plus-lighter',
          transition: 'opacity 0.25s ease-out',
        } as CSSProperties}
      >
        <span
          className="absolute rounded-[inherit]"
          style={{
            inset: `${glowRadius}px`,
            boxShadow: buildBoxShadow(glowColor, glowIntensity),
          }}
        />
      </span>

      <div className="flex flex-col relative overflow-auto z-[1]">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
