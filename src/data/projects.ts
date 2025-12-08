export interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  urlLabel: string;
  status: "beta" | "progress" | "live";
}

export const projects: Project[] = [
  {
    id: "brower",
    title: "brower",
    description: "Une selection de paquets brew dans une interface moderne. Il n'y a plus qu'a les installer.",
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
];
