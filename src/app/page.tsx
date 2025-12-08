import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import TiltCard from "@/components/TiltCard";
import DynamicMap from "@/components/DynamicMap";
import { projects, technologiesDoubled } from "@/data/projects";
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
    <div className="min-h-screen pt-16">
      {/* Intro */}
      <section className="px-8 md:px-14 py-8 md:py-10" aria-labelledby="intro-heading">
        <h1
          id="intro-heading"
          className="leading-tight font-bright"
          style={{
            color: COLORS.primary,
            fontSize: FONT_SIZES.heroTitle,
            lineHeight: 1.2,
          }}
        >
          Salut, moi c&apos;est <span className="stabilo">Yohan</span>.<br />
          Je suis <span className="stabilo">développeur web</span>.
        </h1>
      </section>

      {/* Bento Grid */}
      <section className="px-8 md:px-14">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_auto] gap-4 auto-rows-auto">
          {/* Resume Card */}
          <TiltCard className="md:row-span-3 flex flex-col justify-between gap-4 pl-6">
            <div className="flex gap-3">
              <span className="text-2xl" style={{ textShadow: SHADOWS.emoji }} aria-hidden="true">🏡</span>
              <div>
                5 années en tant qu&apos;ingénieur dans la construction durable.<br />
                <span className="inline-block mt-1">→ </span>
                <ExternalLink href="/CV-20240201.pdf" className="stabilo" ariaLabel="Télécharger mon CV (PDF)">
                  Mon&nbsp;CV
                </ExternalLink>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl" style={{ textShadow: SHADOWS.emoji }} aria-hidden="true">👨‍💻</span>
              <div>
                Une reconversion dans le développement web.<br />
                <div className="mt-1">
                  → <ExternalLink href="https://www.lewagon.com/" className="stabilo">Le&nbsp;Wagon</ExternalLink><br />
                  → <ExternalLink href="https://www.epitech.eu/" className="stabilo">Epitech</ExternalLink>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl" style={{ textShadow: SHADOWS.emoji }} aria-hidden="true">🚀</span>
              <div>
                Des compétences en gestion de projets et en résolution de problèmes que j&apos;applique maintenant dans ce nouveau domaine&nbsp;!
              </div>
            </div>
          </TiltCard>

          {/* Invite Card */}
          <TiltCard className="md:col-span-2">
            Vous avez un projet ?{" "}
            <a href="#contact" className="stabilo">
              Parlons&#8209;en
            </a>
            &nbsp;!
          </TiltCard>

          {/* Map Card */}
          <TiltCard noPadding className="overflow-hidden md:row-span-2 min-h-[200px]">
            <DynamicMap />
          </TiltCard>

          {/* LinkedIn Card */}
          <TiltCard
            noPadding
            noBackground
            className="flex items-center justify-center w-full"
            style={{ backgroundColor: COLORS.linkedin, width: CARD_SIZES.socialCard, height: CARD_SIZES.socialCard }}
          >
            <ExternalLink href="https://www.linkedin.com/in/yohan-g" ariaLabel="Profil LinkedIn de Yohan">
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
            style={{ backgroundColor: COLORS.github, width: CARD_SIZES.socialCard, height: CARD_SIZES.socialCard }}
          >
            <ExternalLink href="https://www.github.com/rocktane" ariaLabel="Profil GitHub de Yohan">
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
      <section className="overflow-hidden w-full py-8 mt-8" aria-label="Compétences techniques">
        <div className="flex whitespace-nowrap w-fit animate-[scroll_60s_linear_infinite] max-md:flex-col max-md:animate-none">
          {technologiesDoubled.map((tech, index) => (
            <span
              key={`${tech}-${index}`}
              className="flex items-center m-0 p-0 font-black tracking-[-0.05em] text-[clamp(3rem,8vw,4.5rem)] leading-[0.9em] text-[rgba(1,56,63,0.8)]"
              style={{ fontFamily: 'var(--font-alata), "Alata", system-ui, -apple-system, sans-serif' }}
            >
              {tech}
              <span className="text-yellow mx-[0.3em] max-md:hidden" aria-hidden="true">•</span>
            </span>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="px-8 md:px-14 py-8" id="projects" aria-labelledby="projects-heading">
        <h2
          id="projects-heading"
          className="text-3xl md:text-4xl font-bold mb-8 font-bright"
          style={{ color: COLORS.primary }}
        >
          Projets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <TiltCard key={project.id}>
              <h3 className="font-bold text-xl mb-2">{project.title}</h3>
              <p className="text-gray-700 mb-4">{project.description}</p>
              <div className="flex items-center gap-2">
                <span aria-hidden="true">🔗</span>
                <ExternalLink href={project.url} className="stabilo">
                  {project.urlLabel}
                </ExternalLink>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="px-8 md:px-14 py-8" id="contact" aria-labelledby="contact-heading">
        <h2
          id="contact-heading"
          className="text-3xl md:text-4xl font-bold mb-4 font-bright"
          style={{ color: COLORS.primary }}
        >
          Contact
        </h2>
        <p className="text-gray-600 mb-8">
          Afin de répondre au mieux à vos besoins, je vous invite à organiser un point avec moi directement.&nbsp;⬇
        </p>
        <div className="bg-white rounded-3xl p-4 min-h-[500px]" role="region" aria-label="Formulaire de contact Typeform">
          <div data-tf-live={TYPEFORM_ID} />
        </div>
      </section>

      {/* Typeform Script - lazy loaded */}
      <Script src="//embed.typeform.com/next/embed.js" strategy="lazyOnload" />
    </div>
  );
}
