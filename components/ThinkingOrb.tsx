"use client";

import { useEffect, useRef, useState } from "react";

const TASKS = [
  "Analyzing context...",
  "Searching vector space...",
  "Optimizing response...",
  "Loading neural pathways...",
  "Calibrating precision...",
  "Synthesizing output...",
];

const N_DOTS = 160;
const RADIUS = 100;
const FOV = 260;
const SIZE = 260; // logical canvas size
const FPS_CAP = 30;
const FRAME_MS = 1000 / FPS_CAP;

interface Dot {
  x: number;
  y: number;
  z: number;
  phase: number;
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

function drawRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rotY: number,
  t: number,
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
      const p = FOV / (FOV + zr * 0.4);
      if (first) { ctx.moveTo(cx + xr * p, cy + ry * p); first = false; }
      else ctx.lineTo(cx + xr * p, cy + ry * p);
    }
    ctx.strokeStyle = "rgba(0, 140, 255, 0.09)";
    ctx.lineWidth = 0.75;
    ctx.stroke();
  }
}

export default function ThinkingOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const [taskIdx, setTaskIdx] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const dots = buildSphere(N_DOTS);

    const draw = (time: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (time - lastFrameRef.current < FRAME_MS) return;
      lastFrameRef.current = time;

      const t = time * 0.001;
      ctx.clearRect(0, 0, SIZE, SIZE);

      const rotY = t * 0.42;
      const rotX = Math.sin(t * 0.18) * 0.25;
      const pulse = ((t * 0.55) % 2) - 1; // sweeps -1 → 1

      drawRings(ctx, CX, CY, RADIUS, rotY, t);

      const projected = dots
        .map((d) => {
          // Rotate Y
          const x1 = d.x * Math.cos(rotY) + d.z * Math.sin(rotY);
          const z1 = -d.x * Math.sin(rotY) + d.z * Math.cos(rotY);
          // Rotate X
          const y2 = d.y * Math.cos(rotX) - z1 * Math.sin(rotX);
          const z2 = d.y * Math.sin(rotX) + z1 * Math.cos(rotX);

          const p = FOV / (FOV + z2 * RADIUS * 0.38);
          const px = CX + x1 * RADIUS * p;
          const py = CY + y2 * RADIUS * p;

          const depth = (z2 + 1) / 2;
          const pulseDist = Math.abs(d.y - pulse);
          const glow = Math.max(0, 1 - pulseDist * 4.8);
          const flicker = 0.88 + 0.12 * Math.sin(t * 3.1 + d.phase);
          const alpha = depth * 0.65 * flicker + glow * 0.9;
          const size = p * 2.1 * (1 + glow * 1.6);

          return { px, py, alpha, size, glow, z: z2 };
        })
        .sort((a, b) => a.z - b.z);

      for (const pt of projected) {
        if (pt.alpha < 0.02) continue;
        if (pt.glow > 0.08) {
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, pt.size * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 200, 255, ${pt.glow * 0.11})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, pt.size, 0, Math.PI * 2);
        ctx.fillStyle =
          pt.glow > 0.22
            ? `rgba(120, 230, 255, ${pt.alpha})`
            : `rgba(0, 170, 255, ${pt.alpha})`;
        ctx.fill();
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTextVisible(false);
      const swap = window.setTimeout(() => {
        setTaskIdx((i) => (i + 1) % TASKS.length);
        setTextVisible(true);
      }, 320);
      return () => window.clearTimeout(swap);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: SIZE, height: SIZE }}
      />
      <p
        className="text-xs font-mono tracking-widest uppercase"
        style={{
          color: "rgba(0, 170, 255, 0.65)",
          opacity: textVisible ? 1 : 0,
          transition: "opacity 0.32s ease",
          letterSpacing: "0.18em",
        }}
      >
        {TASKS[taskIdx]}
      </p>
    </div>
  );
}
