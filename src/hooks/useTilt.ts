"use client";

import { useEffect, useRef } from "react";
import { TILT_CONFIG } from "@/constants/theme";

/**
 * 3D tilt on pointer move.
 *
 * The transform is driven by a single rAF loop that eases the *displayed*
 * rotation toward the *target* rotation, instead of being snapped to the cursor
 * with a CSS transition. That is what makes the enter and leave feel smooth:
 * entering ramps up from rest, leaving decays back to rest, and there is never
 * a duration swap mid-gesture to produce a visible jolt.
 *
 * The easing is exponential (`1 - e^(-rate * dt)`), so it is frame-rate
 * independent and cannot overshoot.
 */
export function useTilt<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    // Skip on devices without a real pointer.
    // `"ontouchstart" in window` is a false positive on desktop Safari (and any
    // touch-capable laptop), which silently killed the effect there.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // Respect the user's reduced-motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /** Where the card should be, driven by the cursor */
    const target = { rotateX: 0, rotateY: 0, lift: 0 };
    /** Where the card actually is, chasing `target` */
    const current = { rotateX: 0, rotateY: 0, lift: 0 };

    let rafId: number | null = null;
    let lastTime = 0;
    let hovering = false;

    const render = () => {
      const scale = 1 + current.lift * TILT_CONFIG.hoverScale;
      element.style.transform =
        `perspective(${TILT_CONFIG.perspective}px) ` +
        `rotateX(${current.rotateX.toFixed(3)}deg) ` +
        `rotateY(${current.rotateY.toFixed(3)}deg) ` +
        `scale(${scale.toFixed(4)})`;
    };

    const tick = (time: number) => {
      // Clamp dt so a background tab or a dropped frame can't teleport the card
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = time;

      const rate = hovering ? TILT_CONFIG.followSpeed : TILT_CONFIG.releaseSpeed;
      const ease = 1 - Math.exp(-rate * dt);

      current.rotateX += (target.rotateX - current.rotateX) * ease;
      current.rotateY += (target.rotateY - current.rotateY) * ease;
      current.lift += (target.lift - current.lift) * ease;

      render();

      const settled =
        Math.abs(target.rotateX - current.rotateX) < 0.01 &&
        Math.abs(target.rotateY - current.rotateY) < 0.01 &&
        Math.abs(target.lift - current.lift) < 0.001;

      if (!hovering && settled) {
        // Fully back to rest: drop the inline transform so the card returns to
        // its plain CSS state (and stops being a compositing layer for nothing)
        element.style.transform = "";
        element.classList.remove("is-tilting");
        rafId = null;
        lastTime = 0;
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafId !== null) return;
      lastTime = 0;
      rafId = requestAnimationFrame(tick);
    };

    /** Last known cursor position, to restore the tilt after a press */
    let lastPointer: { x: number; y: number } | null = null;
    let pressed = false;

    const aimAt = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      // Normalised cursor position: -1 (left/top) → 1 (right/bottom)
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;

      target.rotateX = -y * TILT_CONFIG.maxRotation;
      target.rotateY = x * TILT_CONFIG.maxRotation;
    };

    const handlePointerEnter = () => {
      hovering = true;
      target.lift = 1;
      element.classList.add("is-tilting");
      startLoop();
    };

    const handlePointerMove = (event: PointerEvent) => {
      lastPointer = { x: event.clientX, y: event.clientY };
      // Pendant un appui la carte reste à plat (cf. handlePointerDown)
      if (!pressed) aimAt(event.clientX, event.clientY);

      if (!hovering) handlePointerEnter();
      else startLoop();
    };

    /**
     * While the pointer is held down the card flattens out.
     *
     * It reads as a press, and more importantly it keeps drag-based children
     * usable: a map being panned inside a card rotated in 3D would map cursor
     * travel to map travel non-linearly, and the pan would drift.
     */
    const handlePointerDown = (event: PointerEvent) => {
      pressed = true;
      lastPointer = { x: event.clientX, y: event.clientY };
      target.rotateX = 0;
      target.rotateY = 0;
      target.lift = 0.35;
      startLoop();
      // The pointer is often released outside the card (a drag that ends
      // elsewhere), so the release has to be caught on the window.
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    };

    const handlePointerUp = () => {
      pressed = false;
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      if (!hovering) return;
      target.lift = 1;
      if (lastPointer) aimAt(lastPointer.x, lastPointer.y);
      startLoop();
    };

    const handlePointerLeave = () => {
      hovering = false;
      lastPointer = null;
      target.rotateX = 0;
      target.rotateY = 0;
      target.lift = 0;
      startLoop();
    };

    element.addEventListener("pointerenter", handlePointerEnter);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointerleave", handlePointerLeave);
    element.addEventListener("pointercancel", handlePointerLeave);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      element.removeEventListener("pointerenter", handlePointerEnter);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointerleave", handlePointerLeave);
      element.removeEventListener("pointercancel", handlePointerLeave);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      element.style.transform = "";
      element.classList.remove("is-tilting");
    };
  }, [enabled]);

  return ref;
}
