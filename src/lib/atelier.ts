import type { Project, ProjectSection } from "@/types";
export const collectionPaths: Record<ProjectSection, string> = {
  projets: "/projets",
  labo: "/labo",
  archives: "/archives",
};
export const collectionNames: Record<ProjectSection, string> = {
  projets: "Projets",
  labo: "Le labo",
  archives: "Archives",
};
export const statusLabels = {
  live: "En ligne",
  beta: "Bêta",
  wip: "En cours",
  unreleased: "Non publié",
  sunset: "Archivé",
};
export function projectPlatform(project: Project): string {
  if (project.platform?.includes("Raycast")) return "Raycast";
  if (project.platform) return project.platform;
  if (project.stack.some((s) => s === "React Native" || s === "Expo"))
    return "Mobile";
  if (project.stack.some((s) => s === "SwiftUI" || s === "Swift"))
    return "macOS";
  if (project.id === "travel-resolver") return "IA";
  return "Web";
}
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
}
