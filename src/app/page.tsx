"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import TiltCard from "@/components/TiltCard";
import { projects, technologies } from "@/data/projects";
import { COLORS, FONTS, FONT_SIZES, SHADOWS, CARD_SIZES } from "@/constants/theme";

// Dynamic import for Map (needs window/document)
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 rounded-3xl animate-pulse" />,
});

// Typeform ID - could be moved to env variable
const TYPEFORM_ID = "01HMTZTP9VNNTKA37GK2W7HJDQ";

export default function Home() {
  return (
    <div className="min-h-screen pt-16">
      {/* Intro */}
      <section className="px-8 md:px-14 py-8 md:py-10">
        <h1
          className="leading-tight font-bright"
          style={{
            color: COLORS.primary,
            fontSize: FONT_SIZES.heroTitle,
            lineHeight: 1.2,
          }}
        >
          Salut, moi c&apos;est <span className="stabilo">Yohan</span>.<br />
          Je suis <span className="stabilo">developpeur web</span>.
        </h1>
      </section>

      {/* Bento Grid */}
      <section className="px-8 md:px-14">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_auto] gap-4 auto-rows-auto">
          {/* Resume Card */}
          <TiltCard className="md:row-span-3 flex flex-col justify-between gap-4 pl-6">
            <div className="flex gap-3">
              <span className="text-2xl" style={{ textShadow: SHADOWS.emoji }}>&#127969;</span>
              <div>
                5 annees en tant qu&apos;ingenieur dans la construction durable.<br />
                <span className="inline-block mt-1">→ </span>
                <Link href="/CV-20240201.pdf" target="_blank" className="stabilo">
                  Mon&nbsp;CV
                </Link>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl" style={{ textShadow: SHADOWS.emoji }}>&#128104;&#8205;&#128187;</span>
              <div>
                Une reconversion dans le developpement web.<br />
                <div className="mt-1">
                  → <Link href="https://www.lewagon.com/" target="_blank" className="stabilo">Le&nbsp;Wagon</Link><br />
                  → <Link href="https://www.epitech.eu/" target="_blank" className="stabilo">Epitech</Link>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl" style={{ textShadow: SHADOWS.emoji }}>&#128640;</span>
              <div>
                Des competences en gestion de projets et en resolution de problemes que j&apos;applique maintenant dans ce nouveau domaine&nbsp;!
              </div>
            </div>
          </TiltCard>

          {/* Invite Card */}
          <TiltCard className="md:col-span-2">
            Vous avez un projet ?{" "}
            <Link href="#contact" className="stabilo">
              Parlons&#8209;en
            </Link>
            &nbsp;!
          </TiltCard>

          {/* Map Card */}
          <TiltCard noPadding className="overflow-hidden md:row-span-2 min-h-[200px]">
            <Map />
          </TiltCard>

          {/* LinkedIn Card */}
          <TiltCard
            noPadding
            noBackground
            className="flex items-center justify-center w-full"
            style={{ backgroundColor: COLORS.linkedin, width: CARD_SIZES.socialCard, height: CARD_SIZES.socialCard }}
          >
            <Link href="https://www.linkedin.com/in/yohan-g" target="_blank">
              <Image
                src="/images/linkedin.png"
                alt="LinkedIn"
                width={80}
                height={80}
                className="w-16 md:w-20 h-auto"
              />
            </Link>
          </TiltCard>

          {/* GitHub Card */}
          <TiltCard
            noPadding
            noBackground
            className="flex items-center justify-center w-full"
            style={{ backgroundColor: COLORS.github, width: CARD_SIZES.socialCard, height: CARD_SIZES.socialCard }}
          >
            <Link href="https://www.github.com/rocktane" target="_blank">
              <Image
                src="/images/github-a.png"
                alt="GitHub"
                width={80}
                height={80}
                className="w-16 md:w-20 h-auto"
              />
            </Link>
          </TiltCard>
        </div>
      </section>

      {/* Skills Marquee */}
      <section className="overflow-hidden w-full py-8 mt-8">
        <div className="flex whitespace-nowrap w-fit animate-[scroll_60s_linear_infinite] max-md:flex-col max-md:animate-none">
          {[...technologies, ...technologies].map((tech, index) => (
            <h1
              key={`${tech}-${index}`}
              className="flex items-center m-0 p-0 font-black tracking-[-0.05em] text-[clamp(3rem,8vw,4.5rem)] leading-[0.9em] text-[rgba(1,56,63,0.8)]"
              style={{ fontFamily: 'var(--font-alata), "Alata", system-ui, -apple-system, sans-serif' }}
            >
              {tech}
              <span className="text-yellow mx-[0.3em] max-md:hidden">&#8226;</span>
            </h1>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="px-8 md:px-14 py-8" id="projects">
        <h2
          className="text-3xl md:text-4xl font-bold mb-8 font-bright"
          style={{ color: COLORS.primary }}
        >
          Projets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <TiltCard key={project.id}>
              <div className="font-bold text-xl mb-2">{project.title}</div>
              <div className="text-gray-700 mb-4">{project.description}</div>
              <div className="flex items-center gap-2">
                <span>&#128279;</span>
                <Link href={project.url} target="_blank" className="stabilo">
                  {project.urlLabel}
                </Link>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="px-8 md:px-14 py-8" id="contact">
        <h2
          className="text-3xl md:text-4xl font-bold mb-4 font-bright"
          style={{ color: COLORS.primary }}
        >
          Contact
        </h2>
        <p className="text-gray-600 mb-8">
          Afin de repondre au mieux a vos besoins, je vous invite a organiser un point avec moi directement.&nbsp;&#11015;
        </p>
        <div className="bg-white rounded-3xl p-4 min-h-[500px]">
          <div data-tf-live={TYPEFORM_ID} suppressHydrationWarning />
        </div>
      </section>

      {/* Typeform Script - lazy loaded */}
      <Script src="//embed.typeform.com/next/embed.js" strategy="lazyOnload" />
    </div>
  );
}
