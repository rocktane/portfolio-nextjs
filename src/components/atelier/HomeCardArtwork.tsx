import { createElement, type CSSProperties } from "react";
import { homeCardIcons } from "@/data/home-card-icons";
import { homeCardBrands, homeCardCompositions } from "@/data/home-card-compositions";

export type HomeCardComposition = keyof typeof homeCardCompositions;

const symbolFamilies: Record<string, string> = {
  "hard-hat": "ochre", construction: "ochre", building: "ochre",
  "thermometer-sun": "thermal", leaf: "green",
  "drafting-compass": "blue", cuboid: "blue", ruler: "blue", calculator: "blue",
  "graduation-cap": "violet", "book-open": "violet", laptop: "violet",
  "users-round": "green", "clipboard-check": "blue", presentation: "blue",
  "briefcase-business": "ochre",
  mail: "ochre", paperclip: "ochre", "calendar-check": "ochre", reply: "ochre",
  "at-sign": "thermal", video: "thermal", "mouse-pointer-2": "thermal",
  send: "green", phone: "green", "messages-square": "green", "mail-open": "green",
  contact: "blue", "message-square-text": "blue", globe: "blue",
  "message-circle": "violet", link: "violet", inbox: "violet",
};

// Symbols whose stroke thickens on hover, with the hover width in screen pixels.
const boldOnHover: Record<string, number> = { "at-sign": 2 };

export default function HomeCardArtwork({ composition }: { composition: HomeCardComposition }) {
  return (
    <svg className="home-card-background home-card-artwork" viewBox="0 0 360 168" preserveAspectRatio="xMaxYMid slice" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {homeCardCompositions[composition].map(({ icon, x, y, size, rotation }) => {
        const scale = size / 24;
        const transform = `translate(${x} ${y}) rotate(${rotation}) scale(${scale}) translate(-12 -12)`;
        if (icon in homeCardBrands) {
          const brand = homeCardBrands[icon as keyof typeof homeCardBrands];
          return <g key={icon} className="home-stack-logo" transform={transform} strokeWidth={0.9 / scale} style={{ "--logo-color": brand.color } as CSSProperties}>
            {brand.paths.map((d, index) => <path key={index} d={d} />)}
          </g>;
        }
        return <g key={icon} className="home-card-symbol" transform={transform} strokeWidth={1.2 / scale} style={{ "--symbol-color": `var(--art-${symbolFamilies[icon] ?? "blue"})`, "--symbol-hover-width": (boldOnHover[icon] ?? 1.2) / scale } as CSSProperties}>
          {homeCardIcons[icon as keyof typeof homeCardIcons].map(([tag, attributes], index) => createElement(tag, { ...attributes, key: index }))}
        </g>;
      })}
    </svg>
  );
}
