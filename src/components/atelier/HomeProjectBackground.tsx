import type { CSSProperties } from "react";
import { homeStackLogos } from "@/data/home-stack-logos";

export default function HomeProjectBackground() {
  return (
    <svg
      className="home-card-background home-project-background"
      viewBox="0 0 640 190"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {homeStackLogos.map((logo) => (
        <g
          key={logo.slug}
          className="home-stack-logo"
          transform={logo.transform}
          strokeWidth={logo.strokeWidth}
          style={{
            "--logo-color": ["000000", "181717"].includes(logo.color.slice(1))
              ? "currentColor"
              : logo.color,
          } as CSSProperties}
        >
          {logo.paths.map((path, index) => <path key={index} d={path} />)}
        </g>
      ))}
    </svg>
  );
}
