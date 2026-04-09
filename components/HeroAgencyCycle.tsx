"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

function buildHTML(
  phrase: string,
  accentColor: string,
  accentFont: string | undefined,
): string {
  const parts: string[] = [];
  const regex = /\[\[([^|]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(phrase)) !== null) {
    if (match.index > last)
      parts.push(`<span>${phrase.slice(last, match.index)}</span>`);
    parts.push(
      `<span style="color:${accentColor};font-family:${accentFont ?? ""};font-weight:bold;font-size:1.4em;line-height:1">${match[1]}</span>`,
    );
    last = match.index + match[0].length;
  }
  if (last < phrase.length) parts.push(`<span>${phrase.slice(last)}</span>`);
  return parts.join("");
}

export interface HeroAgencyCycleProps {
  phrases: string[];
  accentColor?: string;
  accentFont?: string;
  className?: string;
  displayDuration?: number;
}

export default function HeroAgencyCycle({
  phrases,
  accentColor = "#00aaff",
  accentFont,
  className = "",
  displayDuration = 3200,
}: HeroAgencyCycleProps) {
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.registerPlugin(GSAPSplitText);

    const el = h1Ref.current;
    if (!el) return;

    let alive = true;
    let idx = 0;
    let split: InstanceType<typeof GSAPSplitText> | null = null;
    let activeTl: gsap.core.Timeline | null = null;
    let showTimer: ReturnType<typeof setTimeout> | null = null;

    function kill() {
      if (showTimer) { clearTimeout(showTimer); showTimer = null; }
      if (activeTl) { activeTl.kill(); activeTl = null; }
      if (split) { try { split.revert(); } catch (_) {} split = null; }
    }

    function enter() {
      if (!alive) return;
      kill();

      el.innerHTML = buildHTML(phrases[idx], accentColor, accentFont);
      split = new GSAPSplitText(el, {
        type: "chars,words",
        charsClass: "split-char",
        wordsClass: "split-word",
      });

      activeTl = gsap.timeline({
        onComplete: () => {
          if (!alive) return;
          // Phrase is fully visible — wait displayDuration then exit
          showTimer = setTimeout(exit, displayDuration);
        },
      });
      activeTl.fromTo(
        split.chars,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.028 },
      );
    }

    function exit() {
      if (!alive || !split) return;
      showTimer = null;

      activeTl = gsap.timeline({
        onComplete: () => {
          if (!alive) return;
          if (split) { try { split.revert(); } catch (_) {} split = null; }
          idx = (idx + 1) % phrases.length;
          enter();
        },
      });
      activeTl.to(split.chars, {
        opacity: 0,
        y: -28,
        duration: 0.4,
        ease: "power2.in",
        stagger: 0.01,
      });
    }

    // Kick off — wait for fonts so SplitText measures correctly
    const run = () => { if (alive) enter(); };
    if (document.fonts?.status === "loaded") {
      run();
    } else {
      document.fonts?.ready.then(run) ?? run();
    }

    return () => {
      alive = false;
      kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No React state — h1 innerHTML is managed entirely by GSAP/DOM
  return <h1 ref={h1Ref} className={className} />;
}
