"use client";

import { useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import { useFloatingDrag, type FloatPosition } from "@/lib/use-floating-drag";

// Fixed to the viewport: keep the rotated tile and its levitation inside it.
function constrain(position: FloatPosition): FloatPosition {
  const margin = 20;
  const width = document.documentElement.clientWidth;
  const height = window.innerHeight;
  return {
    ...position,
    x: Math.max(margin, Math.min(position.x, width - position.size - margin)),
    y: Math.max(margin, Math.min(position.y, height - position.size - margin)),
  };
}

// Same gestures as the home logos: drag with inertia, arrow keys, Escape cancels.
// The position resets on reload; until moved, the tile stays in its CSS corner.
export default function CvQrDrag({ children }: { children: ReactNode }) {
  const { link, position, held, place, read, cancel, handlers } =
    useFloatingDrag(constrain, "client");

  useLayoutEffect(() => {
    function measure() {
      cancel();
      const previous = read();
      if (previous?.moved) return place(constrain(previous));
      const rect = link.current?.getBoundingClientRect();
      // Hidden on small and touch screens.
      if (!rect?.width) return;
      place({ x: rect.left, y: rect.top, size: rect.width, moved: false });
    }
    function escape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") cancel();
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", escape);
    return () => {
      cancel();
      window.removeEventListener("resize", measure);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", escape);
    };
  }, [cancel, place, read, link]);

  const style: CSSProperties | undefined = position?.moved
    ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
    : undefined;

  return (
    <>
      <span
        className={`cv-qr-note${position?.moved ? " is-dismissed" : ""}`}
        aria-hidden="true"
      >
        <span>Mon CV</span>
        <svg viewBox="0 0 204 120" fill="none" focusable="false">
          <path
            vectorEffect="non-scaling-stroke"
            d="M8 18 C42 2 121 5 139 27 C154 47 129 57 112 47 C94 36 116 25 132 37 C148 50 136 70 119 83"
          />
          <path vectorEffect="non-scaling-stroke" d="m118 65 1 18 18-2" />
        </svg>
      </span>
      <a
        ref={link}
        className={`cv-qr${held ? " is-held" : ""}`}
        href="/CV.pdf"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get his CV! Ouvrir le CV de Yohan (PDF, nouvel onglet)"
        aria-describedby="cv-qr-help"
        title="Get his CV!"
        style={style}
        {...handlers}
      >
        <span id="cv-qr-help" className="sr-only">
          Déplacez le QR code avec la souris ou les flèches du clavier. Échap
          annule le déplacement en cours.
        </span>
        {children}
      </a>
    </>
  );
}
