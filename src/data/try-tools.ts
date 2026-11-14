import { projects } from "./projects";

const selection = [
  {
    id: "exo",
    description: "Mini-jeux pour développeurs",
    action: "Ouvrir",
    constraint: "Web",
  },
  {
    id: "snake",
    description: "Jouer dans le navigateur",
    action: "Ouvrir",
    constraint: "Web",
  },
  {
    id: "brower",
    description: "Sélectionner ses applications Homebrew",
    action: "Ouvrir",
    constraint: "macOS · Homebrew",
  },
  {
    id: "tvcal",
    description: "Les dates de diffusion dans votre agenda",
    action: "Composer son flux",
    constraint: "Calendrier ICS",
  },
  {
    id: "betterbattery",
    description: "Limiter la charge de la batterie",
    action: "Copier la commande",
    constraint: "macOS · Apple Silicon",
    command: "brew install --cask rocktane/tap/betterbattery",
  },
  {
    id: "removebg",
    description: "Détourer une image dans le Finder",
    action: "Voir l’installation",
    constraint: "Raycast · macOS",
  },
  {
    id: "exif-dates",
    description: "Restaurer les dates EXIF des fichiers",
    action: "Voir l’installation",
    constraint: "Lightroom · Raycast",
  },
];
export const tryTools = selection.map((item) => {
  const project = projects.find((project) => project.id === item.id);
  if (!project?.href) throw new Error(`Missing tool destination: ${item.id}`);
  return { ...item, project, href: project.href };
});
