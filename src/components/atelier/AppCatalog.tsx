"use client";
import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { CatalogApp } from "@/types";
import { normalizeSearch } from "@/lib/atelier";
import CatalogFilters from "./CatalogFilters";
import Icon from "./Icon";
import AppModal from "./AppModal";

type Props = {
  title: string;
  apps: CatalogApp[];
  /** Nom court des éléments, pour les libellés : « favori », « application ». */
  noun: string;
  emptyTitle: string;
};

export default function AppCatalog({ title, apps, noun, emptyTitle }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    const sync = () =>
      setSelectedId(new URLSearchParams(location.search).get("app"));
    sync();
    addEventListener("popstate", sync);
    return () => removeEventListener("popstate", sync);
  }, []);
  function select(id: string | null) {
    setSelectedId(id);
    setCopied(null);
    setMessage("");
    const url = new URL(location.href);
    if (id) url.searchParams.set("app", id);
    else url.searchParams.delete("app");
    history.replaceState(history.state, "", url);
  }
  const selected = apps.find((app) => app.id === selectedId);
  const hosts = new Map(apps.map((app) => [app.id, app]));
  const categories = [...new Set(apps.map((app) => app.category))];
  const normalized = normalizeSearch(query);
  const filtered = apps.filter(
    (app) =>
      (!category || app.category === category) &&
      normalizeSearch(
        `${app.name} ${app.description} ${app.category}`,
      ).includes(normalized),
  );
  async function copy(app: CatalogApp, command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(app.id);
      setMessage("");
    } catch {
      setCopied(null);
      setMessage(`Copie indisponible. Commande : ${command}`);
    }
  }
  return (
    <section className="favorites-page">
      <div className="page-heading">
        <h1>{title}</h1>
      </div>
      <div className="catalog-toolbar">
        <CatalogFilters
          label={`Catégories : ${title}`}
          value={category}
          onChange={setCategory}
          options={["", ...categories].map((value) => ({
            value,
            label: value || "Tous",
            count: value
              ? apps.filter((app) => app.category === value).length
              : apps.length,
          }))}
        />
        <label className="project-search">
          <Icon name="search" />
          <input
            type="search"
            aria-label={`Rechercher un ${noun}`}
            placeholder="Rechercher une application…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {filtered.length} application{filtered.length > 1 ? "s" : ""}
      </p>
      <ul className="favorites-grid">
        {filtered.map((app) => (
          <li key={app.id} className="favorite-card">
            {app.icon ? (
              <Image
                className="favorite-icon"
                src={app.icon}
                alt=""
                width={64}
                height={64}
              />
            ) : (
              <span
                className="favorite-icon favorite-monogram"
                style={{ "--app-accent": app.accent } as CSSProperties}
                aria-hidden="true"
              >
                {app.name.charAt(0)}
              </span>
            )}
            <div className="favorite-info">
              <div className="favorite-title">
                <h2>{app.name}</h2>
                {app.module && <ModuleBadge host={hosts.get(app.module)} />}
              </div>
              <p>{app.description}</p>
            </div>
            <button
              type="button"
              className="favorite-get"
              aria-haspopup="dialog"
              onClick={() => select(app.id)}
            >
              Détails<span className="sr-only"> de {app.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <AppModal
          app={selected}
          apps={apps}
          copied={copied}
          message={message}
          onCopy={copy}
          onSelect={select}
          onClose={() => select(null)}
        />
      )}
      {!filtered.length && (
        <div className="empty-results">
          <h2>{emptyTitle}</h2>
          <button
            type="button"
            className="outline-button"
            onClick={() => {
              setQuery("");
              setCategory("");
            }}
          >
            Réinitialiser la recherche
          </button>
        </div>
      )}
    </section>
  );
}

function ModuleBadge({ host }: { host?: CatalogApp }) {
  if (!host) return null;
  return (
    <span className="app-module-badge" title={`Module de ${host.name}`}>
      <span className="sr-only">Module de </span>
      {host.icon && <Image src={host.icon} alt="" width={20} height={20} />}
      <strong>{host.name}</strong>
    </span>
  );
}
