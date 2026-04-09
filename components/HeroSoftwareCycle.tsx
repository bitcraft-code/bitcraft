"use client";

import { useState, useEffect, useRef } from "react";
import DecryptedText from "./DecryptedText";

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

/** Estimate decrypt time: parallel segments, each takes (len * speed) ms */
function estimateDecryptMs(phrase: string, speed: number): number {
  const maxSegLen = Math.max(
    ...parsePhrase(phrase).map((s) => s.text.length),
  );
  return maxSegLen * speed + 300; // +buffer
}

export interface HeroSoftwareCycleProps {
  phrases: string[];
  accentColor?: string;
  accentFont?: string;
  className?: string;
  displayDuration?: number;
  speed?: number;
}

const FADE_MS = 350;

export default function HeroSoftwareCycle({
  phrases,
  accentColor = "#00ff9f",
  accentFont,
  className = "",
  displayDuration = 3500,
  speed = 45,
}: HeroSoftwareCycleProps) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  // Incremented on each phrase change — used as key to force-remount DecryptedText
  const cycleKeyRef = useRef(0);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    let alive = true;

    function scheduleNext() {
      const entryMs = estimateDecryptMs(phrases[cycleKeyRef.current % phrases.length], speed);
      const holdMs = entryMs + displayDuration;

      const t1 = setTimeout(() => {
        if (!alive) return;
        setVisible(false); // start fade out

        const t2 = setTimeout(() => {
          if (!alive) return;
          cycleKeyRef.current += 1;
          setPhraseIdx(cycleKeyRef.current % phrases.length);
          setCycleKey(cycleKeyRef.current);
          // Brief pause so React mounts new DecryptedText instances before fading in
          const t3 = setTimeout(() => {
            if (!alive) return;
            setVisible(true);
            scheduleNext();
          }, 50);
          return () => clearTimeout(t3);
        }, FADE_MS);
        return () => clearTimeout(t2);
      }, holdMs);
      return () => clearTimeout(t1);
    }

    scheduleNext();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const segments = parsePhrase(phrases[phraseIdx]);

  return (
    <h1
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      {segments.map((seg, i) =>
        seg.accent ? (
          <DecryptedText
            key={`${cycleKey}-${i}`}
            text={seg.text}
            sequential
            revealDirection="start"
            speed={speed}
            animateOn="view"
            encryptedClassName="opacity-40"
            style={{ color: accentColor, fontFamily: accentFont, fontWeight: "bold" }}
          />
        ) : (
          <DecryptedText
            key={`${cycleKey}-${i}`}
            text={seg.text}
            sequential
            revealDirection="start"
            speed={speed}
            animateOn="view"
            className="text-white"
            encryptedClassName="text-white/40"
          />
        ),
      )}
    </h1>
  );
}
