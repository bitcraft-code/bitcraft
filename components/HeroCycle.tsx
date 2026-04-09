"use client";

/**
 * HeroCycle — unified hero headline with swappable animation.
 *
 * animation variants:
 *   "decrypt" — char-by-char left-to-right decryption (current Software style)
 *   "split"   — GSAP SplitText char entry/exit      (current Agency style)
 *   "type"    — typewriter with delete loop          (original TextType style)
 *
 * Phrase markup:  [[word|accent,bold]]  →  styled accent segment
 */

import HeroSoftwareCycle from "./HeroSoftwareCycle";
import HeroAgencyCycle from "./HeroAgencyCycle";
import TextType from "./TextType";

export type HeroAnimation = "decrypt" | "split" | "type";

export interface HeroCycleProps {
  animation: HeroAnimation;
  phrases: string[];
  accentColor?: string;
  accentFont?: string;
  className?: string;
  displayDuration?: number;
  /** ms per character — used by "decrypt" and "type" variants */
  speed?: number;
}

export default function HeroCycle({
  animation,
  phrases,
  accentColor = "#00ff9f",
  accentFont,
  className = "",
  displayDuration = 3200,
  speed = 50,
}: HeroCycleProps) {
  if (animation === "decrypt") {
    return (
      <HeroSoftwareCycle
        phrases={phrases}
        accentColor={accentColor}
        accentFont={accentFont}
        className={className}
        displayDuration={displayDuration}
        speed={speed}
      />
    );
  }

  if (animation === "split") {
    return (
      <HeroAgencyCycle
        phrases={phrases}
        accentColor={accentColor}
        accentFont={accentFont}
        className={className}
        displayDuration={displayDuration}
      />
    );
  }

  // "type" — TextType typewriter
  return (
    <TextType
      text={phrases}
      accentColor={accentColor}
      accentFontFamily={accentFont}
      className={className}
      pauseDuration={displayDuration}
      typingSpeed={speed}
      loop
      showCursor
    />
  );
}
