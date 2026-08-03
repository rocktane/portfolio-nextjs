"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

/** Hauteur, en fenêtres, sur laquelle l'accent du projet se dilue. */
const FADE_DISTANCE = 1.15;

/**
 * Luminance relative d'une couleur `#rrggbb`, au sens WCAG.
 *
 * Elle sert à une seule décision, mais une décision qu'aucune règle CSS ne
 * peut prendre : le texte posé sur un aplat d'accent doit-il être clair ou
 * sombre ? Les projets vont du violet profond (#6341AD) au cyan vif
 * (#22B8CF) ; une couleur fixe est illisible sur l'un ou sur l'autre.
 */
function luminance(hex: string): number {
  const clean = hex.trim().replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (full.length < 6) return 0;

  const channel = (offset: number) => {
    const v = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** Au-dessus de ce seuil, l'aplat est clair et réclame un texte sombre. */
const TONE_THRESHOLD = 0.3;

interface AccentContextValue {
  /** Appelé par le carrousel : la page entière prend cette couleur. */
  setAccent: (hex: string) => void;
}

const AccentContext = createContext<AccentContextValue | null>(null);

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent doit être utilisé dans AccentProvider");
  return ctx;
}

/**
 * Le pilote du système de couleur.
 *
 * Il n'expose aucune couleur à React : tout passe par deux propriétés
 * personnalisées posées sur <html> — `--accent-src`, écrite par le carrousel,
 * et `--fade`, écrite par le défilement. Le CSS en déduit seul l'accent
 * courant, la teinte du fond et la couleur du menu. C'est ce qui permet à la
 * page de changer de couleur soixante fois par seconde sans un seul rendu.
 */
export default function AccentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * L'accent courant et l'avancement du fondu, tenus hors de React : ils
   * changent à chaque image d'animation et ne doivent déclencher aucun rendu.
   */
  const accent = useRef("#f5a623");
  const fade = useRef(0);
  const tone = useRef<"light" | "dark" | null>(null);

  /**
   * Décide si les aplats d'accent portent du texte clair ou sombre.
   *
   * On juge la couleur réellement affichée, pas celle du projet : plus bas
   * dans la page, l'accent a glissé vers la couleur maison, qui peut être
   * claire là où le projet était sombre. Sans ce recalcul, le bouton du bas
   * de page se retrouverait en blanc sur ocre.
   */
  const syncTone = useCallback(() => {
    const root = document.documentElement;
    const house = getComputedStyle(root).getPropertyValue("--house");
    // Interpoler les deux luminances n'est pas exactement la luminance du
    // mélange, mais l'écart ne déplace jamais la décision : on ne cherche
    // qu'un côté du seuil.
    const value =
      luminance(accent.current) * (1 - fade.current) +
      luminance(house || "#808080") * fade.current;
    const next = value > TONE_THRESHOLD ? "light" : "dark";
    if (tone.current === next) return;
    tone.current = next;
    root.dataset.accentTone = next;
  }, []);

  /**
   * La couleur du projet affiché. Écrite directement dans le style de <html> :
   * la transition déclarée en CSS s'en occupe, React n'a rien à en savoir.
   */
  const setAccent = useCallback(
    (hex: string) => {
      if (accent.current === hex) return;
      accent.current = hex;
      document.documentElement.style.setProperty("--accent-src", hex);
      syncTone();
    },
    [syncTone],
  );

  /**
   * Le fondu vers le neutre. Zéro en haut, un une fois le hero passé.
   *
   * La valeur est arrondie au centième : en dessous, on réécrirait une
   * propriété personnalisée à chaque pixel pour un résultat identique à
   * l'œil, et chaque écriture force un recalcul de style sur toute la page.
   */
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let last = -1;

    const apply = () => {
      frame = 0;
      const span = window.innerHeight * FADE_DISTANCE;
      const value = Math.min(1, Math.max(0, window.scrollY / span));
      const rounded = Math.round(value * 100) / 100;
      if (rounded === last) return;
      last = rounded;
      fade.current = rounded;
      root.style.setProperty("--fade", String(rounded));
      syncTone();
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [syncTone]);

  const value = useMemo<AccentContextValue>(() => ({ setAccent }), [setAccent]);

  return (
    <AccentContext.Provider value={value}>{children}</AccentContext.Provider>
  );
}
