"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { useDialogFocus } from "@/lib/dialog";
import ProjectPoster from "@/components/ProjectPoster";
import ProjectStill from "@/components/ProjectStill";
import { useProjects } from "@/components/ProjectsProvider";
import { projects, STATUS_LABEL } from "@/data/projects";
import type { LinkKind, Project } from "@/types";

const CTA_LABEL: Record<LinkKind, string> = {
  site: "Voir le site",
  code: "Voir le code",
  brew: "Installer",
};

/** Le « type » de la carte, la ligne qui dit à quelle famille elle appartient. */
const SECTION_LABEL: Record<Project["section"], string> = {
  projets: "Projet",
  labo: "Labo",
  archives: "Archive",
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * La fiche projet, en carte à jouer.
 *
 * Le format 5:7 des cartes à collectionner impose son ordre de lecture : nom en
 * haut, illustration, ligne de type, encadré de texte, puis le coin de bas de
 * carte. Chaque projet devient une carte d'une même série — la couleur
 * signature tient lieu de couleur de bordure, la trame de fond de symbole
 * d'extension, et le numéro en bas de la ligne de copyright.
 *
 * Tout est dimensionné en `cqw`, donc en pourcentage de la largeur de la carte :
 * la carte se redimensionne d'un bloc, sans jamais réorganiser son contenu ni
 * demander à faire défiler quoi que ce soit.
 */
export default function ProjectModal() {
  const { active, close, next } = useProjects();
  const panel = useRef<HTMLDivElement>(null);

  useDialogFocus(active !== null, panel);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-black/85 px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
        >
          <Card key={active.id} project={active} panelRef={panel} />

          {/* Les commandes vivent hors de la carte : rien ne vient se poser
              sur l'objet lui-même. */}
          <div
            className="flex items-center gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="mono text-white/70 underline-sweep transition-colors hover:text-white"
            >
              ✕ Fermer
            </button>
            <button
              type="button"
              onClick={next}
              className="mono text-white/70 underline-sweep transition-colors hover:text-white"
            >
              Carte suivante →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Card({
  project,
  panelRef,
}: {
  project: Project;
  panelRef: React.RefObject<HTMLDivElement | null>;
}) {
  const reduced = useReducedMotion();
  const { accent, status, title, tagline, summary, role, year, stack, href, hrefKind, hrefLabel } =
    project;

  const index = projects.findIndex((p) => p.id === project.id);

  // Le basculement suit le pointeur, amorti : c'est ce qui fait qu'on la
  // manipule au lieu de la lire. Ressorts très souples, amplitude faible —
  // au-delà, la carte devient une animation et le texte se déforme.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-7, 7]), {
    stiffness: 140,
    damping: 18,
  });
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), {
    stiffness: 140,
    damping: 18,
  });

  // Le reflet suit le pointeur sans amortissement : c'est un éclat sur le
  // vernis, il ne traîne pas derrière la carte.
  const sheen = useTransform(
    [px, py],
    ([x, y]: number[]) =>
      `radial-gradient(38% 30% at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.5), transparent 70%)`,
  );

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  const resetTilt = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label={`Fiche du projet ${title}`}
      onClick={(e) => e.stopPropagation()}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      // La largeur est déduite de la hauteur disponible : la carte garde son
      // format, c'est l'écran qui décide de sa taille.
      className="@container relative aspect-[5/7] w-[min(90vw,calc((100svh-8rem)*0.714))] shrink-0"
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <motion.div
        className="relative h-full w-full rounded-[3.4cqw] p-[2.2cqw]"
        style={{
          rotateX: reduced ? 0 : rotateX,
          rotateY: reduced ? 0 : rotateY,
          transformStyle: "preserve-3d",
          // La tranche de la carte : un dégradé de la couleur du projet, plus
          // clair en haut à gauche, comme un carton qui prend la lumière.
          background: `linear-gradient(150deg, ${accent} 0%, ${accent}77 38%, #05050a 100%)`,
          boxShadow: `0 40px 90px -30px ${accent}88, 0 2px 0 rgba(255,255,255,0.14) inset`,
        }}
      >
        <div className="flex h-full flex-col gap-[1.5cqw] rounded-[2cqw] bg-[#08080c] p-[2.2cqw]">
          {/* Cartouche de nom : le titre, et le statut en guise de coût. */}
          <div className="flex items-center justify-between gap-[2cqw] rounded-[1cqw] border border-white/10 bg-white/[0.05] px-[2.4cqw] py-[1.6cqw]">
            <h2 className="display truncate text-[6.4cqw] leading-none">{title}</h2>
            <span
              className="label shrink-0 text-[1.9cqw]"
              style={{ color: accent, borderColor: accent }}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>

          {/* Illustration. Elle absorbe toute la hauteur restante : c'est elle
              qui s'ajuste, jamais le texte. */}
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1cqw] border border-white/10">
            <ProjectPoster project={project} variant="card" />
            <ProjectStill
              project={project}
              showStack={false}
              className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          {/* Ligne de type. */}
          <div className="flex items-center justify-between gap-[2cqw] rounded-[1cqw] border border-white/10 bg-white/[0.05] px-[2.4cqw] py-[1.4cqw]">
            {/* Pas de troncature : un rôle un peu long passe à la ligne, il ne
                se fait pas couper au milieu d'un mot. */}
            <p className="mono text-[2.1cqw] leading-[1.4]">
              {SECTION_LABEL[project.section]} — {role}
            </p>
            <span
              className="mono shrink-0 text-[2.1cqw] leading-none"
              style={{ color: accent }}
            >
              {year}
            </span>
          </div>

          {/* Encadré de texte : capacité, puis description, puis texte
              d'ambiance en italique, comme sur une vraie carte. */}
          <div className="flex flex-col gap-[1.6cqw] rounded-[1cqw] border border-white/10 bg-white/[0.03] px-[2.4cqw] py-[2cqw]">
            <p className="mono text-[2.1cqw] leading-[1.5] text-white/75">
              <span style={{ color: accent }}>◆ </span>
              {stack.join(" · ")}
            </p>

            <div className="h-px w-full bg-white/10" />

            <p className="text-[2.5cqw] leading-[1.5] text-white/70">{summary}</p>

            <p
              className="border-l-[0.4cqw] pl-[2cqw] text-[2.4cqw] italic leading-[1.45] text-white/45"
              style={{ borderColor: `${accent}66` }}
            >
              {tagline}
            </p>
          </div>

          {/* Bas de carte : l'appel à l'action, et le numéro de la série. */}
          <div className="flex items-center justify-between gap-[2cqw]">
            {href && status !== "sunset" ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mono rounded-[0.8cqw] px-[3cqw] py-[1.8cqw] text-[2.1cqw] leading-none text-ink transition-opacity hover:opacity-85"
                style={{ backgroundColor: accent }}
              >
                {CTA_LABEL[hrefKind ?? "site"]} →
              </a>
            ) : (
              <span className="mono text-[2.1cqw] leading-none text-white/40">
                {hrefLabel ?? "Hors ligne"}
              </span>
            )}

            <span className="mono shrink-0 text-[1.9cqw] leading-none text-white/35">
              Yohan Gouiran · {String(index + 1).padStart(2, "0")}/
              {String(projects.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Reflet : un voile clair qui balaie la carte au gré du pointeur.
            Purement décoratif, et absent si l'on demande moins de mouvement. */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[3.4cqw] mix-blend-overlay"
            style={{ background: sheen }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
