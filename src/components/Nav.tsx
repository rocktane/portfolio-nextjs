"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { scrollToId, lockScroll } from "@/components/SmoothScroll";
import { useDialogFocus } from "@/lib/dialog";

const LINKS = [
  { id: "projets", label: "Projets" },
  { id: "labo", label: "Labo" },
  { id: "parcours", label: "Parcours" },
  { id: "contact", label: "Contact" },
] as const;

const SOCIALS = [
  { href: "https://www.linkedin.com/in/yohan-g", label: "LinkedIn" },
  { href: "https://www.github.com/rocktane", label: "GitHub" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Nav() {
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useDialogFocus(menuOpen, panel);

  // Le pill se rétracte quand on descend, se redéploie quand on remonte.
  useEffect(() => {
    let previous = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setCondensed(y > 120 && y > previous);
      previous = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    lockScroll(menuOpen);
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const go = (id: string) => {
    setMenuOpen(false);
    // On laisse la surcouche se refermer avant de rendre la main au scroll.
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[150] flex flex-col items-center gap-2 pt-4">
        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-1 border border-white/12 bg-black/55 p-1.5 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            className="grid h-9 w-9 place-items-center transition-colors hover:bg-white/10"
          >
            <span className="relative block h-[9px] w-[15px]" aria-hidden="true">
              <span className="absolute inset-x-0 top-0 h-px bg-white" />
              <span className="absolute inset-x-0 bottom-0 h-px bg-white" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => scrollToId("top")}
            className="mono px-3 py-2 text-white"
            aria-label="Retour en haut"
          >
            Yohan
          </button>

          {/* En mobile le pill déborderait : les liens passent par le menu.
              Rétractés, ils sont réduits à une largeur nulle mais resteraient
              cliquables et tabulables : on les neutralise explicitement. */}
          <motion.div
            className="hidden items-center overflow-hidden md:flex"
            aria-hidden={condensed}
            animate={{
              width: condensed ? 0 : "auto",
              opacity: condensed ? 0 : 1,
            }}
            style={{ pointerEvents: condensed ? "none" : "auto" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.id)}
                tabIndex={condensed ? -1 : 0}
                className="mono whitespace-nowrap px-3 py-2 text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </button>
            ))}
          </motion.div>

          <span className="w-1.5" aria-hidden="true" />
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
            tabIndex={-1}
            className="fixed inset-0 z-[180] flex flex-col justify-between bg-ink px-[var(--gutter)] py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="mono border border-white/25 px-3 py-2 transition-colors hover:border-amber hover:text-amber"
              >
                Fermer ✕
              </button>
            </div>

            <nav aria-label="Menu" className="flex flex-col">
              {LINKS.map((link, i) => (
                <motion.button
                  key={link.id}
                  type="button"
                  onClick={() => go(link.id)}
                  className="display group py-1 text-left text-[clamp(3rem,13vw,9rem)] text-white/85 transition-colors hover:text-amber"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.06 * i, ease: EASE }}
                >
                  {link.label}
                </motion.button>
              ))}
            </nav>

            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-muted underline-sweep transition-colors hover:text-white"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
