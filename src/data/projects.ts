import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "brower",
    title: "brower",
    description: "Une sélection de paquets brew dans une interface moderne. Il n'y a plus qu'à les installer.",
    url: "https://bro.yohan.one",
    urlLabel: "bro.yohan.one",
    status: "beta",
  },
  {
    id: "geeft",
    title: "geeft",
    description: "Une plateforme pour trouver le cadeau parfait. Plus besoin de chercher.",
    url: "https://www.geeft.club",
    urlLabel: "geeft.club",
    status: "beta",
  },
  {
    id: "portfolio",
    title: "Mon portfolio",
    description: "Le site sur lequel vous vous trouvez.",
    url: "https://www.yohangouiran.com",
    urlLabel: "yohangouiran.com",
    status: "progress",
  },
];

export const technologies = [
  "HTML",
  "CSS",
  "JAVASCRIPT",
  "FIGMA",
  "RUBY ON RAILS",
  "SQL",
  "PYTHON",
  "WEBFLOW",
  "API",
] as const;

/** Pre-computed doubled array for marquee animation - avoids recreation on each render */
export const technologiesDoubled = [...technologies, ...technologies];
