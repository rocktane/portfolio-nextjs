"use client";

import { useEffect, useRef } from "react";
import { TILT_CONFIG } from "@/constants/theme";

export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isFirstTransform = useRef(true);
  const rafId = useRef<number | null>(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip tilt effect on touch devices
    if ("ontouchstart" in window) return;

    const handleMouseEnter = () => {
      timeoutId.current = setTimeout(() => {
        isFirstTransform.current = false;
      }, TILT_CONFIG.initialDelay);
    };

    const handleMouseMove = (event: MouseEvent) => {
      // Cancel any pending animation frame
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      // Throttle with requestAnimationFrame (60fps)
      rafId.current = requestAnimationFrame(() => {
        const target = event.currentTarget as HTMLElement;
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const centerX = target.offsetWidth / 2;
        const centerY = target.offsetHeight / 2;
        const mouseX = event.clientX - centerX - rect.left;
        const mouseY = event.clientY - centerY - rect.top;

        const sizeFactorY = (1 / target.offsetHeight) * TILT_CONFIG.sizeFactor;
        const sizeFactorX = (1 / target.offsetWidth) * TILT_CONFIG.sizeFactor;
        const rotateX = mouseY * sizeFactorY * -TILT_CONFIG.rotationScale;
        const rotateY = mouseX * sizeFactorX * TILT_CONFIG.rotationScale;

        const transitionDuration = isFirstTransform.current
          ? TILT_CONFIG.transitionInitial
          : TILT_CONFIG.transitionDefault;

        target.style.zIndex = "3";
        target.style.transitionDuration = transitionDuration;
        target.style.transform = `translate(0%, 0%) perspective(${TILT_CONFIG.perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });
    };

    const handleMouseLeave = (event: MouseEvent) => {
      // Cancel any pending animation frame
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }

      const target = event.currentTarget as HTMLElement;
      if (!target) return;

      target.style.zIndex = "3";
      target.style.transitionDuration = TILT_CONFIG.transitionLeave;
      target.style.transform = "translate(0%, 0%) rotate3d(0, 0, 0, 0deg)";
      isFirstTransform.current = true;
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mousemove", handleMouseMove as EventListener);
    element.addEventListener("mouseleave", handleMouseLeave as EventListener);

    return () => {
      // Cleanup timeout
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      // Cleanup animation frame
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mousemove", handleMouseMove as EventListener);
      element.removeEventListener("mouseleave", handleMouseLeave as EventListener);
    };
  }, []);

  return ref;
}
