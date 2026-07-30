import { memo } from "react";
import type { PosterMotif as Motif } from "@/types";

/**
 * Motifs graphiques pour les projets sans capture exploitable (applications
 * macOS). Ils occupent la même place qu'une capture dans l'affiche, pour que
 * les deux familles de visuels partagent exactement le même cadrage.
 */
function PosterMotif({ kind }: { kind: Motif }) {
  const common = {
    className: "h-full w-full",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  } as const;

  if (kind === "amp") {
    // Ondes concentriques d'un haut-parleur + égaliseur.
    return (
      <svg {...common} viewBox="0 0 300 300">
        {[40, 70, 100, 130].map((r, i) => (
          <circle
            key={r}
            cx="150"
            cy="130"
            r={r}
            stroke="#ffffff"
            strokeOpacity={0.3 - i * 0.055}
            strokeWidth="1"
          />
        ))}
        <circle cx="150" cy="130" r="14" fill="#f5a623" />
        {[
          [96, 34],
          [116, 58],
          [136, 22],
          [156, 70],
          [176, 44],
          [196, 60],
        ].map(([x, h]) => (
          <rect
            key={x}
            x={x}
            y={252 - h}
            width="8"
            height={h}
            fill="#ffffff"
            fillOpacity="0.55"
          />
        ))}
      </svg>
    );
  }

  if (kind === "cashou") {
    // Une pile de pièces, et la courbe qu'on cherche à faire monter.
    return (
      <svg {...common} viewBox="0 0 300 300">
        {[0, 1, 2].map((i) => (
          <ellipse
            key={i}
            cx="92"
            cy={214 - i * 26}
            rx="46"
            ry="15"
            stroke="#ffffff"
            strokeOpacity={0.3 + i * 0.12}
            strokeWidth="1.5"
            fill="#ffffff"
            fillOpacity="0.05"
          />
        ))}
        <path
          d="M60 176 v40 a46 15 0 0 0 92 0 v-40"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />
        <path
          d="M150 200 L188 152 L216 176 L256 96"
          stroke="#f5a623"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M232 92 h28 v28" stroke="#f5a623" strokeWidth="4" />
        <circle cx="92" cy="110" r="12" stroke="#f5a623" strokeWidth="2" />
      </svg>
    );
  }

  if (kind === "nlp") {
    // La phrase en jetons, au-dessus des deux gares qu'elle désigne.
    return (
      <svg {...common} viewBox="0 0 300 300">
        {[
          [40, 44],
          [96, 30],
          [136, 52],
          [200, 36],
        ].map(([x, w]) => (
          <rect
            key={x}
            x={x}
            y="66"
            width={w}
            height="16"
            rx="3"
            fill="#ffffff"
            fillOpacity="0.16"
          />
        ))}
        <rect x="96" y="66" width="30" height="16" rx="3" fill="#f5a623" fillOpacity="0.85" />
        <rect x="200" y="66" width="36" height="16" rx="3" fill="#f5a623" fillOpacity="0.85" />

        {/* Les jetons retenus descendent vers leur gare. */}
        <path
          d="M111 92 V128 H78 V168"
          stroke="#ffffff"
          strokeOpacity="0.28"
          strokeWidth="1.5"
        />
        <path
          d="M218 92 V128 H228 V168"
          stroke="#ffffff"
          strokeOpacity="0.28"
          strokeWidth="1.5"
        />

        {/* L'itinéraire : deux terminus, une correspondance. */}
        <path d="M78 188 L152 226 L228 188" stroke="#f5a623" strokeWidth="2.5" fill="none" />
        <circle cx="78" cy="188" r="11" fill="#f5a623" />
        <circle cx="152" cy="226" r="7" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
        <circle cx="228" cy="188" r="11" fill="#f5a623" />
      </svg>
    );
  }

  if (kind === "kube") {
    // La barre du timonier : sept branches autour d'un moyeu.
    return (
      <svg {...common} viewBox="0 0 300 300">
        <polygon
          points="150,52 235,101 235,199 150,248 65,199 65,101"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
          const x = 150 + Math.cos(a) * 66;
          const y = 150 + Math.sin(a) * 66;
          return (
            <g key={i}>
              <line
                x1="150"
                y1="150"
                x2={x}
                y2={y}
                stroke="#ffffff"
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
              <circle cx={x} cy={y} r="9" fill="#ffffff" fillOpacity="0.5" />
            </g>
          );
        })}
        <circle cx="150" cy="150" r="20" fill="#f5a623" />
      </svg>
    );
  }

  if (kind === "raycast") {
    // Le champ de commande, et le rayon qui en part.
    return (
      <svg {...common} viewBox="0 0 300 300">
        <rect
          x="46"
          y="112"
          width="208"
          height="52"
          rx="10"
          stroke="#ffffff"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          fill="#ffffff"
          fillOpacity="0.06"
        />
        <circle cx="76" cy="138" r="9" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2" />
        <line
          x1="83"
          y1="145"
          x2="90"
          y2="152"
          stroke="#ffffff"
          strokeOpacity="0.45"
          strokeWidth="2"
        />
        <rect x="106" y="130" width="76" height="16" rx="3" fill="#ffffff" fillOpacity="0.18" />
        <rect x="228" y="126" width="3" height="24" fill="#f5a623" />

        {/* Le rayon : des traits qui s'échappent du champ, en biais. */}
        {[
          [96, 196, 150, 250],
          [130, 196, 184, 250],
          [164, 196, 218, 250],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={x1}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#f5a623"
            strokeOpacity={0.85 - i * 0.22}
            strokeWidth="4"
          />
        ))}
      </svg>
    );
  }

  if (kind === "tama") {
    // L'encoche du Mac, et la créature qui vit dedans.
    return (
      <svg {...common} viewBox="0 0 300 300">
        <path
          d="M60 60 h180 a0 0 0 0 1 0 0 v0 h-42 a14 14 0 0 0-14 14 v16 a14 14 0 0 1-14 14 h-40 a14 14 0 0 1-14-14 v-16 a14 14 0 0 0-14-14 h-42 z"
          fill="#ffffff"
          fillOpacity="0.08"
        />
        <rect
          x="60"
          y="60"
          width="180"
          height="150"
          rx="18"
          stroke="#ffffff"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        {/* Créature en gros pixels, dans l'esprit d'un écran LCD. */}
        {[
          [138, 118],
          [156, 118],
          [126, 136],
          [168, 136],
          [138, 154],
          [156, 154],
          [126, 172],
          [147, 172],
          [168, 172],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="12" height="12" fill="#2bd37e" />
        ))}
        <rect x="132" y="100" width="10" height="10" fill="#ffffff" />
        <rect x="158" y="100" width="10" height="10" fill="#ffffff" />
      </svg>
    );
  }

  // Batterie arrêtée à 80 %, avec le repère de seuil.
  return (
    <svg {...common} viewBox="0 0 300 300">
      <rect
        x="50"
        y="110"
        width="180"
        height="90"
        rx="12"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <rect x="236" y="140" width="14" height="30" rx="4" fill="#ffffff" fillOpacity="0.35" />
      <rect x="60" y="120" width="128" height="70" rx="6" fill="#2bd37e" fillOpacity="0.85" />
      <line x1="196" y1="96" x2="196" y2="214" stroke="#f5a623" strokeWidth="2" />
      <text
        x="196"
        y="86"
        fill="#f5a623"
        fontSize="20"
        fontFamily="JetBrains Mono, monospace"
        textAnchor="middle"
      >
        80
      </text>
    </svg>
  );
}

export default memo(PosterMotif);
