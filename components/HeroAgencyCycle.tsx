"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

function parsePhrase(phrase: string): { text: string; accent: boolean }[] {
  const segments: { text: string; accent: boolean }[] = [];
  const regex = /\[\[([^|]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(phrase)) !== null) {
    if (match.index > last) segments.push({ text: phrase.slice(last, match.index), accent: false });
    segments.push({ text: match[1], accent: true });
    last = match.index + match[0].length;
  }
  if (last < phrase.length) segments.push({ text: phrase.slice(last), accent: false });
  return segments;
}

export interface HeroAgencyCycleProps {
  phrases: string[];
  accentColor?: string;
  accentFont?: string;
  className?: string;
  displayDuration?: number;
}

const ENTRY_S = 1.1;
const STAGGER_S = 0.028;
const EXIT_S = 0.4;

export default function HeroAgencyCycle({
  phrases,
  accentColor = "#00aaff",
  accentFont,
  className = "",
  displayDuration = 3200,
}: HeroAgencyCycleProps) {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const splitRef = useRef<InstanceType<typeof GSAPSplitText> | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  // Tracks which phraseIdx was last handed to animateIn — prevents phraseIdx effect
  // from duplicating the work already done by the initial effect
  const lastAnimatedIdxRef = useRef(-1);

  useEffect(() => { gsap.registerPlugin(GSAPSplitText); }, []);

  function killCurrent() {
    if (tlRef.current) { tlRef.current.kill(); tlRef.current = null; }
    if (splitRef.current) { try { splitRef.current.revert(); } catch (_) {} splitRef.current = null; }
  }

  function animateIn(el: HTMLElement) {
    killCurrent();
    const split = new GSAPSplitText(el, { type: "chars,words", charsClass: "split-char", wordsClass: "split-word" });
    splitRef.current = split;
    const tl = gsap.timeline();
    tl.fromTo(split.chars,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: ENTRY_S, ease: "power3.out", stagger: STAGGER_S }
    );
    tlRef.current = tl;
  }

  function animateOut(): Promise<void> {
    if (!splitRef.current?.chars?.length) return Promise.resolve();
    return new Promise(resolve => {
      const tl = gsap.timeline({ onComplete: resolve });
      tl.to(splitRef.current!.chars, { opacity: 0, y: -28, duration: EXIT_S, ease: "power2.in", stagger: 0.01 });
      tlRef.current = tl;
    });
  }

  // Main cycle setup — runs (and re-runs) normally; cleanup handles teardown
  useEffect(() => {
    const el = h1Ref.current;
    if (!el) return;

    // Maximum number of chars across all phrases (for interval timing)
    const maxChars = Math.max(...phrases.map(p =>
      p.replace(/\[\[([^|]+)\|[^\]]+\]\]/g, '$1').length
    ));
    const cycleMs = (ENTRY_S + STAGGER_S * maxChars) * 1000 + displayDuration + EXIT_S * 1000;

    let localIdx = 0;
    let alive = true;

    // Initial animation
    lastAnimatedIdxRef.current = 0;
    const run = () => { if (alive) animateIn(el); };
    if (document.fonts?.status === "loaded") { run(); }
    else { document.fonts?.ready.then(run) ?? run(); }

    // Cycling interval
    const interval = setInterval(async () => {
      if (!alive || !h1Ref.current) return;
      await animateOut();
      if (!alive || !h1Ref.current) return;
      localIdx = (localIdx + 1) % phrases.length;
      lastAnimatedIdxRef.current = localIdx;
      setPhraseIdx(localIdx);
    }, cycleMs);

    return () => {
      alive = false;
      clearInterval(interval);
      killCurrent();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate in when phrase changes — but only for changes driven by the interval,
  // not for the initial render (which the setup effect already handles)
  useEffect(() => {
    if (phraseIdx === lastAnimatedIdxRef.current) return;
    if (!h1Ref.current) return;
    lastAnimatedIdxRef.current = phraseIdx;
    const el = h1Ref.current;
    requestAnimationFrame(() => requestAnimationFrame(() => animateIn(el)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phraseIdx]);

  const segments = parsePhrase(phrases[phraseIdx]);

  return (
    <h1 ref={h1Ref} className={className}>
      {segments.map((seg, i) =>
        seg.accent ? (
          <span key={i} style={{ color: accentColor, fontFamily: accentFont, fontWeight: "bold" }}>
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </h1>
  );
}
