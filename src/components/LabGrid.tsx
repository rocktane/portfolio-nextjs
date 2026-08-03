"use client";

import { motion } from "motion/react";
import ProjectPoster from "@/components/ProjectPoster";
import ProjectStill from "@/components/ProjectStill";
import SectionHeading from "@/components/SectionHeading";
import { useProjects } from "@/components/ProjectsProvider";
import { isOpenSource, labProjects, STATUS_LABEL } from "@/data/projects";

const EASE = [0.16, 1, 0.3, 1] as const;

/** « Le labo » : les applications macOS, en affiches verticales. */
export default function LabGrid() {
  const { open } = useProjects();

  return (
    <section
      id="labo"
      aria-labelledby="labo-heading"
      className="scroll-mt-24 px-[var(--gutter)] py-20 md:py-28"
    >
      <SectionHeading
        id="labo-heading"
        title="Labo"
        count={labProjects.length}
      >
        <p className="mono max-w-[34ch] text-right text-muted">
          Outils et expérimentations, construits pour mon usage
        </p>
      </SectionHeading>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labProjects.map((project, i) => (
          <motion.button
            key={project.id}
            type="button"
            onClick={() => open(project.id)}
            className="group cursor-enter relative aspect-[3/4] overflow-hidden rounded-[var(--r-lg)] text-left"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
          >
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
              <ProjectPoster project={project} variant="portrait" />
            </div>

            <div className="relative flex h-full flex-col justify-between p-6">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="chrome-status flex flex-wrap items-center gap-2">
                    <span className="label text-amber">
                      {STATUS_LABEL[project.status]}
                    </span>
                    {isOpenSource(project) && (
                      <span className="label text-amber">OPEN SOURCE</span>
                    )}
                  </span>
                  {/* Le labo n'est plus que macOS : chaque affiche annonce
                      sa propre plateforme. */}
                  <span className="chrome-platform mono text-muted">
                    {project.platform ?? "macOS"}
                  </span>
                </div>
                <ProjectStill project={project} className="mt-6 w-full" />
              </div>

              <div>
                <h3 className="display text-[clamp(1.75rem,3.6vw,2.75rem)]">
                  {project.title}
                </h3>
                <p className="mt-2 max-w-[24ch] text-sm leading-snug text-fg/65">
                  {project.tagline}
                </p>
                <p className="mono mt-4 text-muted transition-colors group-hover:text-amber">
                  Voir le projet →
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
