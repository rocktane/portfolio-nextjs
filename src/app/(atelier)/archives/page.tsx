import type { Metadata } from "next";
import ProjectCatalog from "@/components/atelier/ProjectCatalog";
import { archivedProjects } from "@/data/projects";
export const metadata: Metadata = {
  title: "Archives",
  alternates: { canonical: "/archives" },
};
export default function ArchivesPage() {
  return <ProjectCatalog title="Archives" items={archivedProjects} />;
}
