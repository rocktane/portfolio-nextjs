import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import TiltCard from "@/components/TiltCard";
import DynamicMap from "@/components/DynamicMap";
import SkillsMarquee from "@/components/SkillsMarquee";
import { projects } from "@/data/projects";
import { COLORS, FONT_SIZES, SHADOWS, CARD_SIZES } from "@/constants/theme";

const TYPEFORM_ID = process.env.NEXT_PUBLIC_TYPEFORM_ID ?? "01HMTZTP9VNNTKA37GK2W7HJDQ";

/** Reusable component for external links with proper accessibility */
function ExternalLink({
  href,
  children,
  className = "",
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
      <span className="sr-only"> (s&apos;ouvre dans une nouvelle fenêtre)</span>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen pt-16 px-4 md:px-8 lg:px-32">
      {/* Intro */}
      <section
        className="px-8 md:px-14 py-8 md:py-10"
        aria-labelledby="intro-heading"
      >
        <h1
          id="intro-heading"
          className="leading-tight font-bright"
          style={{
            color: COLORS.primary,
            fontSize: FONT_SIZES.heroTitle,
            lineHeight: 1.2,
          }}
        >
          Salut, moi c&apos;est <span className="stabilo-hero">Yohan</span>.
          <br />
          Je suis <span className="stabilo-hero">développeur web</span>.
        </h1>
      </section>

      {/* Bento Grid */}
      <section className="px-8 md:px-14">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_auto] gap-4 auto-rows-auto">
          {/* Resume Card */}
          <TiltCard className="md:row-span-3 flex flex-col justify-between gap-4 pl-6">
            <div className="flex gap-3 text-lg md:text-xl">
              <span
                className="text-2xl"
                style={{ textShadow: SHADOWS.emoji }}
                aria-hidden="true"
              >
                🏗️
              </span>
              <div>
                Ingénieur de formation (ESTP Paris), 5 ans dans la construction durable.
                <br />
                <span className="inline-block mt-1">→ </span>
                <ExternalLink
                  href="/CV-20260409.pdf"
                  className="stabilo"
                  ariaLabel="Télécharger mon CV (PDF)"
                >
                  Mon&nbsp;CV
                </ExternalLink>
              </div>
            </div>
            <div className="flex gap-3 text-lg md:text-xl">
              <span
                className="text-2xl"
                style={{ textShadow: SHADOWS.emoji }}
                aria-hidden="true"
              >
                👨‍💻
              </span>
              <div>
                Aujourd&apos;hui développeur fullstack, formé en alternance chez{" "}
                <ExternalLink href="https://www.safee.fr/" className="stabilo">
                  Safee
                </ExternalLink>
                .<br />
                <div className="mt-1">
                  →{" "}
                  <ExternalLink
                    href="https://www.lewagon.com/"
                    className="stabilo"
                  >
                    Le&nbsp;Wagon
                  </ExternalLink>{" "}
                  (Bootcamp 2023)
                  <br />→{" "}
                  <ExternalLink
                    href="https://www.epitech.eu/"
                    className="stabilo"
                  >
                    Epitech
                  </ExternalLink>{" "}
                  (Master Architecte SI 2026)
                </div>
              </div>
            </div>
            <div className="flex gap-3 text-lg md:text-xl">
              <span
                className="text-2xl"
                style={{ textShadow: SHADOWS.emoji }}
                aria-hidden="true"
              >
                🚀
              </span>
              <div>
                Rigueur d&apos;ingénieur, gestion de projets et expertise
                technique au service du web et du mobile.
              </div>
            </div>
          </TiltCard>

          {/* Invite Card */}
          <TiltCard className="md:col-span-2 text-lg md:text-xl">
            Vous avez un projet ?{" "}
            <a href="#contact" className="stabilo">
              Parlons&#8209;en
            </a>
            &nbsp;!
          </TiltCard>

          {/* Map Card */}
          <TiltCard
            noPadding
            className="map-card overflow-hidden md:row-span-2 min-h-[200px]"
          >
            <DynamicMap />
          </TiltCard>

          {/* LinkedIn Card */}
          <TiltCard
            noPadding
            noBackground
            className="flex items-center justify-center w-full"
            style={{
              backgroundColor: COLORS.linkedin,
              width: CARD_SIZES.socialCard,
              height: CARD_SIZES.socialCard,
            }}
          >
            <ExternalLink
              href="https://www.linkedin.com/in/yohan-g"
              ariaLabel="Profil LinkedIn de Yohan"
            >
              <Image
                src="/images/linkedin.png"
                alt="LinkedIn"
                width={80}
                height={80}
                priority
                className="w-16 md:w-20 h-auto"
              />
            </ExternalLink>
          </TiltCard>

          {/* GitHub Card */}
          <TiltCard
            noPadding
            noBackground
            className="flex items-center justify-center w-full"
            style={{
              backgroundColor: COLORS.github,
              width: CARD_SIZES.socialCard,
              height: CARD_SIZES.socialCard,
            }}
          >
            <ExternalLink
              href="https://www.github.com/rocktane"
              ariaLabel="Profil GitHub de Yohan"
            >
              <Image
                src="/images/github-a.png"
                alt="GitHub"
                width={80}
                height={80}
                priority
                className="w-16 md:w-20 h-auto"
              />
            </ExternalLink>
          </TiltCard>
        </div>
      </section>

      {/* Skills Marquee */}
      <SkillsMarquee />

      {/* Projects */}
      <section
        className="px-8 md:px-14 py-8"
        id="projects"
        aria-labelledby="projects-heading"
      >
        <h2
          id="projects-heading"
          className="text-3xl md:text-4xl font-bold mb-8 font-bright tracking-wider"
          style={{ color: COLORS.primary }}
        >
          Projets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-yellow rounded-3xl p-8 shadow-sm relative font-alata text-base md:text-lg overflow-hidden flex flex-col"
            >
              {project.status === "sunset" && (
                <div
                  className="absolute top-0 right-0 bg-gray-800 text-white text-xs font-bold pl-3 pr-4 py-3 z-10 rounded-tl-sm rounded-tr-none rounded-br-sm rounded-bl-xl"
                  aria-label="Projet abandonné"
                >
                  Abandonné
                </div>
              )}
              <h3 className="font-bold text-2xl mb-2">{project.title}</h3>
              <p className="text-gray-700 text-lg md:text-xl mb-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.technologies.map((tech) => (
                  <span key={tech} className="tech-badge">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex items-end justify-between mt-auto gap-3">
                <div>
                  {project.status === "sunset" ? (
                    <span className="stabilo line-through cursor-default text-lg md:text-xl">
                      {project.urlLabel}
                    </span>
                  ) : (
                    <ExternalLink
                      href={project.url}
                      className="stabilo text-lg md:text-xl"
                    >
                      {project.urlLabel}
                    </ExternalLink>
                  )}
                </div>
                {project.image && (
                  <div
                    className="shrink-0 w-[160px] h-[120px] rounded-2xl overflow-hidden shadow-sm relative"
                    style={{ backgroundColor: project.imageBg }}
                  >
                    <Image
                      src={project.image}
                      alt={`Aperçu du projet ${project.title}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section
        className="px-8 md:px-14 py-8"
        id="contact"
        aria-labelledby="contact-heading"
      >
        <h2
          id="contact-heading"
          className="text-3xl md:text-4xl font-bold mb-4 font-bright tracking-wider"
          style={{ color: COLORS.primary }}
        >
          Contact
        </h2>
        <p className="text-gray-600 mb-8">
          Afin de répondre au mieux à vos besoins, je vous invite à organiser un
          point avec moi directement.&nbsp;⬇
        </p>
        <div
          className="bg-white rounded-3xl p-4 overflow-hidden"
          role="region"
          aria-label="Formulaire de contact Typeform"
        >
          <div data-tf-live={TYPEFORM_ID} className="min-h-[400px]" />
        </div>
      </section>

      {/* Typeform Script - lazy loaded */}
      <Script
        src="https://embed.typeform.com/next/embed.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
