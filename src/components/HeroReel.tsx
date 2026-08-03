"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ProjectPoster from "@/components/ProjectPoster";
import ProjectStill from "@/components/ProjectStill";
import { useProjects } from "@/components/ProjectsProvider";
import { heroProjects, isOpenSource, STATUS_LABEL } from "@/data/projects";
import type { Project } from "@/types";
import { scrollToId } from "@/components/SmoothScroll";
import { isTyping } from "@/components/KeyboardNav";
import { useAccent } from "@/components/AccentProvider";

const DURATION = 6000;
const EASE = [0.16, 1, 0.3, 1] as const;

/** L'accélération du balayage : sèche à l'attaque, longue à la sortie. */
const SWEEP_EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Le passage d'un projet au suivant.
 *
 * Le fond du plan entrant balaie d'abord l'écran, seul, de la droite vers la
 * gauche. Son contenu se monte ensuite et se pose pièce par pièce.
 *
 * Le contenu n'est pas seulement retardé : il n'existe pas tant que le fond
 * n'a pas fini de traverser. Le retarder aurait suffi en théorie, mais il
 * suffit d'un élément mal masqué pour qu'une bribe du projet suivant se voie
 * par-dessus celui qu'on est en train de quitter. Rien à masquer si rien
 * n'est monté.
 *
 * `CASCADE_MS` doit tomber après la dernière pièce : c'est à cet instant que
 * le plan entrant devient le plan de base et se démonte. Trop tôt, il
 * disparaîtrait en pleine animation et le plan de base ferait sauter la
 * dernière pièce à sa position finale.
 */
const SWEEP_MS = 620;
const CASCADE_MS = 1650;

/** Le carrousel d'ouverture : un projet par plan, comme une bande-annonce. */
export default function HeroReel() {
  /**
   * Deux index, et il faut les distinguer.
   *
   * `target` est le plan vers lequel on va — il change à l'instant du clic.
   * `shown` est celui qui tient l'écran, et il ne le rejoint qu'à la fin du
   * passage. Entre les deux, la transition est en cours. `step` compte les
   * passages : il sert de clé pour rejouer l'animation.
   */
  const [target, setTarget] = useState(0);
  const [shown, setShown] = useState(0);
  const [step, setStep] = useState(0);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reduced = useReducedMotion();
  const { open } = useProjects();
  const { setAccent } = useAccent();

  const passing = target !== shown;

  /**
   * Un défilement automatique de plus de cinq secondes doit pouvoir être
   * arrêté (WCAG 2.2.2). Le survol et le focus suspendent le compte à rebours,
   * mais ni l'un ni l'autre ne sont un vrai contrôle : le bouton en est un,
   * et il est le seul à survivre au déplacement du pointeur.
   */
  const paused = hovered || focused || stopped;

  const project = heroProjects[shown];
  const incoming = heroProjects[target];

  // La cible est aussi tenue en ref : `goTo` doit pouvoir refuser une
  // transition vers le plan déjà visé sans se redéclarer à chaque changement,
  // ce qui relancerait le minuteur de défilement.
  const aim = useRef(0);
  const goTo = useCallback((i: number) => {
    const len = heroProjects.length;
    const next = ((i % len) + len) % len;
    if (next === aim.current) return;
    aim.current = next;
    setTarget(next);
    setStep((s) => s + 1);
  }, []);

  /**
   * La fin du passage : le plan entrant devient le plan de base et se démonte
   * au même instant — l'échange est invisible puisque les deux montrent déjà
   * la même chose.
   *
   * Sans mouvement demandé, le délai tombe à zéro. Le changement passe quand
   * même par le minuteur : écrit dans le corps de l'effet, il forcerait un
   * second rendu en cascade.
   */
  useEffect(() => {
    if (step === 0) return;
    const timer = setTimeout(
      () => setShown(target),
      reduced ? 0 : CASCADE_MS,
    );
    return () => clearTimeout(timer);
  }, [step, target, reduced]);

  /**
   * Le carrousel ne colore pas seulement son propre cadre : sa couleur part
   * dans <html> et devient celle de la page entière — menu compris — jusqu'à
   * ce que le défilement la dilue.
   *
   * C'est la couleur du plan *entrant* qui part, dès le début du passage : le
   * fond du hero change pendant le balayage, le reste de la page doit changer
   * avec lui.
   */
  useEffect(() => {
    setAccent(incoming.accent);
  }, [incoming.accent, setAccent]);

  // Le compte à rebours repart du plan affiché, pas du plan visé : sinon il
  // démarrerait pendant que le passage est encore en cours.
  useEffect(() => {
    if (reduced || paused) return;
    const timer = setTimeout(() => goTo(shown + 1), DURATION);
    return () => clearTimeout(timer);
  }, [shown, paused, reduced, goTo]);

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
      goTo(aim.current + (e.key === "ArrowRight" ? 1 : -1));
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  const controls = {
    stopped,
    paused,
    reduced,
    onToggleStop: () => setStopped((s) => !s),
    onGoTo: goTo,
    onOpen: open,
  };

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
        Projet {shown + 1} sur {heroProjects.length} : {project.title}
      </p>

      {/* L'accroche ne change pas d'un plan à l'autre : elle est posée hors du
          carrousel, au-dessus de la pile, et dit qui parle avant que le
          premier projet ait fini de défiler. Au-dessus des deux plans pendant
          un passage, aussi : identique de part et d'autre, elle n'a aucune
          raison de se faire recouvrir puis redécouvrir. */}
      {/* La largeur s'arrête avant la fenêtre du projet, à droite : l'accroche
          tient sur deux lignes, une par phrase, sans jamais la toucher. */}
      {/* Le bloc de menu, bandeau d'appel compris, descend jusqu'à ~7 rem :
          l'accroche commence en dessous, à toutes les largeurs. */}
      <div className="pointer-events-none absolute left-[var(--gutter)] top-[7.5rem] z-30 max-w-[min(86vw,40rem)]">
        <p className="display text-[clamp(1.15rem,2vw,1.75rem)] leading-tight text-fg">
          Yohan Gouiran, développeur fullstack.
        </p>
        {/* Flèche en variante texte, pas en émoji : la version colorée jurait
            avec le reste des signes de la page (→, ↓). */}
        <p className="display mt-1 text-[clamp(1.15rem,2vw,1.75rem)] leading-tight text-fg/55">
          Voici mes projets ⤵
        </p>
      </div>

      {/* Le plan à l'écran. Pendant un passage il n'est plus que le dessous :
          on le retire de l'arbre d'accessibilité, sinon ses commandes
          feraient doublon avec celles du plan entrant. */}
      <HeroSlide {...controls} project={project} index={shown} muted={passing} />

      {/* Le plan entrant : son fond balaie, puis son contenu se pose. */}
      {passing && !reduced && (
        <CascadeSlide
          key={step}
          {...controls}
          project={incoming}
          index={target}
        />
      )}
    </section>
  );
}

interface SlideProps {
  project: Project;
  index: number;
  stopped: boolean;
  paused: boolean;
  reduced: boolean | null;
  onToggleStop: () => void;
  onGoTo: (i: number) => void;
  onOpen: (id: string) => void;
  /** Le plan est sous un autre : plus rien n'y est lisible ni tabulable. */
  muted?: boolean;
  /** Le fond est peint à part, pour pouvoir le faire entrer seul. */
  withoutPoster?: boolean;
  /** Faire entrer chaque pièce à son tour, plutôt que de tout peindre en place. */
  cascade?: boolean;
}

/**
 * Un plan du carrousel, en entier : son affiche, sa fenêtre, son texte et la
 * réglette du bas.
 *
 * Pendant un passage, deux plans coexistent une seconde et demie ; c'est
 * `muted` qui empêche celui du dessous de doubler les commandes de l'autre.
 */
function HeroSlide({
  project,
  index,
  stopped,
  paused,
  reduced,
  onToggleStop,
  onGoTo,
  onOpen,
  muted = false,
  withoutPoster = false,
  cascade = false,
}: SlideProps) {
  /**
   * La cascade : chaque pièce entre à son tour. Les décalages comptent depuis
   * le montage du contenu, qui n'a lieu qu'une fois le fond passé — ils
   * partent donc tous de zéro.
   *
   * Hors cascade, `rise` ne rend rien : un `motion.div` sans `initial` ni
   * `animate` est un `div`, et le contenu est peint en place.
   */
  const rise = (
    delay: number,
    from: Partial<{ x: number; y: number }> = { y: 20 },
  ) =>
    cascade
      ? {
          initial: { opacity: 0, ...from },
          animate: { opacity: 1, x: 0, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE },
        }
      : {};

  return (
    <div
      className="absolute inset-0"
      aria-hidden={muted || undefined}
      inert={muted || undefined}
    >
      {!withoutPoster && <ProjectPoster project={project} variant="hero" />}

      {/* Le visuel du projet, en grand : c'est lui la preuve. Dans la cascade
          il arrive par la droite, d'où le balayage vient de passer. */}
      <motion.div
        className="absolute right-[var(--gutter)] top-[15%] hidden w-[44vw] max-w-[720px] md:block"
        {...rise(0, { x: 48 })}
      >
        {/* La fenêtre du projet est elle-même l'entrée vers le projet.
            C'est ce qui permet de se passer d'un bouton : la barre de titre
            porte déjà l'adresse du site, et une flèche vient s'y poser au
            survol. Le libellé reste dit aux technologies d'assistance, qui ne
            voient pas la flèche. */}
        <button
          type="button"
          onClick={() => onOpen(project.id)}
          aria-label={`Voir la fiche du projet ${project.title}`}
          className="group cursor-enter block w-full text-left transition-transform duration-500 ease-out hover:-translate-y-1"
        >
          <ProjectStill project={project} priority />
        </button>
      </motion.div>

      {/* Texte */}
      <div className="relative flex h-full flex-col justify-end px-[var(--gutter)] pb-28 pt-32">
        <div className="w-full">
          <motion.span
            className="chrome-status flex flex-wrap items-center gap-2"
            {...rise(0.06)}
          >
            <span className="label text-amber">{STATUS_LABEL[project.status]}</span>
            {isOpenSource(project) && (
              <span className="label text-amber">OPEN SOURCE</span>
            )}
          </motion.span>

          {/* Le titre porte le cadre : il doit occuper la largeur, pas
              flotter dans un coin. */}
          <h1 className="hero-title display mt-4 text-[clamp(3.5rem,15.5vw,13.5rem)]">
            <WordsUp text={project.title} animate={cascade} delay={0.06} />
          </h1>

          {/* Le trait plein d'un bord à l'autre a laissé place à un
              séparateur qui s'éteint en route : voir `.rule`. Dans la cascade
              il se tire depuis la gauche. */}
          <motion.div
            className="rule mt-4 origin-left"
            aria-hidden="true"
            {...(cascade
              ? {
                  initial: { scaleX: 0 },
                  animate: { scaleX: 1 },
                  transition: { duration: 0.6, delay: 0.2, ease: EASE },
                }
              : {})}
          />

          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
            <div>
              {/* L'accroche compte jusqu'à sept mots : mot à mot, sa seule
                  traîne allongeait le passage d'une demi-seconde. Elle se
                  lève d'un bloc, et c'est le titre qui garde l'entrée mot à
                  mot. */}
              <motion.p
                className="display max-w-[26ch] text-[clamp(1.25rem,3.2vw,2.5rem)] text-fg"
                {...rise(0.26)}
              >
                {project.tagline}
              </motion.p>
              {/* La stack est désormais en badges sous la fenêtre : la
                  répéter ici ferait lire deux fois la même liste. */}
              <motion.p
                className="chrome-year mono mt-4 text-muted"
                {...rise(0.34)}
              >
                {project.year}
              </motion.p>
            </div>

            <motion.button
              type="button"
              onClick={() => onOpen(project.id)}
              className="chrome-cta btn shrink-0"
              {...rise(0.34)}
            >
              Voir le projet
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </motion.button>
          </div>
        </div>

        {/* Barre de bas d'écran */}
        <motion.div
          className="mt-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4"
          {...rise(0.4, { y: 12 })}
        >
          <button
            type="button"
            onClick={() => scrollToId("projets")}
            className="chrome-scroll mono text-muted transition-colors hover:text-fg"
          >
            Scroll ↓
          </button>

          {/* Les traits, la pause et un compteur ne tiennent pas sur la ligne
              d'un téléphone : les commandes passent alors sous le « Scroll »,
              sur toute la largeur, et la réglette prend ce qui reste au lieu
              de sortir de l'écran. */}
          <div className="flex w-full items-center gap-4 sm:w-auto sm:gap-6">
            {/* Sans mouvement demandé, le carrousel ne tourne pas de lui-même :
                un bouton de pause n'aurait rien à arrêter. */}
            {!reduced && (
              <button
                type="button"
                onClick={onToggleStop}
                aria-pressed={stopped}
                className="chrome-pause iconbtn mono shrink-0 px-2.5 py-2"
              >
                {stopped ? "Lecture ▶" : "Pause ❙❙"}
              </button>
            )}

            {/* Une vraie barre de progression : les plans déjà passés restent
                pleins, celui en cours se remplit, les suivants attendent
                vides. Le tour terminé, tout se vide d'un coup. */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
              {heroProjects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-current={i === index}
                  aria-label={`Afficher ${p.title}`}
                  onClick={() => onGoTo(i)}
                  // Le trait est bas : sans zone tampon autour, la cible était
                  // pratiquement impossible à viser.
                  className="reel-tick min-w-0 flex-1 cursor-pointer px-1.5 py-5 sm:flex-none"
                >
                  <span className="reel-track relative block h-[2px] w-full overflow-hidden rounded-full sm:w-12">
                    {i < index && (
                      <span className="reel-bar absolute inset-0 block rounded-full" />
                    )}
                    {i === index && (
                      // `initial` doit être identique au rendu serveur :
                      // `useReducedMotion()` y vaut null, l'utiliser ici
                      // cassait l'hydratation. On joue sur la durée à la place.
                      <motion.span
                        key={`${p.id}-${paused}`}
                        className="reel-bar absolute inset-y-0 left-0 block rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: reduced || paused ? 0 : DURATION / 1000,
                          ease: "linear",
                        }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <span className="chrome-counter mono shrink-0 text-muted tabular-nums">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(heroProjects.length).padStart(2, "0")}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Le plan entrant : le fond balaie seul, puis le contenu se monte et se pose.
 *
 * Le contenu attend ici, et non dans un simple délai d'animation : tant que
 * le balayage n'est pas fini, le plan suivant n'existe pas dans la page. Rien
 * ne peut donc en dépasser par-dessus le plan qu'on quitte.
 */
function CascadeSlide({
  project,
  index,
  ...controls
}: Omit<SlideProps, "cascade" | "withoutPoster">) {
  const [swept, setSwept] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSwept(true), SWEEP_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-20">
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ x: "100%" }}
        animate={{ x: "0%" }}
        transition={{ duration: SWEEP_MS / 1000, ease: SWEEP_EASE }}
      >
        {/* Contre-translation exacte : le volet glisse, l'aplat qu'il amène
            ne bouge pas. Même durée et même accélération que le volet, sinon
            les deux se décalent. */}
        <motion.div
          className="absolute inset-0"
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: SWEEP_MS / 1000, ease: SWEEP_EASE }}
        >
          <ProjectPoster project={project} variant="hero" />
        </motion.div>
      </motion.div>

      {swept && (
        <HeroSlide
          {...controls}
          project={project}
          index={index}
          withoutPoster
          cascade
        />
      )}
    </div>
  );
}

/**
 * Un texte dont chaque mot monte depuis un masque, décalé — l'entrée
 * « générique de film » plutôt qu'un simple fondu.
 *
 * `animate` n'est pas déduit ici : l'appelant seul sait si le mot doit
 * entrer. Le plan déjà à l'écran ne le doit pas — son texte est arrivé depuis
 * longtemps. Il est alors rendu nu, sans masque, donc sans risque de rogner
 * un jambage non plus.
 */
function WordsUp({
  text,
  animate,
  delay = 0,
}: {
  text: string;
  animate: boolean;
  delay?: number;
}) {
  if (!animate) return text;

  return (
    <>
      {text.split(" ").map((word, i) => (
        // Le masque doit laisser passer la lettre entière : les accents
        // montent au-dessus de la hauteur de capitale, les jambages du p, du
        // g et du q descendent sous la ligne de base. La boîte est donc
        // ouverte des deux côtés, et les marges négatives annulent d'autant
        // pour que l'interligne du titre ne bouge pas. Sans le bas, « amp »
        // et « Protéger » se faisaient couper.
        <span
          key={`${word}-${i}`}
          className="-my-[0.24em] mr-[0.22em] inline-block overflow-hidden py-[0.24em] align-bottom"
        >
          <motion.span
            className="inline-block"
            // 130 %, pas 105 : la boîte ayant été ouverte de 0,24 em en bas,
            // un mot posé à 105 % de sa propre hauteur dépassait dans cette
            // marge — quarante pixels de sommet de lettres visibles avant
            // l'entrée.
            initial={{ y: "130%" }}
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
