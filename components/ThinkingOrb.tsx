"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimationActivity } from "@/lib/use-animation-activity";

const DEFAULT_TASKS = [
  "Analyzing context...",
  "Searching vector space...",
  "Optimizing response...",
  "Loading neural pathways...",
  "Calibrating precision...",
  "Synthesizing output...",
];

const N_PULSES = 3;
const FPS_CAP = 30;
const FRAME_MS = 1000 / FPS_CAP;

// Responsive canvas parameters — resolved at runtime inside the draw effect
const BREAKPOINT = 768;
const CONFIG = {
  desktop: { size: 520, dots: 750, radius: 178, fov: 455 },
  mobile:  { size: 320, dots: 320, radius: 110, fov: 280 },
} as const;

interface Dot {
  x: number;
  y: number;
  z: number;
  phase: number;
}

interface Props {
  accentRgb?: string;  // e.g. "0, 255, 159"
  accentRgb2?: string; // if set, dots interpolate horizontally from accentRgb to accentRgb2
  tasks?: string[];
}

function parseRgb(rgb: string): [number, number, number] {
  const parts = rgb.split(",").map((s) => parseInt(s.trim(), 10));
  return [parts[0], parts[1], parts[2]];
}

function buildSphere(n: number): Dot[] {
  const golden = Math.PI * (1 + Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const polar = Math.acos(1 - (2 * (i + 0.5)) / n);
    const azimuth = golden * i;
    return {
      x: Math.sin(polar) * Math.cos(azimuth),
      y: Math.sin(polar) * Math.sin(azimuth),
      z: Math.cos(polar),
      phase: (i / n) * Math.PI * 6,
    };
  });
}

function randomUnitVector(): [number, number, number] {
  // Uniform random direction on the sphere
  const u = Math.random() * 2 - 1;
  const theta = Math.random() * Math.PI * 2;
  const r = Math.sqrt(1 - u * u);
  return [r * Math.cos(theta), r * Math.sin(theta), u];
}

function drawRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rotY: number,
  t: number,
  accentRgb: string,
  fov: number,
): void {
  const rings = [
    { tiltX: 0.4, speed: 0.7, phase: 0 },
    { tiltX: -0.65, speed: -0.5, phase: 2.1 },
    { tiltX: 0.15, speed: 1.0, phase: 4.2 },
  ];
  for (const cfg of rings) {
    const steps = 72;
    ctx.beginPath();
    let first = true;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2 + t * cfg.speed * 0.22 + cfg.phase;
      const rx = Math.cos(a) * r;
      const ry = Math.sin(a) * Math.cos(cfg.tiltX) * r;
      const rz = Math.sin(a) * Math.sin(cfg.tiltX) * r;
      const xr = rx * Math.cos(rotY) + rz * Math.sin(rotY);
      const zr = -rx * Math.sin(rotY) + rz * Math.cos(rotY);
      const p = fov / (fov + zr * 0.4);
      if (first) {
        ctx.moveTo(cx + xr * p, cy + ry * p);
        first = false;
      } else {
        ctx.lineTo(cx + xr * p, cy + ry * p);
      }
    }
    ctx.strokeStyle = `rgba(${accentRgb}, 0.09)`;
    ctx.lineWidth = 0.75;
    ctx.stroke();
  }
}

export default function ThinkingOrb({ accentRgb = "0, 170, 255", accentRgb2, tasks = DEFAULT_TASKS }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const textSwapTimeoutRef = useRef<number>(0);
  const [taskIdx, setTaskIdx] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const { shouldAnimate } = useAnimationActivity(canvasRef, {
    threshold: 0.05,
  });

  // Multiple independent pulse sweeps, each on a random axis with a random speed/phase
  const pulses = useMemo(
    () =>
      Array.from({ length: N_PULSES }, () => ({
        axis: randomUnitVector(),
        speed: 0.38 + Math.random() * 0.42,
        phase: Math.random() * Math.PI * 2,
      })),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cfg = window.innerWidth >= BREAKPOINT ? CONFIG.desktop : CONFIG.mobile;
    const { size: SIZE, dots: N_DOTS, radius: RADIUS, fov: FOV } = cfg;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    ctx.scale(dpr, dpr);

    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const dots = buildSphere(N_DOTS);
    const projected = dots.map(() => ({
      px: 0,
      py: 0,
      alpha: 0,
      size: 0,
      glow: 0,
      depth: 0,
    }));
    const depthBucketCount = 20;
    const depthBuckets = Array.from({ length: depthBucketCount }, () => [] as number[]);

    // Pre-parse for gradient interpolation — avoids string parsing per dot per frame
    const c1 = parseRgb(accentRgb);
    const c2 = accentRgb2 ? parseRgb(accentRgb2) : null;

    function dotColor(px: number): string {
      if (!c2) return accentRgb;
      const t = Math.max(0, Math.min(1, px / SIZE));
      const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
      return `${r}, ${g}, ${b}`;
    }

    const draw = (time: number) => {
      if (!shouldAnimate) {
        rafRef.current = 0;
        lastFrameRef.current = 0;
        return;
      }

      rafRef.current = requestAnimationFrame(draw);
      if (time - lastFrameRef.current < FRAME_MS) return;

      const delta =
        lastFrameRef.current === 0
          ? FRAME_MS
          : Math.min(time - lastFrameRef.current, FRAME_MS * 2);
      lastFrameRef.current = time;
      elapsedRef.current += delta * 0.001;

      const t = elapsedRef.current;
      ctx.clearRect(0, 0, SIZE, SIZE);

      const rotY = t * 0.42;
      const rotX = Math.sin(t * 0.18) * 0.25;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const pulsePositions = pulses.map((pulse) => ({
        ...pulse,
        pos: (((t * pulse.speed + pulse.phase) % 2) + 2) % 2 - 1,
      }));

      drawRings(ctx, CX, CY, RADIUS, rotY, t, accentRgb, FOV);

      for (const bucket of depthBuckets) bucket.length = 0;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        // Rotate Y
        const x1 = d.x * cosY + d.z * sinY;
        const z1 = -d.x * sinY + d.z * cosY;
        // Rotate X
        const y2 = d.y * cosX - z1 * sinX;
        const z2 = d.y * sinX + z1 * cosX;

        const p = FOV / (FOV + z2 * RADIUS * 0.55);
        const px = CX + x1 * RADIUS * p;
        const py = CY + y2 * RADIUS * p;

        let rawGlow = 0;
        for (let j = 0; j < pulsePositions.length; j++) {
          const pulse = pulsePositions[j];
          const [nx, ny, nz] = pulse.axis;
          const axisDot = d.x * nx + d.y * ny + d.z * nz;
          rawGlow += Math.max(0, 1 - Math.abs(axisDot - pulse.pos) * 5.5);
        }

        const depth = (z2 + 1) / 2;
        const glow = Math.min(1, rawGlow);
        const flicker = 0.88 + 0.12 * Math.sin(t * 3.1 + d.phase);
        const depthAlpha = 0.15 + depth * 0.75;

        const pt = projected[i];
        pt.px = px;
        pt.py = py;
        pt.depth = depth;
        pt.glow = glow;
        pt.alpha = depthAlpha * flicker + glow * 0.9;
        pt.size = p * (0.6 + depth * 1.8) * (1 + glow * 1.6);

        const bucketIndex = Math.max(
          0,
          Math.min(depthBucketCount - 1, Math.floor(depth * depthBucketCount)),
        );
        depthBuckets[bucketIndex].push(i);
      }

      for (let bucketIndex = 0; bucketIndex < depthBuckets.length; bucketIndex++) {
        const bucket = depthBuckets[bucketIndex];
        for (let i = 0; i < bucket.length; i++) {
          const pt = projected[bucket[i]];
          if (pt.alpha < 0.02) continue;
          const color = dotColor(pt.px);
          if (pt.glow > 0.16 && pt.depth > 0.18) {
            ctx.beginPath();
            ctx.arc(pt.px, pt.py, pt.size * 2.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${pt.glow * 0.09})`;
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, pt.size, 0, Math.PI * 2);
          ctx.fillStyle =
            pt.glow > 0.22
              ? `rgba(${color}, ${pt.alpha})`
              : `rgba(${color}, ${pt.alpha * 0.75})`;
          ctx.fill();
        }
      }
    };

    if (shouldAnimate) {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      lastFrameRef.current = 0;
    };
  }, [accentRgb, accentRgb2, pulses, shouldAnimate]);

  useEffect(() => {
    const id = setInterval(() => {
      setTextVisible(false);
      textSwapTimeoutRef.current = window.setTimeout(() => {
        setTaskIdx((i) => (i + 1) % tasks.length);
        setTextVisible(true);
      }, 320);
    }, 2000);
    return () => {
      clearInterval(id);
      window.clearTimeout(textSwapTimeoutRef.current);
    };
  }, [tasks]);

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
      />
      <p
        className="text-xs font-mono tracking-widest uppercase"
        style={{
          color: `rgba(${accentRgb}, 0.65)`,
          opacity: textVisible ? 1 : 0,
          transition: "opacity 0.32s ease",
          letterSpacing: "0.18em",
        }}
      >
        {tasks[taskIdx]}
      </p>
    </div>
  );
}
