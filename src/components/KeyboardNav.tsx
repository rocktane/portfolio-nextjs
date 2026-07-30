"use client";

import { useEffect, useRef } from "react";
import { scrollToId } from "@/components/SmoothScroll";

/** Les sections de la page, dans l'ordre où on les traverse. */
export const SECTION_IDS = [
  "top",
  "projets",
  "labo",
  "parcours",
  "archives",
  "contact",
] as const;

/** Marge sous le pill de navigation, alignée sur celle de `scrollToId`. */
const HEADER_OFFSET = 80;

/** Un champ de saisie a toujours la priorité sur un raccourci global. */
export function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el?.tagName) return false;
  return (
    el.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)
  );
}

/**
 * Position de lecture actuelle : la dernière section dont le haut est déjà
 * passé sous le pill. La tolérance absorbe l'arrondi du scroll lissé, qui
 * s'arrête parfois à un pixel près de la cible.
 */
function currentSection() {
  const line = window.scrollY + HEADER_OFFSET + 8;
  let index = 0;
  SECTION_IDS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top + window.scrollY <= line) index = i;
  });
  return index;
}

/**
 * Les flèches haut et bas font défiler la page section par section, comme un
 * diaporama. On ne détourne le clavier que si le déplacement est possible :
 * sinon, on rend la main au navigateur plutôt que de bloquer le scroll.
 */
export default function KeyboardNav() {
  /**
   * Section visée par le dernier appui. Un défilement lissé dure plus
   * longtemps qu'un appui : lu en cours de route, `currentSection()` renvoie
   * encore la section de départ, et la deuxième flèche redemandait la même
   * destination. On enchaîne donc depuis la cible, pas depuis la position.
   */
  const aim = useRef<number | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;
      // Menu ou fiche projet ouverts : le scroll de la page est gelé.
      if (document.documentElement.style.overflow === "hidden") return;

      const from = aim.current ?? currentSection();
      const target = from + (e.key === "ArrowDown" ? 1 : -1);
      if (target < 0 || target >= SECTION_IDS.length) return;
      if (!document.getElementById(SECTION_IDS[target])) return;

      e.preventDefault();
      scrollToId(SECTION_IDS[target]);

      // Passé ce délai, le défilement est arrivé — ou l'utilisateur a repris
      // la main à la molette, et la position fait de nouveau autorité.
      aim.current = target;
      clearTimeout(settle.current);
      settle.current = setTimeout(() => {
        aim.current = null;
      }, 900);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(settle.current);
    };
  }, []);

  return null;
}
