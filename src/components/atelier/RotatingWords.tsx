"use client";

import { Instrument_Serif } from "next/font/google";
import { useEffect, useRef } from "react";

const serif = Instrument_Serif({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  display: "swap",
});

const HOLD_MS = 2600;
const TURN_MS = 700;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

type Props = { words: string[] };

export default function RotatingWords({ words }: Props) {
  const pillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill || words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;
    let timer = 0;
    let current = pill.querySelector<HTMLSpanElement>(".word-pill-face")!;

    const turn = () => {
      // Freeze the current width (fonts are loaded by now) so it can animate.
      pill.style.width = `${pill.getBoundingClientRect().width}px`;
      index = (index + 1) % words.length;
      const next = document.createElement("span");
      next.className = "word-pill-face";
      next.textContent = words[index];
      pill.append(next);

      const padding =
        parseFloat(getComputedStyle(pill).paddingLeft) +
        parseFloat(getComputedStyle(pill).paddingRight);

      // A longer word pushes the current one out to the right, a shorter
      // one pushes it out to the left. Both words stay side by side (a small gap
      // apart) while the pill resizes to fit the new one.
      const gap = parseFloat(getComputedStyle(pill).paddingLeft) * 0.6;
      const fromWidth = current.scrollWidth;
      const toWidth = next.scrollWidth;
      const longer = toWidth >= fromWidth;
      const shift = (longer ? toWidth : -fromWidth) + (longer ? gap : -gap);
      pill.style.width = `${toWidth + padding}px`;
      const options = { duration: TURN_MS, easing: EASE, fill: "forwards" as const };
      current.animate(
        [
          { transform: "translateX(0)" },
          { transform: `translateX(${shift}px)` },
        ],
        options,
      );
      const old = current;
      next
        .animate(
          [
            { transform: `translateX(${-shift}px)` },
            { transform: "translateX(0)" },
          ],
          options,
        )
        .finished.then(() => {
          old.remove();
          timer = window.setTimeout(turn, HOLD_MS);
        })
        .catch(() => {});
      current = next;
    };

    timer = window.setTimeout(turn, HOLD_MS);
    return () => clearTimeout(timer);
  }, [words]);

  return (
    <span className={`word-pill ${serif.className}`}>
      <span className="sr-only">{words.join(", ")}</span>
      <span ref={pillRef} className="word-pill-drum" aria-hidden="true">
        <span className="word-pill-face">{words[0]}</span>
      </span>
    </span>
  );
}
