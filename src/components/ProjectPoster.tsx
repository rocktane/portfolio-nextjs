import { memo } from "react";
import type { PosterPattern, Project } from "@/types";

type Variant = "hero" | "card" | "portrait";

/**
 * Les trames de fond, une par projet.
 *
 * Le carrousel enchaîne quatre plans sur le même cadrage : sans trame propre,
 * seule la couleur changerait et les projets se confondraient. `size` est la
 * maille de base, doublée sur le plan large du hero.
 */
const PATTERNS: Record<PosterPattern, { image: string; size: number }> = {
  grid: {
    image:
      "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
    size: 48,
  },
  dots: {
    image: "radial-gradient(#fff 1.5px, transparent 1.6px)",
    size: 26,
  },
  diagonals: {
    image: "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 14px)",
    size: 0,
  },
  rings: {
    image:
      "repeating-radial-gradient(circle at 50% 45%, transparent 0 34px, #fff 34px 35px)",
    size: 0,
  },
  scanlines: {
    image: "repeating-linear-gradient(to bottom, #fff 0 1px, transparent 1px 8px)",
    size: 0,
  },
};

/**
 * Le fond coloré d'un projet.
 *
 * La couleur signature est celle qui domine la capture d'écran du projet : le
 * fond et le visuel s'accordent donc naturellement. Deux halos larges, une
 * trame propre au projet et un voile de lisibilité — assez de couleur pour que
 * la page ne soit pas un mur noir, assez de contraste pour le texte blanc.
 */
function ProjectPoster({
  project,
  variant,
}: {
  project: Project;
  variant: Variant;
}) {
  const { accent } = project;
  const isHero = variant === "hero";
  const pattern = PATTERNS[project.pattern ?? "grid"];

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#06050a]">
      {/* Nappe de fond : une teinte sourde de la couleur du projet. */}
      <div className="absolute inset-0" style={{ backgroundColor: `${accent}33` }} />

      <div
        className="absolute inset-0"
        style={{
          background: isHero
            ? `radial-gradient(75% 65% at 12% 88%, ${accent}cc 0%, transparent 66%),
               radial-gradient(65% 60% at 92% 6%, ${accent}99 0%, transparent 60%),
               radial-gradient(50% 45% at 62% 45%, ${accent}66 0%, transparent 70%)`
            : `radial-gradient(90% 80% at 78% 12%, ${accent}bb 0%, transparent 68%),
               radial-gradient(70% 70% at 8% 92%, ${accent}88 0%, transparent 62%)`,
        }}
      />

      {/* Trame technique : donne de la matière sans ajouter de bruit. Les
          trames à répétition intrinsèque (diagonales, anneaux, lignes) portent
          déjà leur maille : leur imposer un `background-size` les écraserait. */}
      <div
        className="absolute inset-0 opacity-[0.09]"
        aria-hidden="true"
        style={{
          backgroundImage: pattern.image,
          backgroundSize: pattern.size
            ? `${pattern.size * (isHero ? 2 : 1)}px ${pattern.size * (isHero ? 2 : 1)}px`
            : undefined,
        }}
      />

      {/* Voile de lisibilité, sous le bloc de texte. */}
      <div
        className={
          isHero
            ? "absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
            : "absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
        }
      />
    </div>
  );
}

export default memo(ProjectPoster);
