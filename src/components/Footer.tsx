"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useProjects } from "@/components/ProjectsProvider";
import { scrollToId } from "@/components/SmoothScroll";
import { featuredProjects, labProjects } from "@/data/projects";

/** Pied de page en colonnes. */
export default function Footer() {
  const { open } = useProjects();

  return (
    <footer className="px-[var(--gutter)] pb-16">
      <div className="rule" aria-hidden="true" />

      <div className="signature-dim grid grid-cols-2 gap-8 pt-16 md:grid-cols-4">
        <Column title="Projets">
          {featuredProjects.map((p) => (
            <FooterButton key={p.id} onClick={() => open(p.id)}>
              {p.title}
            </FooterButton>
          ))}
        </Column>

        <Column title="Labo">
          {labProjects.map((p) => (
            <FooterButton key={p.id} onClick={() => open(p.id)}>
              {p.title}
            </FooterButton>
          ))}
        </Column>

        <Column title="Navigation">
          <FooterButton onClick={() => scrollToId("parcours")}>Parcours</FooterButton>
          <FooterButton onClick={() => scrollToId("contact")}>Contact</FooterButton>
        </Column>

        <Column title="Liens">
          <FooterLink href="https://www.linkedin.com/in/yohan-g">LinkedIn ↗</FooterLink>
          <FooterLink href="https://www.github.com/rocktane">GitHub ↗</FooterLink>
        </Column>
      </div>

      <div className="rule mt-16" aria-hidden="true" />

      <div className="flex flex-wrap items-end justify-between gap-6 pt-8">
        <Signature />
        <p className="signature-dim mono text-muted" suppressHydrationWarning>
          © {new Date().getFullYear()} — Construit avec Next.js
        </p>
      </div>
    </footer>
  );
}

/** Rayon du halo, en pixels. Assez large pour éclairer deux ou trois lettres. */
const HALO = 180;

/**
 * La signature du bas de page, éteinte au repos.
 *
 * Une seconde copie du nom, en ambre, est superposée à la première et masquée
 * partout sauf autour du curseur : la souris se comporte comme une lampe qu'on
 * promène sur le texte. Deux copies plutôt qu'un dégradé sur une seule, pour
 * que la couleur révélée reste franche au lieu de se mélanger au gris.
 *
 * Les coordonnées passent par des `MotionValue` : elles s'écrivent directement
 * dans le style, sans repasser par un rendu React à chaque pixel parcouru.
 */
function Signature() {
  const box = useRef<HTMLParagraphElement>(null);
  const [lit, setLit] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mask = useMotionTemplate`radial-gradient(${HALO}px circle at ${x}px ${y}px, #000 0%, rgba(0,0,0,0.55) 40%, transparent 70%)`;

  // Suivre le curseur est un mouvement : on s'en abstient si l'utilisateur a
  // demandé moins d'animation, et le nom reste alors simplement éteint.
  const track = (e: React.PointerEvent<HTMLParagraphElement>) => {
    if (reduced || !box.current) return;
    const rect = box.current.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    if (!lit) setLit(true);
  };

  // Le reste de la page s'efface pendant le survol. L'effacement est un simple
  // changement d'opacité, pas un déplacement : il vaut aussi pour qui a demandé
  // moins d'animation. Marqueur sur `<html>`, car « Parlons-en » est hors du
  // pied de page ; retiré au démontage pour ne pas figer la page éteinte.
  useEffect(() => {
    if (!hovered) return;
    const root = document.documentElement;
    root.dataset.signature = "lit";
    return () => {
      delete root.dataset.signature;
    };
  }, [hovered]);

  return (
    <p
      ref={box}
      // Gris volontairement éteint, mais pas au point d'être illisible : sous
      // 3:1 la signature ne passait plus le contraste exigé d'un grand texte.
      // Curseur masqué : le halo le remplace, c'est lui qu'on déplace.
      className="display relative cursor-none select-none text-[clamp(2rem,9vw,6rem)] leading-none text-muted"
      onPointerMove={track}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setLit(false);
        setHovered(false);
      }}
    >
      Yohan Gouiran
      {/* Copie décorative : le nom est déjà lu une fois, juste au-dessus. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-amber transition-opacity duration-300"
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
          opacity: lit && !reduced ? 1 : 0,
        }}
      >
        Yohan Gouiran
      </motion.span>
    </p>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mono mb-4 text-muted">{title}</h3>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="link mono text-left text-fg/70 transition-colors hover:text-fg"
      >
        {children}
      </button>
    </li>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="link mono text-fg/70 transition-colors hover:text-fg"
      >
        {children}
      </a>
    </li>
  );
}
