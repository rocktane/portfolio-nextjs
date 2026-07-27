"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { useDialogFocus } from "@/lib/dialog";
import ProjectPoster from "@/components/ProjectPoster";
import ProjectStill from "@/components/ProjectStill";
import { useProjects } from "@/components/ProjectsProvider";
import { STATUS_LABEL } from "@/data/projects";
import type { LinkKind } from "@/types";

const CTA_LABEL: Record<LinkKind, string> = {
  site: "Voir le site",
  code: "Voir le code",
  brew: "Installer",
};

const EASE = [0.16, 1, 0.3, 1] as const;

/** Le panneau de détail d'un projet. */
export default function ProjectModal() {
  const { active, close, next } = useProjects();
  const panel = useRef<HTMLDivElement>(null);

  useDialogFocus(active !== null, panel);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            aria-label={`Détails du projet ${active.title}`}
            className="absolute inset-x-0 bottom-0 top-0 overflow-y-auto overscroll-contain bg-ink sm:inset-4 sm:top-8 sm:rounded-[4px] sm:border sm:border-line"
            initial={{ y: "6%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "4%", opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Fermer les détails"
              className="mono fixed right-[var(--gutter)] top-6 z-10 border border-white/25 bg-black/60 px-3 py-2 text-white backdrop-blur transition-colors hover:border-amber hover:text-amber sm:absolute sm:right-6 sm:top-6"
            >
              Fermer ✕
            </button>

            {/* Visuel, toujours sur toute la largeur. Sa hauteur suit celle
                de la fenêtre : sur un écran court il cède la place au texte
                plutôt que de le repousser sous la pliure. */}
            <div className="relative h-[clamp(150px,26vh,330px)] w-full">
              <ProjectPoster project={active} variant="card" />
              {/* La fenêtre applicative reste à cheval sur le bas de la bande,
                  comme avant. Sa largeur suit la hauteur de fenêtre : la bande
                  s'étant resserrée, une taille fixe l'aurait fait sortir par
                  le haut du panneau. */}
              <ProjectStill
                project={active}
                showStack={false}
                className="absolute right-[var(--gutter)] top-full w-[min(40%,clamp(190px,32vh,420px))] -translate-y-1/2 sm:right-10"
              />
            </div>

            {/* Le rythme vertical est indexé sur la hauteur de fenêtre —
                corps du titre, gouttières, hauteur des lignes du tableau :
                sur un écran court le bloc se resserre au lieu de déborder. */}
            <div className="flex flex-col gap-[clamp(0.85rem,2vh,1.6rem)] px-[var(--gutter)] pb-8 sm:px-10">
              <div className="relative -mt-12">
                <span className="label text-amber">{STATUS_LABEL[active.status]}</span>
                <h2 className="display mt-3 text-[clamp(2.25rem,min(8vw,10vh),6rem)]">
                  {active.title}
                </h2>
                <p className="mt-3 max-w-2xl text-[clamp(1.05rem,min(2.4vw,2.8vh),1.6rem)] leading-snug text-white/80">
                  {active.tagline}
                </p>
              </div>

              <p className="max-w-2xl text-[clamp(0.9rem,1.9vh,1rem)] leading-relaxed text-white/60">
                {active.summary}
              </p>

              {/* Détails techniques */}
              <dl className="max-w-3xl border-t border-line">
                <Row label="Rôle" value={active.role} />
                <Row label="Période" value={active.year} />
                <Row label="Stack" value={active.stack.join(" · ")} />
                <Row label="Statut" value={STATUS_LABEL[active.status]} />
              </dl>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                {active.href && active.status !== "sunset" && (
                  <a
                    href={active.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono inline-flex items-center gap-2 bg-amber px-6 py-[clamp(0.7rem,1.8vh,1rem)] text-ink transition-opacity hover:opacity-85"
                  >
                    {CTA_LABEL[active.hrefKind ?? "site"]} →
                  </a>
                )}
                {active.hrefKind === "brew" && (
                  <code className="font-mono text-xs text-muted">
                    {active.hrefLabel}
                  </code>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="mono text-muted underline-sweep transition-colors hover:text-white"
                >
                  Projet suivant →
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-line py-[clamp(0.55rem,1.5vh,1rem)] sm:grid-cols-[180px_1fr] sm:gap-6">
      <dt className="mono text-muted">{label}</dt>
      <dd className="font-mono text-sm text-white/85">{value}</dd>
    </div>
  );
}
