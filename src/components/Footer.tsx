import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { mainLogos, secondaryLogos } from "@/data/logos";
import type { Logo } from "@/types";
import { FONT_SIZES } from "@/constants/theme";

interface LogoGridProps {
  logos: Logo[];
  description: string;
}

function LogoGrid({ logos, description }: LogoGridProps) {
  return (
    <div>
      <p className="text-sm mb-6" style={{ fontSize: FONT_SIZES.small }}>
        {description}
      </p>
      <div className="logos flex flex-wrap items-center gap-2" role="list">
        {logos.map((logo) => (
          <Link
            key={logo.href}
            href={logo.href}
            target="_blank"
            rel="noopener noreferrer"
            title={logo.alt}
            aria-label={`Visiter le site ${logo.alt} (nouvelle fenêtre)`}
            className="relative group"
            role="listitem"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={60}
              height={60}
              className="w-10 md:w-[60px] h-auto object-contain grayscale-0 md:grayscale hover:grayscale-0 transition-all"
            />
            <span
              className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 bg-white px-2 py-1 rounded-lg shadow-sm text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              aria-hidden="true"
            >
              {logo.alt}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 py-4 px-4 md:pt-40 md:px-40 md:pb-4 bg-linear-to-t from-[rgb(253,245,228)] from-35% to-transparent">
      <div className="flex flex-col md:flex-row justify-center gap-8 mb-8">
        <LogoGrid
          logos={mainLogos}
          description="Ce site a été réalisé avec Next.js en utilisant :"
        />
        <LogoGrid logos={secondaryLogos} description="et aussi :" />
      </div>
    </footer>
  );
}

export default memo(Footer);
