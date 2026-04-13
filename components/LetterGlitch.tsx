"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAnimationActivity } from "@/lib/use-animation-activity";

interface PaletteColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
}

interface LetterCell {
  char: string;
  color: string;
  colorIndex: number;
  targetColorIndex: number;
  colorProgress: number;
}

function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const normalizedHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

const LetterGlitch = ({
  glitchColors = ["#2b4539", "#61dca3", "#61b3dc"],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",
}: {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<LetterCell[]>([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastDrawTime = useRef(0);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { shouldAnimate, prefersReducedMotion } = useAnimationActivity(wrapperRef, {
    threshold: 0.05,
  });

  const lettersAndSymbols = useMemo(() => Array.from(characters), [characters]);
  const palette = useMemo<PaletteColor[]>(
    () =>
      glitchColors.map((color) => {
        const rgb = hexToRgb(color) ?? { r: 97, g: 220, b: 163 };
        return { hex: color, rgb };
      }),
    [glitchColors],
  );
  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;
  const frameInterval = 1000 / 30;

  const getRandomChar = () =>
    lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];

  const getRandomColorIndex = () =>
    Math.floor(Math.random() * Math.max(1, palette.length));

  const interpolateColor = (
    start: { r: number; g: number; b: number },
    end: { r: number; g: number; b: number },
    factor: number
  ) => {
    const result = {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor),
    };
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  };

  const calculateGrid = (width: number, height: number) => ({
    columns: Math.ceil(width / charWidth),
    rows: Math.ceil(height / charHeight),
  });

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    letters.current = Array.from({ length: columns * rows }, () => ({
      char: getRandomChar(),
      color: palette[0]?.hex ?? "#61dca3",
      colorIndex: 0,
      targetColorIndex: 0,
      colorProgress: 1,
    }));

    for (let i = 0; i < letters.current.length; i++) {
      const colorIndex = getRandomColorIndex();
      const targetColorIndex = getRandomColorIndex();
      letters.current[i]!.colorIndex = colorIndex;
      letters.current[i]!.targetColorIndex = targetColorIndex;
      letters.current[i]!.color = palette[colorIndex]?.hex ?? "#61dca3";
    }
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = 1; // cap at 1 — glitch background doesn't need retina resolution
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    if (context.current) context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  const drawLetters = () => {
    if (!context.current || !canvasRef.current || letters.current.length === 0) return;
    const ctx = context.current;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";
    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;
    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));
    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;
      const nextColorIndex = getRandomColorIndex();
      letters.current[index].char = getRandomChar();
      letters.current[index].targetColorIndex = nextColorIndex;
      if (!smooth) {
        letters.current[index].colorIndex = nextColorIndex;
        letters.current[index].color = palette[nextColorIndex]?.hex ?? "#61dca3";
        letters.current[index].colorProgress = 1;
      } else {
        letters.current[index].colorProgress = 0;
      }
    }
  };

  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    letters.current.forEach((letter) => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;
        const startRgb = palette[letter.colorIndex]?.rgb;
        const endRgb = palette[letter.targetColorIndex]?.rgb;
        if (!startRgb || !endRgb) return;

        letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
        if (letter.colorProgress >= 1) {
          letter.colorIndex = letter.targetColorIndex;
          letter.color = palette[letter.colorIndex]?.hex ?? letter.color;
        }
        needsRedraw = true;
      }
    });
    if (needsRedraw) drawLetters();
  };

  const animate = useCallback((now: number) => {
    if (!shouldAnimate || prefersReducedMotion) {
      animationRef.current = null;
      lastDrawTime.current = 0;
      return;
    }

    animationRef.current = requestAnimationFrame(animate);
    if (now - lastDrawTime.current < frameInterval) return;

    if (lastDrawTime.current === 0 || now - lastDrawTime.current >= glitchSpeed) {
      updateLetters();
      drawLetters();
    }
    if (smooth) handleSmoothTransitions();
    lastDrawTime.current = now;
  }, [frameInterval, glitchSpeed, prefersReducedMotion, shouldAnimate, smooth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    context.current = canvas.getContext("2d");
    resizeCanvas();
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        cancelAnimationFrame(animationRef.current as number);
        animationRef.current = null;
        lastDrawTime.current = 0;
        resizeCanvas();
        if (shouldAnimate && !prefersReducedMotion) {
          animationRef.current = requestAnimationFrame(animate);
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationRef.current ?? 0);
      animationRef.current = null;
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [animate, glitchSpeed, smooth, palette, lettersAndSymbols]);

  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion) return;

    if (shouldAnimate) {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        const idleHandle = (
          window as Window & {
            requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number;
            cancelIdleCallback?: (id: number) => void;
          }
        ).requestIdleCallback(
          () => {
            if (animationRef.current === null) {
              animationRef.current = requestAnimationFrame(animate);
            }
          },
          { timeout: 1500 },
        );

        return () => {
          window.cancelIdleCallback?.(idleHandle);
          cancelAnimationFrame(animationRef.current ?? 0);
          animationRef.current = null;
          lastDrawTime.current = 0;
        };
      }

      if (animationRef.current === null) {
        animationRef.current = requestAnimationFrame(animate);
      }
    } else {
      cancelAnimationFrame(animationRef.current ?? 0);
      animationRef.current = null;
      lastDrawTime.current = 0;
    }

    return () => {
      cancelAnimationFrame(animationRef.current ?? 0);
      animationRef.current = null;
      lastDrawTime.current = 0;
    };
  }, [animate, prefersReducedMotion, shouldAnimate]);

  return (
    <div ref={wrapperRef} className="relative w-full h-full bg-black overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {outerVignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0)_60%,_rgba(0,0,0,1)_100%)]" />
      )}
      {centerVignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0.8)_0%,_rgba(0,0,0,0)_60%)]" />
      )}
    </div>
  );
};

export default LetterGlitch;
