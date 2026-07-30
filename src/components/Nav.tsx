"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { scrollToId } from "@/components/SmoothScroll";

const LINKS = [
  { id: "top", label: "Accueil" },
  { id: "projets", label: "Projets" },
  { id: "labo", label: "Labo" },
  { id: "parcours", label: "Parcours" },
  { id: "contact", label: "Contact" },
] as const;

const SOCIALS = [
  { href: "https://www.linkedin.com/in/yohan-g", label: "LinkedIn", icon: LinkedInIcon },
  { href: "https://www.github.com/rocktane", label: "GitHub", icon: GitHubIcon },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Le menu : un bloc ambre plein, posé en haut de l'écran, qui se déplie sur
 * place.
 *
 * Il ne bascule pas en surcouche plein écran : la page reste visible derrière,
 * et le bloc garde exactement la même largeur ouvert que fermé — seule sa
 * hauteur change. C'est ce qui lui donne son air d'étiquette collée sur
 * l'affiche plutôt que de tiroir de navigation.
 */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // Échap et clic à côté referment. Le focus revient au bouton : sans ça, il
  // resterait sur un élément qui vient de disparaître, donc nulle part.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // On laisse le panneau se refermer avant de rendre la main au scroll.
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[150] flex justify-center px-[var(--gutter)] pt-4">
      <div ref={root} className="pointer-events-auto w-[min(88vw,23rem)]">
        <div className="bg-amber text-ink">
          {/* La barre ne bouge pas d'un pixel entre les deux états : seul le
              pictogramme du bouton change. */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <button
              ref={toggle}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="nav-panel"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="grid h-6 w-6 shrink-0 place-items-center"
            >
              <span className="relative block h-[11px] w-[15px]" aria-hidden="true">
                <motion.span
                  className="absolute left-0 top-0 block h-[1.5px] w-full origin-center bg-ink"
                  animate={open ? { y: 5, rotate: 45 } : { y: 0, rotate: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 block h-[1.5px] w-full origin-center bg-ink"
                  animate={open ? { y: -5, rotate: -45 } : { y: 0, rotate: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                />
              </span>
            </button>

            <button
              type="button"
              onClick={() => go("top")}
              className="display whitespace-nowrap text-[1.05rem] leading-none"
              aria-label="Retour en haut"
            >
              Yohan Gouiran
            </button>

            <div className="ml-auto flex items-center gap-3">
              {SOCIALS.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="transition-opacity duration-[120ms] ease-out hover:opacity-55"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Le panneau : c'est la hauteur du bloc qui s'anime, le contenu est
              masqué pendant le trajet — le bloc grandit, une liste ne tombe
              pas devant la page. */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.nav
                id="nav-panel"
                aria-label="Navigation principale"
                className="overflow-hidden"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <ul className="px-3">
                  {LINKS.map((link, i) => (
                    <motion.li
                      key={link.id}
                      className="border-t border-ink/20"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.06 + i * 0.04, ease: EASE }}
                    >
                      {/* Au repos, les libellés sont alignés à gauche, sans
                          marqueur. Au survol la flèche entre par la gauche et
                          pousse le mot d'autant — 120 ms, pour que ça réponde
                          au doigt. */}
                      <button
                        type="button"
                        onClick={() => go(link.id)}
                        className="group relative block w-full py-2.5 text-left text-[1.35rem] font-semibold leading-tight"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 opacity-0 transition-all duration-[120ms] ease-out group-hover:translate-x-0 group-hover:opacity-100"
                        >
                          →
                        </span>
                        <span className="block transition-transform duration-[120ms] ease-out group-hover:translate-x-[1.3em]">
                          {link.label}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        {/* Le bandeau d'appel, sous la barre. Il appartient à l'état fermé :
            ouvert, le menu doit être la seule chose à lire. */}
        <AnimatePresence initial={false}>
          {!open && (
            <motion.button
              type="button"
              onClick={() => go("contact")}
              className="mono group flex w-full items-center justify-between overflow-hidden bg-ink px-3 text-white transition-colors duration-[120ms] ease-out hover:text-amber"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <span className="py-3">Me contacter</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-[120ms] ease-out group-hover:translate-x-1"
              >
                →
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.75 9.5h4.46V21H2.75V9.5Zm7.06 0h4.28v1.57h.06c.6-1.07 2.06-2.2 4.24-2.2 4.53 0 5.36 2.75 5.36 6.33V21h-4.46v-5.36c0-1.28-.02-2.93-1.9-2.93-1.9 0-2.19 1.4-2.19 2.84V21H9.81V9.5Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}
