"use client";

import { useState, useEffect, useRef } from "react";

const FADE_MS = 350;

function randomCharFrom(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

function phraseCharPool(phrase: string): string[] {
  // Strip markup syntax, collect unique non-space chars from the actual text
  const plain = phrase.replace(/\[\[([^|]+)\|[^\]]+\]\]/g, "$1");
  return Array.from(new Set(plain.split("").filter((c) => c !== " ")));
}

function parsePhrase(phrase: string): { text: string; accent: boolean }[] {
  const segments: { text: string; accent: boolean }[] = [];
  const regex = /\[\[([^|]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(phrase)) !== null) {
    if (match.index > last)
      segments.push({ text: phrase.slice(last, match.index), accent: false });
    segments.push({ text: match[1], accent: true });
    last = match.index + match[0].length;
  }
  if (last < phrase.length) segments.push({ text: phrase.slice(last), accent: false });
  return segments;
}

interface CharItem {
  char: string;
  accent: boolean;
  scrambled: string;
  revealed: boolean;
}

function buildChars(phrase: string, pool: string[]): CharItem[] {
  const items: CharItem[] = [];
  for (const seg of parsePhrase(phrase)) {
    for (const c of seg.text) {
      items.push({ char: c, accent: seg.accent, scrambled: randomCharFrom(pool), revealed: false });
    }
  }
  return items;
}

export interface HeroSoftwareCycleProps {
  phrases: string[];
  accentColor?: string;
  accentFont?: string;
  className?: string;
  displayDuration?: number;
  speed?: number;
}

export default function HeroSoftwareCycle({
  phrases,
  accentColor = "#00ff9f",
  accentFont,
  className = "",
  displayDuration = 3500,
  speed = 45,
}: HeroSoftwareCycleProps) {
  const [visible, setVisible] = useState(false);
  const [chars, setChars] = useState<CharItem[]>([]);
  // Stable refs so the effect closure captures the latest prop values
  const speedRef = useRef(speed);
  const displayDurationRef = useRef(displayDuration);
  speedRef.current = speed;
  displayDurationRef.current = displayDuration;

  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;

  useEffect(() => {
    let alive = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function cleanup() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
    }

    function runPhrase(idx: number) {
      cleanup();
      const phrase = phrasesRef.current[idx % phrasesRef.current.length];
      const pool = phraseCharPool(phrase);
      const allChars = buildChars(phrase, pool);

      setChars([...allChars]);

      // Brief pause so React renders the new chars before fading in
      timeoutId = setTimeout(() => {
        if (!alive) return;
        setVisible(true);

        let ptr = 0;

        intervalId = setInterval(() => {
          if (!alive) return;

          // Skip consecutive spaces
          while (ptr < allChars.length && allChars[ptr].char === " ") {
            allChars[ptr].revealed = true;
            ptr++;
          }
          // Reveal next non-space char
          if (ptr < allChars.length) {
            allChars[ptr].revealed = true;
            ptr++;
          }
          // Scramble still-unrevealed non-space chars
          for (let i = ptr; i < allChars.length; i++) {
            if (allChars[i].char !== " ") {
              allChars[i].scrambled = randomCharFrom(pool);
            }
          }

          setChars([...allChars]);

          if (ptr >= allChars.length) {
            clearInterval(intervalId!);
            intervalId = null;

            timeoutId = setTimeout(() => {
              if (!alive) return;
              setVisible(false);

              timeoutId = setTimeout(() => {
                if (!alive) return;
                runPhrase(idx + 1);
              }, FADE_MS);
            }, displayDurationRef.current);
          }
        }, speedRef.current);
      }, 50);
    }

    runPhrase(0);

    return () => {
      alive = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <h1
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      {chars.map((c, i) => {
        const displayChar = c.char === " " ? " " : (c.revealed ? c.char : c.scrambled);
        if (c.accent) {
          return (
            <span
              key={i}
              style={{
                color: accentColor,
                fontFamily: accentFont,
                fontWeight: "bold",
                fontSize: "1.4em",
                lineHeight: 1,
                opacity: c.revealed ? 1 : 0.4,
              }}
            >
              {displayChar}
            </span>
          );
        }
        return (
          <span key={i} className={c.revealed ? "text-white" : "text-white/40"}>
            {displayChar}
          </span>
        );
      })}
    </h1>
  );
}
