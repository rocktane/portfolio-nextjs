import Image from "next/image";
import { memo } from "react";
import PosterMotif from "@/components/PosterMotif";
import type { Project } from "@/types";

/**
 * Le visuel d'un projet, présenté dans une fenêtre applicative.
 *
 * Une capture posée à nu se lit comme un fichier oublié là. Encadrée dans une
 * fenêtre — pastilles, barre de titre — elle redevient un produit : on comprend
 * immédiatement qu'il s'agit d'une application, web ou macOS. Les projets sans
 * capture affichent leur motif dans la même fenêtre, ce qui garde toute la
 * grille homogène.
 *
 * La stack vit sous la fenêtre, en badges : dans une barre d'état elle se
 * lisait comme une partie de l'interface capturée, ce qu'elle n'est pas.
 */
function ProjectStill({
  project,
  priority = false,
  showStack = true,
  className = "",
}: {
  project: Project;
  priority?: boolean;
  /** Le panneau de détail liste déjà la stack dans son tableau : l'afficher
   *  aussi sous la fenêtre la répéterait à dix lignes d'écart. */
  showStack?: boolean;
  className?: string;
}) {
  const { shot, motif, accent, title, hrefLabel, stack } = project;
  // Le motif marque les applications natives : leur fenêtre porte le nom de
  // l'application, là où un site porte son adresse.
  const isNative = Boolean(motif);
  const barLabel = isNative ? title : (hrefLabel ?? title);

  return (
    <div className={className}>
      <figure className="relative overflow-hidden rounded-lg border border-white/15 bg-[#0c0c0f] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        {/* Barre de titre */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.06] px-3 py-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          {/* Une adresse ne se crie pas : on n'emprunte pas `.mono`, qui
              passerait tout en capitales, seulement sa fonte. */}
          <span className="truncate font-mono text-[9px] lowercase tracking-[0.08em] text-white/60">
            {barLabel}
          </span>
        </div>

        {/* Contenu */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
          {shot ? (
            <Image
              src={shot}
              alt={`Aperçu de l'interface de ${title}`}
              fill
              priority={priority}
              sizes="(max-width: 768px) 90vw, 45vw"
              className="object-cover object-top"
            />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(90% 90% at 50% 40%, ${accent}55 0%, #0c0c0f 72%)`,
                }}
              />
              {motif && (
                <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2">
                  <PosterMotif kind={motif} />
                </div>
              )}
            </>
          )}
        </div>
      </figure>

      {/* La stack, en badges — même micro-label encadré que partout ailleurs. */}
      {showStack && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {stack.map((tech) => (
            <li key={tech} className="label text-white/60">
              {tech}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(ProjectStill);
