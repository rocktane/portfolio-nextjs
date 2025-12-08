"use client";

import { useEffect, useRef, useCallback } from "react";

export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isFirstTransform = useRef(true);

  const handleMouseEnter = useCallback(() => {
    setTimeout(() => {
      isFirstTransform.current = false;
    }, 500);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const centerX = target.offsetWidth / 2;
    const centerY = target.offsetHeight / 2;
    const mouseX = event.clientX - centerX - rect.left;
    const mouseY = event.clientY - centerY - rect.top;

    const sizeFactorY = (1 / target.offsetHeight) * 1000;
    const sizeFactorX = (1 / target.offsetWidth) * 1000;
    const rotateX = (mouseY * sizeFactorY * -0.025).toFixed(2);
    const rotateY = (mouseX * sizeFactorX * 0.025).toFixed(2);

    const transitionDuration = isFirstTransform.current ? "0.5s" : "0s";
    target.style.zIndex = "3";
    target.style.transitionDuration = transitionDuration;
    target.style.transform = `translate(0%, 0%) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);

  const handleMouseLeave = useCallback((event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;

    target.style.zIndex = "3";
    target.style.transitionDuration = "1s";
    target.style.transform = "translate(0%, 0%) rotate3d(0, 0, 0, 0deg)";
    isFirstTransform.current = true;
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mousemove", handleMouseMove as EventListener);
    element.addEventListener("mouseleave", handleMouseLeave as EventListener);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mousemove", handleMouseMove as EventListener);
      element.removeEventListener("mouseleave", handleMouseLeave as EventListener);
    };
  }, [handleMouseEnter, handleMouseMove, handleMouseLeave]);

  return ref;
}
