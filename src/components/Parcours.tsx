"use client";

import { motion } from "motion/react";
import { technicalCredits } from "@/data/projects";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Le parcours en timeline verticale : les diplômes d'un côté du rail, ce
 * qu'ils ont ouvert de l'autre.
 *
 * L'axe porte les trois écoles ; en face de chacune, l'expérience qui a suivi.
 * La reconversion se lit alors dans l'alignement lui-même — une formation, un
 * métier — plutôt que dans une suite de dates à recoller.
 *
 * La stack suit, en dessous, groupée par domaine plutôt qu'en bandeau défilant.
 */
export default function Parcours() {
  return (
    <section
      id="parcours"
      aria-labelledby="parcours-heading"
      className="scroll-mt-24 px-[var(--gutter)] py-24 md:py-36"
    >
      <motion.h2
        id="parcours-heading"
        className="display mb-20 text-center text-[clamp(2.5rem,8vw,6rem)]"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        Parcours
      </motion.h2>

      <ol className="relative mx-auto max-w-4xl">
        {JALONS.map((j, i) => (
          <motion.li
            key={j.ecole}
            className="relative pb-14 pl-10 last:pb-0 md:grid md:grid-cols-2 md:gap-0 md:pl-0"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
          >
            <span
              className={`absolute left-0 top-1 z-10 block h-5 w-5 rounded-full border-2 md:left-1/2 md:-translate-x-1/2 ${
                i === JALONS.length - 1
                  ? "border-amber bg-amber"
                  : "border-white/35 bg-ink"
              }`}
              aria-hidden="true"
            />

            {/* Le rail est tiré segment par segment, d'une pastille à la
                suivante, plutôt que d'un seul trait sur toute la colonne :
                sous le dernier point il ne resterait sinon qu'une amorce
                qui ne mène nulle part. */}
            {i < JALONS.length - 1 && (
              <span
                className="absolute left-[9px] top-6 h-[calc(100%-1.25rem)] w-px bg-line md:left-1/2 md:-translate-x-1/2"
                aria-hidden="true"
              />
            )}

            {/* Le diplôme, côté rail. Aligné à droite sur grand écran : les
                deux colonnes se rejoignent alors sur l'axe. */}
            <div className="md:pr-14 md:text-right">
              <p className="mono text-muted">{j.an}</p>
              <p className="display display-multiline mt-2 text-[clamp(1.15rem,2vw,1.6rem)]">
                {j.ecole}
              </p>
              <p className="mt-1.5 text-sm leading-snug text-white/60">{j.diplome}</p>
            </div>

            {/* Ce que le diplôme a ouvert. Même police et même corps que la
                formation d'en face : les deux colonnes se répondent au lieu de
                se hiérarchiser. */}
            <div className="mt-5 border-l border-line pl-5 md:mt-0 md:border-l-0 md:pl-14">
              <p className="mono text-muted">{j.periode}</p>
              <p className="display display-multiline mt-2 text-[clamp(1.15rem,2vw,1.6rem)] text-white">
                {j.poste}
              </p>
              <p className="mt-1.5 text-sm leading-snug text-white/60">{j.lieu}</p>
            </div>
          </motion.li>
        ))}
      </ol>

      <div className="mx-auto mt-32 max-w-4xl border-t border-line pt-16">
        <p className="mono mb-8 text-center text-muted">Stack technique</p>
        <dl>
          {technicalCredits.map((line, i) => (
            <motion.div
              key={line.role}
              className="grid grid-cols-1 items-baseline gap-1 py-3 sm:grid-cols-2 sm:gap-10"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: EASE }}
            >
              <dt className="mono text-muted sm:text-right">{line.role}</dt>
              <dd className="font-mono text-sm text-white/70">{line.value}</dd>
            </motion.div>
          ))}
        </dl>

        {/* Le parcours se lit ici en entier ; le CV n'est qu'un rappel, d'où
            sa place en fin de section plutôt qu'en tête. */}
        <motion.div
          className="mt-14 flex justify-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <a
            href="/CV-20260409.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ouvrir mon CV (PDF, nouvel onglet)"
            className="mono border border-white/30 px-6 py-4 text-white transition-colors hover:border-amber hover:text-amber"
          >
            Mon CV ↗
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// Les intervalles de dates s'écrivent partout au tiret demi-cadratin sans
// espaces (2018–2023) : une seule forme, sur la timeline comme sur les projets.
const JALONS = [
  {
    an: "2018",
    ecole: "ESTP Paris",
    diplome: "Ingénieur",
    periode: "2018–2023",
    poste: "Ingénieur Énergie Environnement",
    lieu: "5 ans en bureaux d'études",
  },
  {
    an: "2023",
    ecole: "Le Wagon",
    diplome: "Reconversion",
    periode: "2024",
    poste: "Professeur assistant",
    lieu: "Le Wagon",
  },
  {
    an: "2026",
    ecole: "Epitech",
    diplome: "Master 2 Architecte SI",
    periode: "2024–aujourd'hui",
    poste: "Développeur fullstack",
    lieu: "Safee",
  },
];
