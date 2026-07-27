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
        <div className="map-decor aspect-square w-full max-w-[260px] overflow-hidden rounded-lg border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
          <DynamicMap />
        </div>

        <div>
          {/* La carte situe déjà : les coordonnées n'ajoutaient qu'un chiffre
              de plus à lire. Reste le nom, qui lui légende la vignette. */}
          <p className="mono text-muted">Marseille, France</p>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
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
              className="mono border border-white/30 px-6 py-4 text-white transition-colors hover:border-amber hover:text-amber"
            >
              Ouvrir le formulaire →
            </button>

            <a
              href="https://www.linkedin.com/in/yohan-g"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-muted underline-sweep transition-colors hover:text-white"
            >
              LinkedIn ↗
            </a>
            <a
              href="https://www.github.com/rocktane"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-muted underline-sweep transition-colors hover:text-white"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
