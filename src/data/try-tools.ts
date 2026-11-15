import type { CatalogApp } from "@/types";
import { projects } from "./projects";

/**
 * Les applications développées par Yohan, présentées comme les favoris.
 * Les entrées marquées « privé » pointent vers un dépôt non public, celles
 * sans `url` n'ont encore aucune destination.
 */
const list: CatalogApp[] = [
  // Web
  {
    id: "exo",
    name: "Exo",
    category: "Web",
    description: "Mini-jeux quotidiens pour développeurs",
    url: "https://exo.yohan.one",
    accent: "#4F46E5",
  },
  {
    id: "brower",
    name: "Brower",
    category: "Web",
    description: "Composer son installation Homebrew",
    url: "https://bro.yohan.one",
    accent: "#2E9E6B",
  },
  {
    id: "tvcal",
    name: "tvcal",
    category: "Web",
    description: "Les dates de diffusion dans votre agenda",
    url: "https://tvcal.yohan.one",
    icon: "/images/apps/tvcal.png",
    accent: "#F35D7A",
  },
  {
    id: "snake",
    name: "Snake",
    category: "Web",
    description: "Un Snake réduit à l’essentiel",
    url: "https://snake.yohan.one",
    accent: "#E11D2E",
  },
  {
    id: "humain-vs-jev",
    name: "Humain vs Jev",
    category: "Web",
    description: "Repérer l’image générée par IA avant Jev",
    url: "https://humainvsjev.23o.dev",
    accent: "#0F766E",
  },
  {
    id: "betterdraw",
    name: "BetterDraw",
    category: "Web",
    description: "Reporter un décor mural à l’échelle",
    accent: "#DB2777",
  },
  {
    id: "woodle",
    name: "Woodle",
    category: "Web",
    description: "Réservations et records pour box CrossFit",
    url: "https://github.com/rocktane/woodle", // privé
    accent: "#EA580C",
  },

  // macOS
  {
    id: "betterbattery",
    name: "BetterBattery",
    category: "macOS",
    description: "Limiter la charge de la batterie",
    command: "brew install --cask rocktane/tap/betterbattery",
    icon: "/images/apps/betterbattery.png",
    accent: "#22B8CF",
  },
  {
    id: "betterbar",
    name: "BetterBar",
    category: "macOS",
    description: "Ranger les icônes de la barre des menus",
    url: "https://github.com/rocktane/BetterBar",
    icon: "/images/apps/betterbar.png",
    accent: "#475569",
  },
  {
    id: "betterview",
    name: "BetterView",
    category: "macOS",
    description: "Trier ses photos RAW à toute vitesse",
    url: "https://github.com/rocktane/BetterView",
    icon: "/images/apps/betterview.png",
    accent: "#1E293B",
  },
  {
    id: "mdeck",
    name: "mdeck",
    category: "macOS",
    description: "Petits utilitaires modulaires dans la menubar",
    command: "brew install --cask rocktane/tap/mdeck",
    icon: "/images/apps/mdeck.png",
    accent: "#0F172A",
  },
  {
    id: "night-shift-focus",
    name: "Night Shift Focus",
    category: "macOS",
    description: "Couper Night Shift dans les apps de couleur",
    url: "https://github.com/rocktane/mdeck#night-shift-focus",
    module: "mdeck",
    accent: "#F97316",
  },
  {
    id: "altty",
    name: "Altty",
    category: "macOS",
    description: "Alt-Tab sans les apps sans fenêtre",
    url: "https://github.com/rocktane/mdeck#altty",
    module: "mdeck",
    icon: "/images/apps/altty.png",
    accent: "#6366F1",
  },
  {
    id: "app-monitor",
    name: "App Monitor",
    category: "macOS",
    description: "CPU et mémoire, regroupés par application",
    url: "https://github.com/rocktane/mdeck#app-monitor",
    module: "mdeck",
    accent: "#0EA5E9",
  },
  {
    id: "dock-lock",
    name: "Dock Lock",
    category: "macOS",
    description: "Garder le Dock sur un seul écran",
    url: "https://github.com/rocktane/mdeck#dock-lock",
    module: "mdeck",
    accent: "#64748B",
  },
  {
    id: "keep-awake",
    name: "Keep Awake",
    category: "macOS",
    description: "Pas de veille pendant que Claude travaille",
    url: "https://github.com/rocktane/mdeck#keep-awake",
    module: "mdeck",
    accent: "#A16207",
  },
  {
    id: "clean-links",
    name: "Clean Links",
    category: "macOS",
    description: "Retirer les traqueurs des liens copiés",
    url: "https://github.com/rocktane/mdeck#clean-links",
    module: "mdeck",
    accent: "#16A34A",
  },
  {
    id: "ping",
    name: "Ping",
    category: "macOS",
    description: "La connexion, d’un point dans la menubar",
    url: "https://github.com/rocktane/mdeck#ping",
    module: "mdeck",
    accent: "#DC2626",
  },
  {
    id: "mini",
    name: "Mini",
    category: "macOS",
    description: "Lanceur et suivi de commandes en arrière-plan",
    url: "https://github.com/rocktane/mini",
    accent: "#525252",
  },
  {
    id: "amp",
    name: "Amp",
    category: "macOS",
    description: "Contrôleur Sonos natif",
    url: "https://github.com/rocktane/Amp", // privé
    accent: "#3B5BDB",
  },
  {
    id: "tamanotchi",
    name: "Tamanotchi",
    category: "macOS",
    description: "Un tamagotchi dans l’encoche du Mac",
    url: "https://github.com/rocktane/tama", // privé
    icon: "/images/apps/tamanotchi.png",
    accent: "#2BD37E",
  },

  // Raycast
  {
    id: "removebg",
    name: "RemoveBG",
    category: "Raycast",
    description: "Détourer une image dans le Finder",
    url: "https://github.com/rocktane/removebg-raycast",
    accent: "#D6336C",
  },
  {
    id: "exif-dates",
    name: "EXIF Dates",
    category: "Raycast",
    description: "Restaurer les dates EXIF après Lightroom",
    url: "https://github.com/rocktane/exif-date-updater",
    accent: "#7C3AED",
  },
  {
    id: "qrcode-scanner",
    name: "QR Code Scanner",
    category: "Raycast",
    description: "Scanner un QR code avec la caméra du Mac",
    url: "https://github.com/rocktane/qrcode-scanner-raycast",
    accent: "#111827",
  },

  // Navigateur
  {
    id: "altjump",
    name: "AltJump",
    category: "Navigateur",
    description: "Liens directs sur AlternativeTo",
    url: "https://github.com/rocktane/AltJump",
    icon: "/images/apps/altjump.png",
    accent: "#2563EB",
  },

  // Développement
  {
    id: "peeko",
    name: "Peeko",
    category: "Développement",
    description: "Claude voit votre simulateur iOS ou Android",
    url: "https://github.com/rocktane/peeko",
    accent: "#F97316",
  },
];

/** Ce que la fenêtre de détail ajoute aux cartes, quand le projet du site ne
 *  le fournit pas déjà. */
const details: Record<string, Partial<CatalogApp>> = {
  betterbattery: {
    download:
      "https://github.com/rocktane/betterbattery/releases/latest/download/BetterBattery.zip",
    platform: "macOS · Apple Silicon",
  },
  betterbar: {
    summary:
      "Un gestionnaire de barre des menus pour macOS 27. Les icônes se répartissent entre Toujours masqué, Masqué et Visible : un ⌘-glisser sur une icône affiche les séparateurs et range toute son application dans la section choisie.",
    platform: "macOS 27",
    stack: ["Swift", "AppKit"],
    year: "2026",
  },
  betterview: {
    summary:
      "Une visionneuse RAW faite pour trier des photos Sony A7C le plus vite possible : moins d'une milliseconde d'une photo à l'autre une fois préparée, suppression en une touche vers la corbeille, annulable avec ⌘Z, et historique des suppressions avec aperçu.",
    platform: "macOS",
    stack: ["Swift", "SwiftUI"],
    year: "2026",
  },
  mdeck: {
    summary:
      "Une seule application de barre des menus, plusieurs petits utilitaires. Chaque utilitaire est un module qu'on active ou non ; un module éteint ne tourne pas du tout : ni observateur, ni raccourci, ni event tap.",
    download:
      "https://github.com/rocktane/mdeck/releases/latest/download/mdeck.zip",
    platform: "macOS 13+ · Intel et Apple Silicon",
    stack: ["Swift", "AppKit"],
    year: "2026",
  },
  "night-shift-focus": {
    summary:
      "Coupe Night Shift et True Tone tant qu'une application de couleur (Lightroom, Photoshop, Figma…) est au premier plan, puis remet exactement ce qui était là en la quittant, y compris si la programmation a basculé entre-temps.",
  },
  altty: {
    summary:
      "Un sélecteur d'applications (⌥⇥ par défaut, ⌘⇥ possible) qui laisse de côté les applications sans fenêtre ouverte : fini les apps Electron qui tournent encore pour rien. Existe aussi en application autonome.",
    download:
      "https://github.com/rocktane/altty/releases/latest/download/Altty.zip",
  },
  "app-monitor": {
    summary:
      "La consommation CPU et mémoire regroupée par application, avec des jauges dans la barre des menus et un panneau qu'on peut épingler.",
  },
  "dock-lock": {
    summary:
      "Garde le Dock sur un seul écran, celui du MacBook par défaut, même avec des écrans externes : le pointeur est retenu au bord des autres écrans, et le Dock revient tout seul après un branchement ou une sortie de veille.",
  },
  "keep-awake": {
    summary:
      "Empêche la mise en veille du système ou de l'écran : sans limite, pour une durée, jusqu'à une heure donnée, ou automatiquement tant que Claude Code ou Codex travaille.",
  },
  "clean-links": {
    summary:
      "Retire les traqueurs (utm_*, fbclid, tags d'affiliation…) des liens copiés, déroule les redirections et les pages AMP, et développe les liens raccourcis.",
  },
  ping: {
    summary:
      "Pingue une adresse (1.1.1.1 par défaut) toutes les quelques secondes et affiche un point dans la barre des menus, de la couleur choisie, qui passe au rouge quand elle ne répond plus.",
  },
  "humain-vs-jev": {
    summary:
      "Un petit jeu web en cinq rounds : à chaque round, une vraie photo et une image générée par IA. Il faut repérer la fausse avant Jev, un modèle qui joue en même temps. Le tout tient dans un seul binaire Go, sans dépendance.",
    stack: ["Go", "HTML", "CSS", "JavaScript"],
    year: "2026",
  },
  peeko: {
    summary:
      "Un serveur MCP qui donne à Claude des captures du simulateur iOS, de l'émulateur Android ou d'un appareil Android branché en USB. Volontairement en lecture seule : il observe, il ne tape, ne glisse et ne saisit jamais rien.",
    platform: "MCP · iOS · Android",
    stack: ["TypeScript", "Bun", "MCP"],
    year: "2026",
  },
  altjump: {
    summary:
      "Une extension de navigateur qui ajoute des boutons « Visiter » directs sur les fiches d'AlternativeTo, pour aller au site d'un logiciel sans passer par sa page intermédiaire.",
    platform: "Chrome",
    stack: ["JavaScript"],
  },
  "qrcode-scanner": {
    summary:
      "Une extension Raycast qui scanne un QR code avec la caméra du MacBook et en récupère le contenu.",
    platform: "Raycast · macOS",
    stack: ["Raycast", "TypeScript"],
  },
  mini: {
    summary:
      "Un lanceur de commandes longues : on les envoie en arrière-plan, Mini suit leur sortie, leur consommation et prévient à la fin.",
    platform: "macOS",
    stack: ["Swift", "AppKit"],
  },
  woodle: {
    summary:
      "Une application de gestion de box CrossFit : réservations de cours, records personnels et suivi des adhérents.",
  },
  betterdraw: {
    summary:
      "Dessiner à l'échelle un décor mural, le peindre zone par zone, puis le reporter sur le vrai mur grâce à une grille de carroyage cotée.",
  },
};

export const tryTools: CatalogApp[] = list.map((app) => {
  const project = projects.find((p) => p.id === app.id);
  const extra = details[app.id] ?? {};
  const host = app.module ? list.find((a) => a.id === app.module) : undefined;
  const url = app.url;
  return {
    ...app,
    summary: project?.summary,
    stack: project?.stack ?? (host && details[host.id]?.stack),
    shot: project?.shot,
    year: project?.year ?? (host && details[host.id]?.year),
    platform:
      project?.platform ??
      (project?.section === "projets" ? "Web" : undefined) ??
      (host && details[host.id]?.platform) ??
      app.category,
    site: url && !url.includes("github.com") ? url : undefined,
    github: url?.includes("github.com") ? url : undefined,
    ...extra,
  };
});
