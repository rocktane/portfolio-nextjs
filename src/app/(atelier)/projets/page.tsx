import type { Metadata } from "next";
import ProjectCatalog from "@/components/atelier/ProjectCatalog";
import { featuredProjects } from "@/data/projects";
export const metadata: Metadata = {
  title: "Projets",
  alternates: { canonical: "/projets" },
};
export default function ProjectsPage() {
  return <ProjectCatalog title="Projets" items={featuredProjects} />;
}
