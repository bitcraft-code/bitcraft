"use client";

import { useEffect, useState, type RefObject } from "react";

interface UseAnimationActivityOptions {
  disabled?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useAnimationActivity<T extends HTMLElement>(
  ref: RefObject<T | null>,
  {
    disabled = false,
    rootMargin = "0px",
    threshold = 0,
  }: UseAnimationActivityOptions = {},
) {
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [isInViewport, setIsInViewport] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (disabled || typeof document === "undefined") return;

    const updateVisibility = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, [disabled]);

  useEffect(() => {
    if (disabled || typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting || entry.intersectionRatio > 0);
      },
      { rootMargin, threshold },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [disabled, ref, rootMargin, threshold]);

  const shouldAnimate =
    !disabled && isDocumentVisible && isInViewport && !prefersReducedMotion;

  return {
    shouldAnimate,
    isDocumentVisible,
    isInViewport,
    prefersReducedMotion,
  };
}
