"use client";

import {
  ElementType,
  useEffect,
  useRef,
  useState,
  createElement,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { gsap } from "gsap";

// ─── Markup parser ────────────────────────────────────────────────────────────
// Supported:
//   **text**                        → bold
//   __text__                        → underline
//   [[text]]                        → accentColor
//   [[text|#hex]]                   → specific color
//   [[text|accent,bold,underline]]  → comma-separated flags (combinable)
// ──────────────────────────────────────────────────────────────────────────────

type Segment = {
  text: string;
  bold?: boolean;
  underline?: boolean;
  color?: string; // hex or "accent"
};

const MARKUP_RE = /\*\*(.+?)\*\*|__(.+?)__|(?:\[\[(.+?)(?:\|([^\]]+))?\]\])/g;

function parseSegments(raw: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  MARKUP_RE.lastIndex = 0;

  while ((match = MARKUP_RE.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: raw.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      segments.push({ text: match[1], bold: true });
    } else if (match[2] !== undefined) {
      segments.push({ text: match[2], underline: true });
    } else if (match[3] !== undefined) {
      const flags = (match[4] ?? "accent").split(",").map((f) => f.trim());
      const seg: Segment = { text: match[3] };
      for (const flag of flags) {
        if (flag === "bold") seg.bold = true;
        else if (flag === "underline") seg.underline = true;
        else seg.color = flag; // "accent" or "#hex"
      }
      segments.push(seg);
    }
    lastIndex = MARKUP_RE.lastIndex;
  }

  if (lastIndex < raw.length) {
    segments.push({ text: raw.slice(lastIndex) });
  }

  return segments;
}

function plainText(segments: Segment[]): string {
  return segments.map((s) => s.text).join("");
}

function renderTyped(
  segments: Segment[],
  charCount: number,
  accentColor: string,
  accentFontFamily?: string,
  accentFontSize?: string
): ReactNode[] {
  let remaining = charCount;
  return segments.map((seg, i) => {
    if (remaining <= 0) return null;
    const visible = seg.text.slice(0, remaining);
    remaining -= seg.text.length;
    if (!visible) return null;

    const style: React.CSSProperties = {};
    if (seg.bold) style.fontWeight = 900;
    if (seg.underline) style.textDecoration = "underline";
    if (seg.color) {
      style.color = seg.color === "accent" ? accentColor : seg.color;
      if (seg.color === "accent" && accentFontFamily) {
        style.fontFamily = accentFontFamily;
        style.fontSize = accentFontSize;
        style.display = "inline-block";
        style.padding = "0 0.1em";
        style.verticalAlign = "baseline";
      }
    }

    return (
      <span key={i} style={style}>
        {visible}
      </span>
    );
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TextTypeProps {
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string | ReactNode;
  cursorBlinkDuration?: number;
  cursorClassName?: string;
  text: string | string[];
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  textColors?: string[];
  accentColor?: string;
  accentFontFamily?: string;
  accentFontSize?: string;
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
}

const TextType = ({
  text,
  as: Component = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  accentColor = "#00ff9f",
  accentFontFamily,
  accentFontSize = "1.25em",
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}: TextTypeProps & React.HTMLAttributes<HTMLElement>) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const rawArray = useMemo(
    () => (Array.isArray(text) ? text : [text]),
    [text]
  );

  // Parse each raw string into segments; derive plain text for typing logic
  const parsedArray = useMemo(() => rawArray.map(parseSegments), [rawArray]);
  const plainArray = useMemo(
    () => parsedArray.map(plainText),
    [parsedArray]
  );

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return undefined;
    return textColors[currentTextIndex % textColors.length];
  };

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 1 });
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible) return;
    let timeout: ReturnType<typeof setTimeout>;

    const processedText = reverseMode
      ? plainArray[currentTextIndex].split("").reverse().join("")
      : plainArray[currentTextIndex];

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false);
          if (currentTextIndex === rawArray.length - 1 && !loop) return;
          if (onSentenceComplete)
            onSentenceComplete(rawArray[currentTextIndex], currentTextIndex);
          setCurrentTextIndex((prev) => (prev + 1) % rawArray.length);
          setCurrentCharIndex(0);
          timeout = setTimeout(() => {}, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < processedText.length) {
          timeout = setTimeout(
            () => {
              setDisplayedText((prev) => prev + processedText[currentCharIndex]);
              setCurrentCharIndex((prev) => prev + 1);
            },
            variableSpeed ? getRandomSpeed() : typingSpeed
          );
        } else if (rawArray.length >= 1) {
          if (!loop && currentTextIndex === rawArray.length - 1) return;
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    rawArray,
    plainArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    onSentenceComplete,
    getRandomSpeed,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < plainArray[currentTextIndex].length || isDeleting);

  const colorOverride = getCurrentTextColor();

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `inline-block whitespace-pre-wrap tracking-tight ${className}`,
      ...(colorOverride ? { style: { color: colorOverride } } : {}),
      ...props,
    },
    renderTyped(parsedArray[currentTextIndex], displayedText.length, accentColor, accentFontFamily, accentFontSize),
    showCursor && (
      <span
        ref={cursorRef}
        className={`ml-1 inline-block opacity-100 ${shouldHideCursor ? "hidden" : ""} ${cursorClassName}`}
      >
        {cursorCharacter}
      </span>
    )
  );
};

export default TextType;
