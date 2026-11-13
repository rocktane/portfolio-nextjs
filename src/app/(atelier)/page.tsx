import ProjectCatalog from "@/components/atelier/ProjectCatalog";
import { featuredProjects } from "@/data/projects";
export default function ProjectsPage() {
  return <ProjectCatalog title="Projets" items={featuredProjects} />;
}
