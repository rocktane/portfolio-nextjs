import type { Metadata } from "next";
import ProjectCatalog from "@/components/atelier/ProjectCatalog";
import { labProjects } from "@/data/projects";
export const metadata: Metadata = {
  title: "Le labo",
  description: "Applications macOS et expérimentations de Yohan Gouiran.",
  alternates: { canonical: "/labo" },
};
export default function LabPage() {
  return <ProjectCatalog title="Le labo" items={labProjects} />;
}
