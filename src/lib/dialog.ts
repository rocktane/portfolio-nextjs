import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableIn(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * Confine le clavier dans une surcouche, et rend le focus en sortant.
 *
 * `aria-modal` ne renseigne que les technologies d'assistance : sans ce
 * traitement, la tabulation continuait de parcourir la page derrière la
 * surcouche, où plus rien n'est visible. On mémorise aussi l'élément qui avait
 * le focus à l'ouverture — le perdre renverrait l'utilisateur en haut du
 * document à chaque fermeture.
 */
export function useDialogFocus(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const panel = ref.current;
    if (!panel) return;

    const restoreTo = document.activeElement as HTMLElement | null;
    // Le panneau lui-même n'est pas tabulable : on l'ouvre au premier
    // contrôle, plutôt que de laisser le focus derrière, dans la page figée.
    (focusableIn(panel)[0] ?? panel).focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusableIn(panel);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreTo?.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
