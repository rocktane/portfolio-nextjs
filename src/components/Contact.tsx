"use client";

import { motion } from "motion/react";
import DynamicMap from "@/components/DynamicMap";
import { TYPEFORM_ID } from "@/constants/theme";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * La prise de contact tient en un bouton. Le formulaire s'ouvre en surcouche
 * via l'embed Typeform : présent, mais jamais imposé dans la page.
 */
export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      // `signature-dim` : la section recule pendant le survol de la signature
      // du pied de page, juste en dessous. Voir globals.css.
      className="signature-dim scroll-mt-24 px-[var(--gutter)] py-24 md:py-36"
    >
      <motion.h2
        id="contact-heading"
        className="display text-[clamp(3rem,15vw,13rem)]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        Parlons-en
      </motion.h2>

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,220px)_1fr] md:items-start md:gap-16">
        {/* Même cadre que les fenêtres de projet, pour l'unité de l'ensemble. */}
        <div className="map-decor aspect-square w-full max-w-[260px] overflow-hidden rounded-[var(--r-md)] border border-frame">
          <DynamicMap />
        </div>

        <div>
          {/* La carte situe déjà : les coordonnées n'ajoutaient qu'un chiffre
              de plus à lire. Reste le nom, qui lui légende la vignette. */}
          <p className="mono text-muted">Marseille, France</p>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-fg/75">
            Un projet, une mission, une question ? Le formulaire prend deux
            minutes et me donne le contexte pour répondre utilement.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {/* L'embed Typeform pose lui-même `data-tf-loaded` sur le bouton,
                parfois avant la fin de l'hydratation : l'écart est attendu. */}
            <button
              type="button"
              data-tf-popup={TYPEFORM_ID}
              data-tf-size="70"
              suppressHydrationWarning
              className="btn"
            >
              Ouvrir le formulaire
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </button>

            <a
              href="https://www.linkedin.com/in/yohan-g"
              target="_blank"
              rel="noopener noreferrer"
              className="link mono text-muted transition-colors hover:text-fg"
            >
              LinkedIn ↗
            </a>
            <a
              href="https://www.github.com/rocktane"
              target="_blank"
              rel="noopener noreferrer"
              className="link mono text-muted transition-colors hover:text-fg"
            >
              GitHub ↗
            </a>
            <a
              href="mailto:dev@yohangouiran.com"
              className="link mono text-muted transition-colors hover:text-fg"
            >
              Email ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
