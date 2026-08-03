"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import ProjectPoster from "@/components/ProjectPoster";
import ProjectStill from "@/components/ProjectStill";
import SectionHeading from "@/components/SectionHeading";
import { useProjects } from "@/components/ProjectsProvider";
import { scrollBehavior } from "@/components/SmoothScroll";
import { featuredProjects, isOpenSource, STATUS_LABEL } from "@/data/projects";

const EASE = [0.16, 1, 0.3, 1] as const;

/** « À l'affiche » : les projets vivants, en rangée qui défile latéralement. */
export default function WorkRow() {
  const scroller = useRef<HTMLDivElement>(null);
  const { open } = useProjects();

  const nudge = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.6,
      behavior: scrollBehavior(),
    });
  };

  return (
    <section
      id="projets"
      aria-labelledby="projets-heading"
      className="scroll-mt-24 py-20 md:py-28"
    >
      <div className="px-[var(--gutter)]">
        <SectionHeading
          id="projets-heading"
          title="Projets"
          count={featuredProjects.length}
        >
          {/* Ces boutons portent un libellé et pilotent la rangée : les
              masquer aux technologies d'assistance revenait à cacher une
              commande utilisable au clavier. */}
          <div className="flex gap-2">
            <RowButton onClick={() => nudge(-1)} label="Précédent">
              ←
            </RowButton>
            <RowButton onClick={() => nudge(1)} label="Suivant">
              →
            </RowButton>
          </div>
        </SectionHeading>
      </div>

      {/* overflow-y explicitement masqué : `overflow-x: auto` fait passer
          l'autre axe en `auto` lui aussi, et le `y: 40` des cards pas encore
          entrées débordait alors vers le bas — la rangée se mettait à défiler
          verticalement de quelques pixels, sans raison visible. */}
      {/* `scroll-px` est indispensable avec `snap-mandatory` : sans lui, le
          point d'accroche d'une card s'aligne sur le bord du conteneur et non
          sur sa marge intérieure — la rangée s'auto-défilait d'une gouttière
          au chargement, et la première card collait au bord de l'écran. */}
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto overflow-y-hidden px-[var(--gutter)] pb-2"
      >
        {featuredProjects.map((project, i) => (
          <motion.button
            key={project.id}
            type="button"
            onClick={() => open(project.id)}
            // Le 4/3 est un plancher, pas un cadre : imposé, il rognait le
            // titre et le lien dès que la card était étroite — sous `sm`, mais
            // aussi à 640, 768 et 1024 px, où la fenêtre du projet, ses badges
            // et le titre demandent jusqu'à soixante pixels de plus que les
            // trois quarts de la largeur. La rangée étant un `flex`, les cards
            // s'étirent toutes sur la plus haute : elles restent d'aplomb.
            className="group cursor-enter relative w-[86vw] shrink-0 snap-start overflow-hidden rounded-[var(--r-lg)] text-left sm:min-h-[42vw] sm:w-[56vw] lg:min-h-[28.5vw] lg:w-[38vw]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
          >
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
              <ProjectPoster project={project} variant="card" />
            </div>

            <div className="relative flex h-full flex-col justify-between gap-8 p-6 sm:gap-4">
              {/* Le mobile empile : à 62 % d'une card étroite, la fenêtre du
                  projet devenait illisible et sa stack se pliait sur quatre
                  lignes, à côté d'une colonne de vide. */}
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:gap-5">
                <span className="chrome-status flex shrink-0 flex-wrap items-center gap-2">
                  <span className="label text-amber">
                    {STATUS_LABEL[project.status]}
                  </span>
                  {isOpenSource(project) && (
                    <span className="label text-amber">OPEN SOURCE</span>
                  )}
                </span>
                <ProjectStill
                  project={project}
                  className="w-full sm:w-[62%] sm:max-w-[340px]"
                />
              </div>
              <div>
                <h3 className="display text-[clamp(2rem,4.5vw,3.5rem)]">
                  {project.title}
                </h3>
                <p className="mono mt-2 text-muted transition-colors group-hover:text-amber">
                  {project.hrefLabel ?? "Voir le projet"} →
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function RowButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="iconbtn mono h-9 w-9"
    >
      {children}
    </button>
  );
}
