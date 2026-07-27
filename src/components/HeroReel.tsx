"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import ProjectPoster from "@/components/ProjectPoster";
import ProjectStill from "@/components/ProjectStill";
import { useProjects } from "@/components/ProjectsProvider";
import { heroProjects, STATUS_LABEL } from "@/data/projects";
import { scrollToId } from "@/components/SmoothScroll";
import { isTyping } from "@/components/KeyboardNav";

const DURATION = 6000;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Le carrousel d'ouverture : un projet par plan, comme une bande-annonce. */
export default function HeroReel() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reduced = useReducedMotion();
  const { open } = useProjects();

  /**
   * Un défilement automatique de plus de cinq secondes doit pouvoir être
   * arrêté (WCAG 2.2.2). Le survol et le focus suspendent le compte à rebours,
   * mais ni l'un ni l'autre ne sont un vrai contrôle : le bouton en est un,
   * et il est le seul à survivre au déplacement du pointeur.
   */
  const paused = hovered || focused || stopped;

  const project = heroProjects[index];

  const goTo = useCallback((i: number) => {
    setIndex(((i % heroProjects.length) + heroProjects.length) % heroProjects.length);
  }, []);

  useEffect(() => {
    if (reduced || paused) return;
    const timer = setTimeout(() => goTo(index + 1), DURATION);
    return () => clearTimeout(timer);
  }, [index, paused, reduced, goTo]);

  // Les flèches gauche/droite pilotent le carrousel, mais seulement tant qu'il
  // occupe l'écran : plus bas dans la page, elles appartiennent au navigateur.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;
      if (document.documentElement.style.overflow === "hidden") return;

      const hero = document.getElementById("top");
      if (!hero || hero.getBoundingClientRect().bottom < window.innerHeight / 2) {
        return;
      }

      e.preventDefault();
      goTo(index + (e.key === "ArrowRight" ? 1 : -1));
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  return (
    <section
      id="top"
      role="group"
      aria-roledescription="carrousel"
      aria-label="Projets mis en avant"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      {/* Le changement de plan n'est annoncé que si le défilement est à
          l'arrêt : en rotation, une annonce toutes les six secondes couvrirait
          la lecture du reste de la page. */}
      <p className="sr-only" aria-live={paused ? "polite" : "off"}>
        Projet {index + 1} sur {heroProjects.length} : {project.title}
      </p>

      {/* Visuels empilés : on fond l'un dans l'autre plutôt que de glisser. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={project.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1 }, scale: { duration: 7, ease: "linear" } }}
        >
          <ProjectPoster project={project} variant="hero" />
        </motion.div>
      </AnimatePresence>

      {/* Le visuel du projet, en grand : c'est lui la preuve.
          Ni `AnimatePresence` ni sortie animée : le plan sortant et le plan
          entrant ne portent ni la même adresse ni les mêmes badges, et se
          chevaucher les faisait vibrer à mi-fondu. Le sortant disparaît net,
          le nouveau monte sur l'affiche — qui, elle, reste. */}
      <motion.div
        key={`still-${project.id}`}
        // Motion pilote `transform` : le positionnement vertical passe donc
        // par `top`, pas par une classe translate qui serait écrasée.
        className="absolute right-[var(--gutter)] top-[15%] hidden w-[44vw] max-w-[720px] md:block"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <ProjectStill project={project} priority />
      </motion.div>

      {/* L'accroche ne change pas d'un plan à l'autre : elle est posée hors du
          carrousel, au-dessus de la pile, et dit qui parle avant que le
          premier projet ait fini de défiler. */}
      {/* La largeur s'arrête avant la fenêtre du projet, à droite : l'accroche
          tient sur deux lignes, une par phrase, sans jamais la toucher. */}
      {/* Le bloc de menu, bandeau d'appel compris, descend jusqu'à ~7 rem :
          l'accroche commence en dessous, à toutes les largeurs. */}
      <div className="absolute left-[var(--gutter)] top-[7.5rem] z-30 max-w-[min(86vw,40rem)]">
        <p className="display text-[clamp(1.15rem,2vw,1.75rem)] leading-tight text-white">
          Yohan Gouiran, développeur fullstack.
        </p>
        {/* Flèche en variante texte, pas en émoji : la version colorée jurait
            avec le reste des signes de la page (→, ↓). */}
        <p className="display mt-1 text-[clamp(1.15rem,2vw,1.75rem)] leading-tight text-white/55">
          Voici mes projets ⤵
        </p>
      </div>

      {/* Texte */}
      <div className="relative flex h-full flex-col justify-end px-[var(--gutter)] pb-28 pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={project.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full"
          >
            <span className="label text-amber">{STATUS_LABEL[project.status]}</span>

            {/* Le titre porte le cadre : il doit occuper la largeur, pas
                flotter dans un coin. */}
            <h1 className="display mt-4 text-[clamp(3.5rem,15.5vw,13.5rem)] text-amber">
              <SlideUp text={project.title} />
            </h1>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-5 border-t border-white/15 pt-5">
              <div>
                <p className="display max-w-[26ch] text-[clamp(1.25rem,3.2vw,2.5rem)] text-white">
                  <SlideUp text={project.tagline} delay={0.08} />
                </p>
                {/* La stack est désormais en badges sous la fenêtre : la
                    répéter ici ferait lire deux fois la même liste. */}
                <p className="mono mt-4 text-muted">{project.year}</p>
              </div>

              <button
                type="button"
                onClick={() => open(project.id)}
                className="mono shrink-0 border border-white/30 px-5 py-3 text-white transition-colors hover:border-amber hover:bg-amber hover:text-ink"
              >
                Voir le projet →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Barre de bas d'écran */}
        <div className="mt-10 flex items-end justify-between gap-6">
          <button
            type="button"
            onClick={() => scrollToId("projets")}
            className="mono text-muted transition-colors hover:text-white"
          >
            Scroll ↓
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Sans mouvement demandé, le carrousel ne tourne pas de lui-même :
                un bouton de pause n'aurait rien à arrêter. */}
            {!reduced && (
              <button
                type="button"
                onClick={() => setStopped((s) => !s)}
                aria-pressed={stopped}
                className="mono border border-white/25 px-2.5 py-2 text-white/70 transition-colors hover:border-amber hover:text-amber"
              >
                {stopped ? "Lecture ▶" : "Pause ❙❙"}
              </button>
            )}

            <div className="flex items-center gap-2">
              {heroProjects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-current={i === index}
                  aria-label={`Afficher ${p.title}`}
                  onClick={() => goTo(i)}
                  // Le trait ne fait qu'un pixel de haut : sans zone tampon
                  // autour, la cible était pratiquement impossible à viser.
                  className="group cursor-pointer px-1.5 py-5"
                >
                  {/* Ce trait est la seule forme visible du bouton : sous
                      3:1, la commande elle-même devenait indiscernable. */}
                  <span className="relative block h-px w-8 bg-white/45 sm:w-12">
                    {i === index && (
                      // `initial` doit être identique au rendu serveur :
                      // `useReducedMotion()` y vaut null, l'utiliser ici
                      // cassait l'hydratation. On joue sur la durée à la place.
                      <motion.span
                        key={`${p.id}-${paused}`}
                        className="absolute inset-y-0 left-0 block bg-amber"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: reduced || paused ? 0 : DURATION / 1000,
                          ease: "linear",
                        }}
                      />
                    )}
                    {i !== index && (
                      <span className="absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/60" />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <span className="mono text-muted tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(heroProjects.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Chaque mot monte depuis un masque, décalé — c'est ce qui donne au titre
 * son entrée « générique de film » plutôt qu'un simple fondu.
 */
function SlideUp({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        // Le masque doit clipper le bas, d'où le mot arrive, sans rogner les
        // accents en haut : le padding ouvre la boîte vers le haut.
        <span
          key={`${word}-${i}`}
          className="-mt-[0.2em] mr-[0.22em] inline-block overflow-hidden pt-[0.2em] align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.75, delay: delay + i * 0.055, ease: EASE }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </>
  );
}
