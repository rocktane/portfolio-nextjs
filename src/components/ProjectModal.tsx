"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { useDialogFocus } from "@/lib/dialog";
import ProjectPoster from "@/components/ProjectPoster";
import ProjectStill from "@/components/ProjectStill";
import { useProjects } from "@/components/ProjectsProvider";
import { isOpenSource, projects, STATUS_LABEL } from "@/data/projects";
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

/** Écart entre deux cartes, en pourcentage de la largeur d'une carte. */
const STEP = 68;

/**
 * La fiche projet : une carte à jouer, prise dans une main de trois.
 *
 * Le format 5:7 des cartes à collectionner impose son ordre de lecture — nom en
 * haut, illustration, ligne de type, encadré de texte, puis le coin de bas de
 * carte. Chaque projet est une carte de la même série : sa couleur signature
 * tient lieu de couleur de bordure, sa trame de symbole d'extension, et le
 * numéro en bas de ligne de copyright.
 *
 * La précédente et la suivante dépassent de chaque côté. Elles grandissent à
 * mesure que le pointeur va vers elles — c'est ce qui dit qu'on peut les
 * prendre — et un clic fait glisser les trois d'un cran : la carte choisie
 * vient au centre, une nouvelle entre par le bord.
 */
export default function ProjectModal() {
  const { active, close, open } = useProjects();
  const panel = useRef<HTMLDivElement>(null);

  useDialogFocus(active !== null, panel);

  // Position horizontale du pointeur dans la main, ramenée à [0, 1]. C'est la
  // seule chose que les cartes latérales ont besoin de savoir.
  const pointer = useMotionValue(0.5);

  const index = active ? projects.findIndex((p) => p.id === active.id) : -1;
  const at = useCallback(
    (n: number) => projects[((n % projects.length) + projects.length) % projects.length],
    [],
  );

  // Les flèches font défiler la main, comme sur le carrousel d'ouverture.
  useEffect(() => {
    if (index < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      open(at(index + (e.key === "ArrowRight" ? 1 : -1)).id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, at, open]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-[rgb(var(--c-veil)/0.9)] px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
        >
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            aria-label={`Fiche du projet ${active.title}`}
            className="relative flex w-full flex-1 items-center justify-center"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              pointer.set((e.clientX - r.left) / r.width);
            }}
            // Le pointeur parti, la main se referme : sans ce retour au
            // centre, les cartes de côté restaient levées derrière lui.
            onPointerLeave={() => pointer.set(0.5)}
          >
            <AnimatePresence initial={false}>
              {[-1, 0, 1].map((slot) => {
                const project = at(index + slot);
                return (
                  <Card
                    key={project.id}
                    project={project}
                    slot={slot}
                    pointer={pointer}
                    onSelect={() => open(project.id)}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          {/* Les commandes vivent hors de la carte : rien ne vient se poser
              sur l'objet lui-même. */}
          <div
            className="flex shrink-0 items-center gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="link mono text-fg/70 transition-colors hover:text-fg"
            >
              ✕ Fermer
            </button>
            <span className="mono text-muted">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(projects.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => open(at(index + 1).id)}
              className="link mono text-fg/70 transition-colors hover:text-fg"
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
  slot,
  pointer,
  onSelect,
}: {
  project: Project;
  slot: number;
  pointer: MotionValue<number>;
  onSelect: () => void;
}) {
  const reduced = useReducedMotion();
  const center = slot === 0;

  /**
   * Proximité du pointeur, de 0 (il est de l'autre côté) à 1 (il est arrivé
   * sur la carte). Le survol la force à 1 : au repos les cartes attendent en
   * bas, à demi effacées ; le geste vers elles les fait remonter, et une fois
   * le curseur dessus la carte est franchement là — pleine opacité.
   */
  const hovered = useMotionValue(0);
  const proximity = useTransform(pointer, (x) => {
    if (center) return 0;
    const d = slot < 0 ? (0.5 - x) / 0.42 : (x - 0.5) / 0.42;
    return Math.min(Math.max(d, 0), 1);
  });
  // On amortit l'approche, puis on en déduit tout le reste : une seule valeur
  // ressort, donc une montée, un grossissement et un voile parfaitement
  // synchrones.
  const near = useSpring(
    useTransform([proximity, hovered], ([p, h]: number[]) => Math.max(p, h)),
    { stiffness: 220, damping: 28 },
  );
  // Elle remonte de dix pour cent de sa hauteur, pas plus : c'est un
  // mouvement de main, pas un décollage.
  const sideY = useTransform(near, (v) => `${13 - v * 10}%`);
  const sideScale = useTransform(near, (v) => 0.72 + v * 0.06);
  const sideOpacity = useTransform(near, (v) => 0.4 + v * 0.6);

  // Le basculement suit le pointeur, amorti : c'est ce qui fait qu'on la
  // manipule au lieu de la lire. Ressorts souples, amplitude faible — au-delà,
  // la carte devient une animation et le texte se déforme.
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
    if (reduced || !center) return;
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
      onClick={(e) => e.stopPropagation()}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      // La largeur est déduite de la hauteur disponible : la carte garde son
      // format, c'est l'écran qui décide de sa taille.
      className="@container absolute aspect-[5/7] w-[min(80vw,calc((100svh-10rem)*0.714))]"
      style={{ perspective: 1200, zIndex: center ? 20 : 10 }}
      initial={{ opacity: 0, x: `${slot * (STEP + 26)}%`, rotate: slot * 6 }}
      animate={{ opacity: 1, x: `${slot * STEP}%`, rotate: slot * 4 }}
      exit={{ opacity: 0, x: `${slot * (STEP + 26)}%`, rotate: slot * 6 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      {/* Sans mouvement demandé, les cartes de côté gardent une position et
          une taille fixes : la montée au pointeur disparaît, pas la mise en
          scène — à l'échelle 1 elles recouvriraient la carte centrale. */}
      <motion.div
        className="h-full w-full origin-center"
        style={{
          y: center ? 0 : reduced ? "13%" : sideY,
          scale: center ? 1 : reduced ? 0.74 : sideScale,
          opacity: center ? 1 : reduced ? 0.6 : sideOpacity,
        }}
      >
        <motion.div
          // La tranche de la carte. Son traitement — dégradé de lumière ou
          // aplat franc — vit dans `.card-edge`, que les variantes plates
          // remplacent par une bordure d'une seule couleur.
          className="card-edge relative h-full w-full rounded-[3.4cqw] p-[2.2cqw]"
          style={{
            rotateX: reduced || !center ? 0 : rotateX,
            rotateY: reduced || !center ? 0 : rotateY,
            transformStyle: "preserve-3d",
            "--a": project.accent,
          } as CSSProperties}
        >
          <CardFace project={project} muted={!center} />

          {/* Reflet : un voile clair qui balaie la carte au gré du pointeur.
              Purement décoratif, et absent si l'on demande moins de mouvement. */}
          {center && !reduced && (
            <motion.div
              aria-hidden="true"
              className="card-sheen pointer-events-none absolute inset-0 rounded-[3.4cqw] mix-blend-overlay"
              style={{ background: sheen }}
            />
          )}

          {/* Les cartes de côté sont des boutons pleine surface : on prend la
              carte, pas un petit lien posé dessus. Le contenu passe alors sous
              silence — le libellé du bouton dit déjà de quoi il s'agit. */}
          {!center && (
            <button
              type="button"
              onClick={onSelect}
              onPointerEnter={() => hovered.set(1)}
              onPointerLeave={() => hovered.set(0)}
              onFocus={() => hovered.set(1)}
              onBlur={() => hovered.set(0)}
              aria-label={`Voir la fiche du projet ${project.title}`}
              className="cursor-enter absolute inset-0 rounded-[3.4cqw]"
            />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** La face de la carte. `muted` neutralise tout ce qui serait cliquable. */
function CardFace({ project, muted }: { project: Project; muted: boolean }) {
  const { accent, status, title, tagline, summary, role, year, stack, href, hrefKind, hrefLabel } =
    project;
  const index = projects.findIndex((p) => p.id === project.id);
  const cta = `${CTA_LABEL[hrefKind ?? "site"]} →`;
  const live = href && status !== "sunset";

  return (
    <div
      className="flex h-full flex-col gap-[1.5cqw] rounded-[2cqw] bg-shell p-[2.2cqw]"
      aria-hidden={muted}
      // Sous une carte de côté, plus rien n'est tabulable : c'est le bouton
      // qui la recouvre qui porte l'interaction.
      inert={muted ? true : undefined}
    >
      {/* Cartouche de nom : le titre, et le statut en guise de coût. */}
      <div className="flex items-center justify-between gap-[2cqw] rounded-[1cqw] bg-fg/[0.06] px-[2.4cqw] py-[1.6cqw]">
        <h2 className="display truncate text-[6.4cqw] leading-none">{title}</h2>
        <span className="flex shrink-0 items-center gap-[1cqw]">
          {isOpenSource(project) && (
            <span
              className="label text-[1.9cqw]"
              style={{ color: accent, borderColor: accent }}
            >
              OPEN SOURCE
            </span>
          )}
          <span
            className="label text-[1.9cqw]"
            style={{ color: accent, borderColor: accent }}
          >
            {STATUS_LABEL[status]}
          </span>
        </span>
      </div>

      {/* Illustration. Elle absorbe toute la hauteur restante : c'est elle qui
          s'ajuste, jamais le texte. */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1cqw]">
        <ProjectPoster project={project} variant="card" />
        <ProjectStill
          project={project}
          showStack={false}
          className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Ligne de type. */}
      <div className="flex items-center justify-between gap-[2cqw] rounded-[1cqw] bg-fg/[0.06] px-[2.4cqw] py-[1.4cqw]">
        {/* Pas de troncature : un rôle un peu long passe à la ligne, il ne se
            fait pas couper au milieu d'un mot. */}
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

      {/* Encadré de texte : capacité, puis description, puis texte d'ambiance
          en italique, comme sur une vraie carte. */}
      <div className="flex flex-col gap-[1.6cqw] rounded-[1cqw] bg-fg/[0.04] px-[2.4cqw] py-[2cqw]">
        <p className="mono text-[2.1cqw] leading-[1.5] text-fg/80">
          <span style={{ color: accent }}>◆ </span>
          {stack.join(" · ")}
        </p>

        <div className="rule w-full" />

        <p className="text-[2.5cqw] leading-[1.5] text-fg/75">{summary}</p>

        <p
          className="border-l-[0.4cqw] pl-[2cqw] text-[2.4cqw] italic leading-[1.45] text-fg/50"
          style={{ borderColor: `${accent}66` }}
        >
          {tagline}
        </p>
      </div>

      {/* Bas de carte : l'appel à l'action, et le numéro de la série. */}
      <div className="flex items-center justify-between gap-[2cqw]">
        {live ? (
          muted ? (
            <span
              className="mono rounded-[0.8cqw] px-[3cqw] py-[1.8cqw] text-[2.1cqw] leading-none text-on-accent"
              style={{ backgroundColor: accent }}
            >
              {cta}
            </span>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mono rounded-[0.8cqw] px-[3cqw] py-[1.8cqw] text-[2.1cqw] leading-none text-on-accent transition-opacity hover:opacity-85"
              style={{ backgroundColor: accent }}
            >
              {cta}
            </a>
          )
        ) : (
          <span className="mono text-[2.1cqw] leading-none text-fg/45">
            {hrefLabel ?? "Hors ligne"}
          </span>
        )}

        <span className="mono shrink-0 text-[1.9cqw] leading-none text-fg/40">
          Yohan Gouiran · {String(index + 1).padStart(2, "0")}/
          {String(projects.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
