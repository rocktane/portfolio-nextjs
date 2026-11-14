"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz";
const HOLD_MS = 3000;
const SCRAMBLE_MS = 250;
const SPREAD_MS = 500;
const JITTER_MS = 120;
const SWAP_MS = 50;
const FIRST_DELAY_MS = 1200;

type Props = { words: string[] };

export default function ScrambleWords({ words }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;
    let frame = 0;
    let timer = 0;

    // All positions scramble together, then settle left to right with a
    // little jitter. Surplus letters scramble too and vanish before the end,
    // so every transition lasts about the same time whatever the lengths.
    const scrambleTo = (from: string, to: string) => {
      const length = Math.max(from.length, to.length);
      const settleAt = Array.from(
        { length },
        (_, i) =>
          SCRAMBLE_MS +
          (i / Math.max(length - 1, 1)) * SPREAD_MS +
          Math.random() * JITTER_MS,
      );
      const start = performance.now();
      let lastSwap = 0;
      let noise = "";

      const tick = (now: number) => {
        const elapsed = now - start;
        if (now - lastSwap > SWAP_MS) {
          lastSwap = now;
          noise = Array.from(
            { length },
            () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          ).join("");
        }
        let out = "";
        let done = true;
        for (let i = 0; i < length; i++) {
          if (elapsed >= settleAt[i]) {
            out += to[i] ?? "";
          } else {
            done = false;
            out += to[i] === " " ? " " : noise[i];
          }
        }
        el.textContent = out;
        if (done) {
          timer = window.setTimeout(next, HOLD_MS);
        } else {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
    };

    const next = () => {
      const from = words[index];
      index = (index + 1) % words.length;
      scrambleTo(from, words[index]);
    };

    timer = window.setTimeout(next, FIRST_DELAY_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [words]);

  return (
    <span className="scramble-words">
      <span className="sr-only">{words.join(", ")}</span>
      <span ref={ref} aria-hidden="true">
        {words[0]}
      </span>
    </span>
  );
}
