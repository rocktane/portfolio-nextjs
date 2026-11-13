import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import {
  collectionNames,
  collectionPaths,
  projectPlatform,
  statusLabels,
} from "@/lib/atelier";
import Icon from "@/components/atelier/Icon";
import ProjectImage from "@/components/atelier/ProjectImage";
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params,
    p = projects.find((p) => p.id === id);
  if (!p) return { title: "Projet introuvable" };
  return {
    title: p.title,
    description: p.tagline,
    alternates: { canonical: `/projets/${id}` },
    openGraph: {
      title: p.title,
      description: p.tagline,
      url: `/projets/${id}`,
    },
  };
}
export default async function ProjectPage({ params }: Props) {
  const { id } = await params,
    p = projects.find((p) => p.id === id);
  if (!p) notFound();
  return (
    <section className="project-page" aria-label={`Projet ${p.title}`}>
      <Link className="detail-back" href={collectionPaths[p.section]}>
        <Icon name="back" />
        {collectionNames[p.section]}
      </Link>
      <div className="page-heading detail-heading">
        <div>
          <h1>{p.title}</h1>
          <p>{p.tagline}</p>
        </div>
        {p.href && p.status !== "sunset" && (
          <a
            className="solid-button"
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {p.hrefKind === "code"
              ? "Voir le code"
              : p.hrefKind === "brew"
                ? "Installation"
                : `Ouvrir ${p.title}`}
            <Icon name="arrow" />
          </a>
        )}
      </div>
      <div className="project-detail">
        <figure>
          <ProjectImage project={p} priority />
        </figure>
        <aside className="detail-metadata">
          <span className={`project-status status-${p.status}`}>
            {statusLabels[p.status]}
          </span>
          <p>{p.summary}</p>
          <dl>
            <div>
              <dt>Contribution</dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt>Technologies</dt>
              <dd>{p.stack.join(", ")}</dd>
            </div>
            <div>
              <dt>Plateforme</dt>
              <dd>{projectPlatform(p)}</dd>
            </div>
            <div>
              <dt>Période</dt>
              <dd>{p.year}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
