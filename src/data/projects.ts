import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "safee",
    title: "safee",
    description: "Une solution de sécurité B2B pour protéger les collaborateurs mobiles et travailleurs isolés.",
    url: "https://safee.fr",
    urlLabel: "safee.fr",
    status: "live",
    technologies: ["React Native", "NestJS", "TypeScript", "AWS", "Prisma"],
  },
  {
    id: "brower",
    title: "brower",
    description: "Une sélection de paquets brew dans une interface moderne. Il n'y a plus qu'à les installer.",
    url: "https://bro.yohan.one",
    urlLabel: "bro.yohan.one",
    status: "beta",
    technologies: ["Vue.js", "TypeScript", "Vite", "Node.js"],
    image: "/projects/bro-card-light.png",
    imageBg: "#f5f3ee",
  },
  {
    id: "geeft",
    title: "geeft",
    description: "Une plateforme pour trouver le cadeau parfait. Plus besoin de chercher.",
    url: "https://www.geeft.club",
    urlLabel: "geeft.club",
    status: "sunset",
    technologies: ["Ruby on Rails", "JavaScript", "SQL"],
    image: "/projects/geeft.png",
    imageBg: "#9dbdb4",
  },
  {
    id: "portfolio",
    title: "Mon portfolio",
    description: "Le site sur lequel vous vous trouvez.",
    url: "https://www.yohangouiran.com",
    urlLabel: "yohangouiran.com",
    status: "progress",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
];

export const technologies = [
  "HTML",
  "CSS",
  "JAVASCRIPT",
  "REACT",
  "REACT NATIVE",
  "SWIFTUI",
  "FIGMA",
  "RUBY ON RAILS",
  "SQL",
  "PYTHON",
  "WEBFLOW",
  "API",
] as const;
