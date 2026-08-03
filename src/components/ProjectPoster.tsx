import { memo } from "react";
import type { CSSProperties } from "react";
import type { PosterPattern, Project } from "@/types";

type Variant = "hero" | "card" | "portrait";

/**
 * Les trames de fond, une par projet.
 *
 * Le carrousel enchaîne plusieurs plans sur le même cadrage : sans trame
 * propre, seule la couleur changerait et les projets se confondraient. `size`
 * est la maille de base, doublée sur le plan large du hero ; les trames à
 * répétition intrinsèque (diagonales, anneaux, lignes) portent déjà la leur.
 *
 * Le trait est tracé dans la couleur du texte de la variante : blanc sur les
 * designs sombres, encre sur le papier. En blanc en dur, la trame disparaissait
 * des variantes claires.
 */
const PATTERNS: Record<PosterPattern, { image: string; size: number }> = {
  grid: {
    image:
      "linear-gradient(to right, var(--c-fg) 1px, transparent 1px), linear-gradient(to bottom, var(--c-fg) 1px, transparent 1px)",
    size: 48,
  },
  dots: {
    image: "radial-gradient(var(--c-fg) 1.5px, transparent 1.6px)",
    size: 26,
  },
  diagonals: {
    image:
      "repeating-linear-gradient(45deg, var(--c-fg) 0 1px, transparent 1px 14px)",
    size: 0,
  },
  rings: {
    image:
      "repeating-radial-gradient(circle at 50% 45%, transparent 0 34px, var(--c-fg) 34px 35px)",
    size: 0,
  },
  scanlines: {
    image:
      "repeating-linear-gradient(to bottom, var(--c-fg) 0 1px, transparent 1px 8px)",
    size: 0,
  },
};

/**
 * Le fond coloré d'un projet.
 *
 * La couleur signature est celle qui domine la capture d'écran du projet : le
 * fond et le visuel s'accordent donc naturellement.
 *
 * Le composant ne décide de rien d'autre que cette couleur, qu'il passe en
 * `--a`. Les quatre couches — teinte, halos, trame, voile — sont décrites dans
 * globals.css, où chaque variante peut en éteindre certaines : les designs
 * plats coupent les halos et le voile pour ne garder qu'un aplat, ceux sans
 * trame coupent la trame. Une seule structure, six rendus.
 */
function ProjectPoster({
  project,
  variant,
}: {
  project: Project;
  variant: Variant;
}) {
  const isHero = variant === "hero";
  const pattern = PATTERNS[project.pattern ?? "grid"];
  const size = pattern.size * (isHero ? 2 : 1);

  return (
    <div
      className="poster"
      data-variant={variant}
      aria-hidden="true"
      style={
        {
          "--a": project.accent,
          "--pat": pattern.image,
          ...(size ? { "--pat-size": `${size}px ${size}px` } : {}),
        } as CSSProperties
      }
    >
      <div className="poster-tint" />
      <div className="poster-glow" />
      <div className="poster-pattern" />
      <div className="poster-veil" />
    </div>
  );
}

export default memo(ProjectPoster);
