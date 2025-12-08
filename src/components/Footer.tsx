import Image from "next/image";
import Link from "next/link";

const mainLogos = [
  { src: "/images/figma-logo.png", alt: "Figma", href: "https://www.figma.com/" },
  { src: "/images/cursor-logo.webp", alt: "Cursor", href: "https://cursor.sh/" },
  { src: "/images/github.png", alt: "GitHub", href: "https://www.github.com/" },
  { src: "/images/bunny-a-logo.png", alt: "Bunny Fonts", href: "https://fonts.bunny.net/" },
  { src: "/images/leaflet-logo.png", alt: "Leaflet", href: "https://leafletjs.com/" },
  { src: "/images/typeform-logo.png", alt: "Typeform", href: "https://www.typeform.com/" },
  { src: "/images/calendly-logo.png", alt: "Calendly", href: "https://www.calendly.com/" },
];

const secondaryLogos = [
  { src: "/images/gpt-logo.png", alt: "ChatGPT", href: "https://chat.openai.com/" },
  { src: "/images/youtube-logo.png", alt: "YouTube", href: "https://www.youtube.com/" },
  { src: "/images/stack-logo.png", alt: "Stackoverflow", href: "https://stackoverflow.com/" },
  { src: "/images/google-logo.png", alt: "Google", href: "https://www.google.com/" },
];

export default function Footer() {
  return (
    <footer className="footer mt-20">
      <div className="flex flex-col md:flex-row justify-center gap-8 mb-8">
        <div>
          <p className="text-sm mb-6" style={{ fontSize: "clamp(0.8rem, 2vw, 1rem)" }}>
            Ce site a ete realise avec <span className="font-semibold">Next.js</span> en utilisant :
          </p>
          <div className="logos flex flex-wrap items-center gap-2">
            {mainLogos.map((logo) => (
              <Link
                key={logo.alt}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                title={logo.alt}
                className="relative group"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={60}
                  height={60}
                  className="w-[60px] h-auto object-contain grayscale hover:grayscale-0 transition-all"
                />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 bg-white px-2 py-1 rounded-lg shadow-sm text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {logo.alt}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm mb-6" style={{ fontSize: "clamp(0.8rem, 2vw, 1rem)" }}>
            et aussi :
          </p>
          <div className="logos flex flex-wrap items-center gap-2">
            {secondaryLogos.map((logo) => (
              <Link
                key={logo.alt}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                title={logo.alt}
                className="relative group"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={60}
                  height={60}
                  className="w-[60px] h-auto object-contain grayscale hover:grayscale-0 transition-all"
                />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 bg-white px-2 py-1 rounded-lg shadow-sm text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {logo.alt}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
