"use client";

import { motion } from "motion/react";
import { useProjects } from "@/components/ProjectsProvider";
import { archivedProjects } from "@/data/projects";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Ce qui s'est arrêté. Assumer les projets morts donne du poids à ceux qui
 * tiennent encore : on les liste, en sourdine, sans les cacher.
 */
export default function Archives() {
  if (archivedProjects.length === 0) return null;

  return (
    <section
      id="archives"
      aria-labelledby="archives-heading"
      className="scroll-mt-24 px-[var(--gutter)] py-16"
    >
      <h2 id="archives-heading" className="mono mb-6 text-muted">
        Archives
      </h2>

      <ul className="border-t border-line">
        {archivedProjects.map((project, i) => (
          <ArchiveRow key={project.id} id={project.id} index={i} />
        ))}
      </ul>
    </section>
  );
}

function ArchiveRow({ id, index }: { id: string; index: number }) {
  const { open } = useProjects();
  const project = archivedProjects[index];

  return (
    <motion.li
      className="border-b border-line"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
    >
      <button
        type="button"
        onClick={() => open(id)}
        className="group flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 text-left"
      >
        <span className="display text-[clamp(1.5rem,4vw,2.5rem)] text-muted line-through decoration-1 transition-colors group-hover:text-white/70">
          {project.title}
        </span>
        <span className="mono text-muted">{project.year}</span>
        <span className="mono flex-1 text-right text-muted transition-colors group-hover:text-amber">
          {project.stack.join(" · ")}
        </span>
      </button>
    </motion.li>
  );
}
