"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/types";
import { normalizeSearch, projectPlatform, statusLabels } from "@/lib/atelier";
import Icon from "./Icon";
import ProjectImage from "./ProjectImage";
type CatalogProps = { items: Project[]; title: string };
export default function ProjectCatalog(props: CatalogProps) {
  return (
    <Suspense fallback={<CatalogView {...props} search="" />}>
      <LiveCatalog {...props} />
    </Suspense>
  );
}
function LiveCatalog(props: CatalogProps) {
  const params = useSearchParams();
  return <CatalogView {...props} search={params.toString()} />;
}
function CatalogView({
  items,
  title,
  search,
}: CatalogProps & { search: string }) {
  const params = new URLSearchParams(search),
    query = params.get("q") ?? "",
    view = params.get("vue") === "liste" ? "liste" : "grille";
  // URL updates are transitions; keep typing synchronous so React never resets the caret.
  const [text, setText] = useState(query);
  const [observedQuery, setObservedQuery] = useState(query);
  if (query !== observedQuery) {
    setObservedQuery(query);
    if (text !== query) setText(query);
  }
  const platforms = [...new Set(items.map(projectPlatform))];
  const category = platforms.includes(params.get("plateforme") ?? "")
    ? params.get("plateforme")!
    : "Tous";
  const normalized = normalizeSearch(query);
  const filtered = items.filter(
    (p) =>
      (category === "Tous" || projectPlatform(p) === category) &&
      normalizeSearch(
        [p.title, p.tagline, ...p.stack, projectPlatform(p)].join(" "),
      ).includes(normalized),
  );
  function update(key: string, value: string) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    const suffix = next.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (suffix ? "?" + suffix : ""),
    );
  }
  function reset() {
    window.history.replaceState(null, "", window.location.pathname);
  }
  return (
    <>
      <div className="page-heading">
        <h1>{title}</h1>
        <div
          className="view-switch"
          role="group"
          aria-label="Présentation des projets"
        >
          {(["grille", "liste"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-label={`Vue ${mode}`}
              aria-pressed={view === mode}
              onClick={() => update("vue", mode === "grille" ? "" : mode)}
            >
              <Icon name={mode === "grille" ? "grid" : "list"} />
            </button>
          ))}
        </div>
      </div>
      <div className="catalog-toolbar">
        {platforms.length > 1 && (
          <div
            className="catalog-filters"
            role="group"
            aria-label="Filtrer par plateforme"
          >
            {["Tous", ...platforms].map((platform) => (
              <button
                key={platform}
                type="button"
                aria-pressed={category === platform}
                onClick={() =>
                  update("plateforme", platform === "Tous" ? "" : platform)
                }
              >
                {platform}
                <span>
                  {platform === "Tous"
                    ? items.length
                    : items.filter((p) => projectPlatform(p) === platform)
                        .length}
                </span>
              </button>
            ))}
          </div>
        )}
        <label className="project-search">
          <Icon name="search" />
          <input
            type="search"
            aria-label="Rechercher un projet"
            placeholder="Rechercher un projet…"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              update("q", e.target.value);
            }}
          />
        </label>
      </div>
      <p className="results-meta" role="status" aria-live="polite">
        {filtered.length} projet{filtered.length > 1 ? "s" : ""}
      </p>
      <div className={`project-grid${view === "liste" ? " project-list" : ""}`}>
        {filtered.map((p, index) => (
          <article className="project-card" key={p.id}>
            <Link
              className="project-shot"
              href={`/projets/${p.id}`}
              aria-label={`Voir le projet ${p.title}`}
            >
              <ProjectImage project={p} priority={index < 2} />
              <span className="project-open" aria-hidden="true">
                <Icon name="arrow" />
              </span>
            </Link>
            <div className="project-card-info">
              <div className="project-card-heading">
                <h2>
                  <Link href={`/projets/${p.id}`}>{p.title}</Link>
                </h2>
                <span className={`project-status status-${p.status}`}>
                  {statusLabels[p.status]}
                </span>
              </div>
              <p>{p.tagline}</p>
              <div className="project-card-bottom">
                <ul
                  className="project-technologies"
                  aria-label={`Technologies de ${p.title}`}
                >
                  {p.stack.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
                {p.href && p.status !== "sunset" && (
                  <a href={p.href} target="_blank" rel="noopener noreferrer">
                    {p.hrefKind === "code" ? "Code" : "Ouvrir"}
                    <Icon name="arrow" />
                    <span className="sr-only">
                      {" "}
                      {p.title} dans un nouvel onglet
                    </span>
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
        {!filtered.length && (
          <div className="empty-results">
            <Icon name="search" />
            <h2>Aucun projet trouvé.</h2>
            <button className="outline-button" type="button" onClick={reset}>
              Réinitialiser la recherche
            </button>
          </div>
        )}
      </div>
    </>
  );
}
