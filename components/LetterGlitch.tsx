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
  const lettersRef = useRef<LetterCell[]>([]);
  const gridRef = useRef({ columns: 0, rows: 0 });
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastFrameRef = useRef(0);
  const lastGlitchTimeRef = useRef(0);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { shouldAnimate, prefersReducedMotion } = useAnimationActivity(wrapperRef, {
    threshold: 0.01,
  });

  const lettersAndSymbols = useMemo(() => Array.from(characters), [characters]);
  const palette = useMemo<PaletteColor[]>(
    () =>
      glitchColors.map((color) => ({
        hex: color,
        rgb: hexToRgb(color) ?? { r: 97, g: 220, b: 163 },
      })),
    [glitchColors],
  );

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;
  const fpsCap = typeof window !== "undefined" && window.navigator.maxTouchPoints > 0 ? 24 : 30;
  const frameInterval = 1000 / fpsCap;

  const getRandomChar = useCallback(
    () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)],
    [lettersAndSymbols],
  );
  const getRandomColorIndex = useCallback(
    () => Math.floor(Math.random() * Math.max(1, palette.length)),
    [palette.length],
  );

  const interpolateColor = useCallback(
    (
      start: { r: number; g: number; b: number },
      end: { r: number; g: number; b: number },
      factor: number,
    ) => {
      const result = {
        r: Math.round(start.r + (end.r - start.r) * factor),
        g: Math.round(start.g + (end.g - start.g) * factor),
        b: Math.round(start.b + (end.b - start.b) * factor),
      };
      return `rgb(${result.r}, ${result.g}, ${result.b})`;
    },
    [],
  );

  const calculateGrid = useCallback((width: number, height: number) => ({
    columns: Math.ceil(width / charWidth),
    rows: Math.ceil(height / charHeight),
  }), []);

  const drawLetters = useCallback(() => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || lettersRef.current.length === 0) return;

    const { width, height } = canvasSizeRef.current;
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    for (let index = 0; index < lettersRef.current.length; index++) {
      const letter = lettersRef.current[index];
      if (!letter) continue;
      const x = (index % gridRef.current.columns) * charWidth;
      const y = Math.floor(index / gridRef.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    }
  }, []);

  const initializeLetters = useCallback((columns: number, rows: number) => {
    gridRef.current = { columns, rows };
    lettersRef.current = Array.from({ length: columns * rows }, () => {
      const colorIndex = getRandomColorIndex();
      const targetColorIndex = getRandomColorIndex();
      return {
        char: getRandomChar(),
        color: palette[colorIndex]?.hex ?? "#61dca3",
        colorIndex,
        targetColorIndex,
        colorProgress: 1,
      };
    });
  }, [getRandomChar, getRandomColorIndex, palette]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = 1;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvasSizeRef.current = { width: rect.width, height: rect.height };

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  }, [calculateGrid, drawLetters, initializeLetters]);

  const updateLetters = useCallback(() => {
    const letters = lettersRef.current;
    if (letters.length === 0) return;

    const updateCount = Math.max(1, Math.floor(letters.length * 0.05));
    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.length);
      const letter = letters[index];
      if (!letter) continue;

      const nextColorIndex = getRandomColorIndex();
      letter.char = getRandomChar();
      letter.targetColorIndex = nextColorIndex;

      if (!smooth) {
        letter.colorIndex = nextColorIndex;
        letter.color = palette[nextColorIndex]?.hex ?? "#61dca3";
        letter.colorProgress = 1;
      } else {
        letter.colorProgress = 0;
      }
    }
  }, [getRandomChar, getRandomColorIndex, palette, smooth]);

  const handleSmoothTransitions = useCallback(() => {
    let needsRedraw = false;

    for (let i = 0; i < lettersRef.current.length; i++) {
      const letter = lettersRef.current[i];
      if (!letter || letter.colorProgress >= 1) continue;

      letter.colorProgress += 0.05;
      if (letter.colorProgress > 1) letter.colorProgress = 1;

      const startRgb = palette[letter.colorIndex]?.rgb;
      const endRgb = palette[letter.targetColorIndex]?.rgb;
      if (!startRgb || !endRgb) continue;

      letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
      if (letter.colorProgress >= 1) {
        letter.colorIndex = letter.targetColorIndex;
        letter.color = palette[letter.colorIndex]?.hex ?? letter.color;
      }
      needsRedraw = true;
    }

    if (needsRedraw) drawLetters();
  }, [drawLetters, interpolateColor, palette]);

  const animate = useCallback((now: number) => {
    if (!shouldAnimate || prefersReducedMotion) {
      animationRef.current = null;
      lastFrameRef.current = 0;
      lastGlitchTimeRef.current = 0;
      return;
    }

    animationRef.current = requestAnimationFrame(animate);
    if (now - lastFrameRef.current < frameInterval) return;
    lastFrameRef.current = now;

    if (lastGlitchTimeRef.current === 0 || now - lastGlitchTimeRef.current >= glitchSpeed) {
      updateLetters();
      drawLetters();
      lastGlitchTimeRef.current = now;
    }

    if (smooth) {
      handleSmoothTransitions();
    }
  }, [
    drawLetters,
    frameInterval,
    glitchSpeed,
    handleSmoothTransitions,
    prefersReducedMotion,
    shouldAnimate,
    smooth,
    updateLetters,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    contextRef.current = canvas.getContext("2d");
    if (!contextRef.current) return;

    resizeCanvas();

    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        cancelAnimationFrame(animationRef.current ?? 0);
        animationRef.current = null;
        lastFrameRef.current = 0;
        lastGlitchTimeRef.current = 0;
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
  }, [animate, prefersReducedMotion, resizeCanvas, shouldAnimate]);

  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion) return;

    if (shouldAnimate) {
      if ("requestIdleCallback" in window) {
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
          lastFrameRef.current = 0;
          lastGlitchTimeRef.current = 0;
        };
      }

      if (animationRef.current === null) {
        animationRef.current = requestAnimationFrame(animate);
      }
    } else {
      cancelAnimationFrame(animationRef.current ?? 0);
      animationRef.current = null;
      lastFrameRef.current = 0;
      lastGlitchTimeRef.current = 0;
    }

    return () => {
      cancelAnimationFrame(animationRef.current ?? 0);
      animationRef.current = null;
      lastFrameRef.current = 0;
      lastGlitchTimeRef.current = 0;
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
