import type { CreditLine, Project, ProjectStatus } from "@/types";

/** Libellé affiché dans le micro-label encadré de chaque projet. */
export const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "EN PRODUCTION",
  beta: "BETA",
  wip: "EN COURS",
  unreleased: "NON DÉPLOYÉ",
  sunset: "ARCHIVÉ",
};

/** Un projet dont le lien pointe vers un dépôt public est ouvert : le label le
 *  dit, plutôt que de dupliquer l'information dans les données. */
export function isOpenSource(project: Project): boolean {
  return Boolean(project.href?.includes("github.com"));
}

export const projects: Project[] = [
  {
    id: "safee",
    title: "Safee",
    tagline: "Protéger ceux qui travaillent seuls",
    summary:
      "Une solution de sécurité B2B pour les collaborateurs mobiles et les travailleurs isolés : application mobile, bouton d'alarme et supervision temps réel.",
    year: "2024–aujourd'hui",
    role: "Développeur fullstack",
    stack: ["React Native", "NestJS", "TypeScript", "AWS", "Prisma"],
    status: "live",
    section: "projets",
    accent: "#6341AD",
    href: "https://safee.fr",
    hrefLabel: "safee.fr",
    hrefKind: "site",
    shot: "/projects/safee.webp",
    pattern: "grid",
    hero: true,
  },
  {
    id: "brower",
    title: "Brower",
    tagline: "Le brew store qu'Homebrew n'a jamais eu",
    summary:
      "Une sélection de paquets Homebrew dans une interface moderne. On coche les applications voulues, on récupère une seule commande d'installation.",
    year: "2024–2026",
    role: "Conception et développement",
    stack: ["Vue.js", "TypeScript", "Vite", "Node.js"],
    status: "beta",
    section: "projets",
    accent: "#2E9E6B",
    href: "https://bro.yohan.one",
    hrefLabel: "bro.yohan.one",
    hrefKind: "site",
    shot: "/projects/brower.webp",
    pattern: "dots",
    hero: true,
  },
  {
    id: "exo",
    title: "Exo",
    tagline: "Le rituel quotidien des devs",
    summary:
      "Un défi par jour pour entretenir ses réflexes : HelloWordle, Terminal Escape, Regex Golf, Bug Hunt, et des QCM de programmation en accès libre.",
    year: "2026",
    role: "Conception et développement",
    stack: ["Next.js", "InstantDB", "Clerk", "TypeScript"],
    status: "live",
    section: "projets",
    accent: "#4F46E5",
    href: "https://exo.yohan.one",
    hrefLabel: "exo.yohan.one",
    hrefKind: "site",
    shot: "/projects/exo.webp",
    pattern: "diagonals",
    hero: true,
  },
  {
    id: "amp",
    title: "Amp",
    tagline: "Sonos, enfin natif sur macOS",
    summary:
      "Un contrôleur Sonos écrit en SwiftUI. Toute la logique réseau vit dans un package séparé, SonosKit ; l'application n'est que la couche d'interface.",
    year: "2026",
    role: "Conception et développement",
    stack: ["SwiftUI", "Swift", "macOS"],
    status: "wip",
    section: "labo",
    accent: "#3B5BDB",
    href: "https://github.com/rocktane/Amp",
    hrefLabel: "github.com/rocktane/Amp",
    hrefKind: "code",
    shot: "/projects/amp.webp",
    motif: "amp",
    pattern: "rings",
    hero: true,
  },
  {
    id: "cashou",
    title: "Cashou",
    tagline: "Apprendre la finance en jouant",
    summary:
      "Un jeu sérieux qui transforme l'apprentissage de la finance en parcours de défis : on débloque des fonctionnalités en prenant des décisions d'investissement. Projet EIP, en monorepo Bun — application Expo, API tRPC et back-office partagent le même schéma.",
    year: "2026",
    role: "Développement fullstack — projet EIP Epitech",
    stack: ["Expo", "tRPC", "Prisma", "PostgreSQL", "Bun"],
    status: "wip",
    section: "projets",
    accent: "#16A34A",
    href: "https://cashou.app",
    hrefLabel: "cashou.app",
    hrefKind: "site",
    shot: "/projects/cashou.webp",
    motif: "cashou",
    pattern: "dots",
    hero: true,
  },
  {
    id: "tvcal",
    title: "tvcal",
    tagline: "Vos séries dans votre agenda",
    summary:
      "Un calendrier ICS auquel on s'abonne pour recevoir les dates de diffusion de ses séries. TVmaze donne le planning, TMDB l'iconographie, et l'affiche impose sa teinte à l'interface. L'URL du flux ne change jamais : ajouter une série modifie le contenu, pas l'adresse — donc on ne se réabonne jamais. Ni compte, ni mot de passe.",
    year: "2026",
    role: "Conception et développement",
    stack: ["Next.js", "TypeScript", "SQLite", "Bun"],
    status: "live",
    section: "projets",
    accent: "#F35D7A",
    href: "https://tvcal.yohan.one",
    hrefLabel: "tvcal.yohan.one",
    hrefKind: "site",
    shot: "/projects/tvcal.webp",
    pattern: "scanlines",
    hero: true,
  },
  {
    id: "travel-resolver",
    title: "Travel Resolver",
    tagline: "Une phrase en français, un itinéraire SNCF",
    summary:
      "Un pipeline NLP en trois temps : un modèle spaCy entraîné sur mesure extrait les villes de départ et d'arrivée d'une phrase libre, un KD-Tree les rattache à la gare la plus proche, puis Dijkstra trace l'itinéraire. 95,7 % de F1 sur 2 000 phrases de test, contre 73 % pour la base de référence.",
    year: "2026",
    role: "Conception et développement",
    stack: ["Python", "spaCy", "CamemBERT", "PyTorch", "FastAPI"],
    status: "unreleased",
    section: "projets",
    accent: "#0D9488",
    href: "https://github.com/rocktane/T-AIA-911",
    hrefLabel: "github.com/rocktane/T-AIA-911",
    hrefKind: "code",
    motif: "nlp",
    pattern: "scanlines",
  },
  {
    id: "snake",
    title: "Snake",
    tagline: "Une grille, une cellule rouge, rien d'autre",
    summary:
      "Un Snake réduit à l'essentiel, écrit en TypeScript sans moteur de jeu. Un exercice de sobriété : pas de menu, pas de score, juste la boucle.",
    year: "2026",
    role: "Conception et développement",
    stack: ["TypeScript", "Vite", "Canvas"],
    status: "live",
    section: "projets",
    accent: "#E11D2E",
    href: "https://snake.yohan.one",
    hrefLabel: "snake.yohan.one",
    hrefKind: "site",
    shot: "/projects/snake.webp",
    pattern: "scanlines",
  },
  {
    id: "tamanotchi",
    title: "Tamanotchi",
    tagline: "Un tamagotchi vit dans ton encoche",
    summary:
      "Une créature installée dans l'encoche du Mac, qu'il faut nourrir et occuper. Application SwiftUI sans fenêtre, avec accessoires cosmétiques débloquables.",
    year: "2026",
    role: "Conception et développement",
    stack: ["SwiftUI", "Swift", "macOS"],
    status: "wip",
    section: "labo",
    accent: "#2BD37E",
    href: "https://github.com/rocktane/tama",
    hrefLabel: "github.com/rocktane/tama",
    hrefKind: "code",
    shot: "/projects/tamanotchi.webp",
    motif: "tama",
    pattern: "dots",
  },
  {
    id: "betterbattery",
    title: "BetterBattery",
    tagline: "Ta batterie s'arrête à 80 %. Pour toujours.",
    summary:
      "Une application de barre de menus qui limite la charge via le SMC pour préserver la batterie : seuils configurables, protection thermique, mode Top Up.",
    year: "2026",
    role: "Conception et développement",
    stack: ["Swift", "SMC", "macOS", "Apple Silicon"],
    status: "live",
    section: "labo",
    accent: "#22B8CF",
    href: "https://github.com/rocktane/betterbattery",
    hrefLabel: "brew install --cask rocktane/tap/betterbattery",
    hrefKind: "brew",
    shot: "/projects/betterbattery.webp",
    motif: "battery",
    pattern: "diagonals",
  },
  {
    id: "kubequest",
    title: "KubeQuest",
    tagline: "Un cluster qui se construit tout seul",
    summary:
      "La migration d'une application web vers un cluster Kubernetes auto-hébergé sur Oracle Cloud. Parti pris : aucune connexion SSH, jamais. Terraform provisionne les machines et amorce le cluster, ArgoCD s'occupe de tout le reste en lisant le dépôt Git.",
    year: "2026",
    role: "Conception et mise en œuvre",
    stack: ["Kubernetes", "Terraform", "Talos", "ArgoCD", "Helm"],
    status: "wip",
    section: "labo",
    accent: "#326CE5",
    href: "https://github.com/rocktane/T-CLO-902",
    hrefLabel: "github.com/rocktane/T-CLO-902",
    hrefKind: "code",
    motif: "kube",
    pattern: "grid",
    platform: "Infra",
  },
  {
    id: "removebg",
    title: "RemoveBG",
    tagline: "Détourer une image sans quitter le Finder",
    summary:
      "Une extension Raycast qui détoure l'image sélectionnée dans le Finder et l'enregistre à côté. Le modèle tourne en local, sans passer par un service en ligne : les photos ne quittent jamais la machine.",
    year: "2025",
    role: "Conception et développement",
    stack: ["Raycast", "TypeScript", "Python", "rembg"],
    status: "live",
    section: "labo",
    accent: "#D6336C",
    href: "https://github.com/rocktane/removebg-raycast",
    hrefLabel: "github.com/rocktane/removebg-raycast",
    hrefKind: "code",
    // Une commande Raycast n'a pas d'interface à elle : le seul visuel honnête
    // est la palette au moment où on l'appelle.
    shot: "/projects/removebg.webp",
    motif: "raycast",
    pattern: "rings",
    platform: "Raycast",
  },
  {
    id: "exif-dates",
    title: "EXIF Dates",
    tagline: "Rendre aux photos leur vraie date",
    summary:
      "Un export Lightroom repart avec la date du jour et se retrouve rangé au mauvais endroit. Le champ DateTimeOriginal, lui, n'a pas bougé : il suffit de le relire et de le réappliquer au fichier. Deux entrées pour le même traitement — un script Lightroom qui s'exécute automatiquement en sortie d'export, et une extension Raycast pour rattraper à la main des fichiers déjà sortis.",
    year: "2026",
    role: "Conception et développement",
    stack: ["Lua", "Lightroom SDK", "Raycast", "TypeScript", "exifr"],
    status: "live",
    section: "labo",
    accent: "#7C3AED",
    motif: "raycast",
    pattern: "diagonals",
    platform: "Lightroom & Raycast",
  },
  {
    id: "geeft",
    title: "Geeft",
    tagline: "Trouver le cadeau parfait",
    summary:
      "Une plateforme de recommandation de cadeaux, premier projet de fin de bootcamp. Arrêtée depuis.",
    year: "2023",
    role: "Développement",
    stack: ["Ruby on Rails", "JavaScript", "SQL"],
    status: "sunset",
    section: "archives",
    accent: "#7A7A8C",
    href: "https://www.geeft.club",
    hrefLabel: "geeft.club",
    hrefKind: "site",
  },
];

/** Ordre du carrousel d'accueil : du plus abouti au plus personnel. */
export const HERO_ORDER = [
  "safee",
  "brower",
  "exo",
  "tvcal",
  "cashou",
  "amp",
] as const;

export const heroProjects: Project[] = HERO_ORDER.map(
  (id) => projects.find((p) => p.id === id)!,
);

export const featuredProjects = projects.filter((p) => p.section === "projets");
export const labProjects = projects.filter((p) => p.section === "labo");
export const archivedProjects = projects.filter((p) => p.section === "archives");

/** Le parcours, du plus ancien au plus récent. */
export const credits: CreditLine[] = [
  { role: "Formation", value: "ESTP Paris — Ingénieur" },
  { role: "Avant", value: "5 ans — Construction durable" },
  { role: "Reconversion", value: "Le Wagon — 2023" },
  { role: "Aujourd'hui", value: "Safee — Alternance" },
  { role: "En cours", value: "Epitech — Architecte SI, 2026" },
];

/**
 * La stack, groupée par domaine plutôt qu'en bandeau défilant.
 * Chaque ligne se limite à ce qui est effectivement utilisé dans les dépôts —
 * une liste qu'on ne peut pas défendre en entretien ne sert personne.
 */
export const technicalCredits: CreditLine[] = [
  { role: "Front", value: "React · Next.js · Vue · TypeScript · Tailwind" },
  { role: "Back", value: "NestJS · Ruby on Rails · FastAPI · tRPC · Node" },
  { role: "Données", value: "PostgreSQL · SQLite · Prisma · Convex · Redis · SQL" },
  { role: "Mobile & natif", value: "React Native · Expo · SwiftUI · Kotlin" },
  { role: "IA & ML", value: "Python · spaCy · PyTorch · NLP · LLM" },
  { role: "Automatisation", value: "n8n · MCP · GitHub Actions" },
  { role: "Infra", value: "AWS · Terraform · Docker · Kubernetes · Vercel" },
  { role: "Tests", value: "Jest · Vitest · pytest · Playwright" },
  { role: "Design", value: "Figma · Mobbin" },
];
