"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Interrupteur du scroll inertiel.
 *
 * Le lissage est un parti pris, pas une fonctionnalité : on veut pouvoir
 * comparer les deux rendus sans démonter la navigation. Tout le reste du site
 * (ancres, verrouillage pendant la modale) fonctionne à l'identique dans les
 * deux modes — seule l'inertie de la molette change.
 */
export const SMOOTH_ENABLED = false;

/**
 * Instance partagée : la navigation et la modale ont besoin de piloter le
 * scroll (ancres, verrouillage), pas seulement de le lisser.
 */
let lenis: Lenis | null = null;

/** Décalage sous le pill de navigation, qui flotte au-dessus du contenu. */
const HEADER_OFFSET = 80;

/**
 * Le défilement animé est du mouvement comme un autre : à qui en a demandé
 * moins, on saute directement à destination. Lu à l'appel et non une fois pour
 * toutes, pour suivre un changement de réglage système en cours de visite.
 */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const instant = scrollBehavior() === "auto";
  if (lenis) {
    lenis.scrollTo(target, { offset: -HEADER_OFFSET, immediate: instant });
    return;
  }
  // Sans Lenis, `scrollIntoView` ignorerait le pill : on calcule la cible.
  const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior() });
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export default function SmoothScroll() {
  useEffect(() => {
    if (!SMOOTH_ENABLED) return;
    // Le scroll inertiel est un confort, pas une fonctionnalité : on le coupe
    // pour qui a demandé moins de mouvement.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    lenis = new Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.6 });

    let frame = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
