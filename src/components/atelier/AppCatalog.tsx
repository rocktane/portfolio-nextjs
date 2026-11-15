"use client";
import { useState, type CSSProperties } from "react";
import Image from "next/image";
import type { CatalogApp } from "@/types";
import { normalizeSearch } from "@/lib/atelier";
import Icon from "./Icon";

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
      setMessage(`Commande ${app.name} copiée.`);
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
        <div
          className="catalog-filters"
          role="group"
          aria-label={`Catégories : ${title}`}
        >
          {["", ...categories].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {value || "Tous"}
              <span>
                {value
                  ? apps.filter((app) => app.category === value).length
                  : apps.length}
              </span>
            </button>
          ))}
        </div>
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
            {app.command ? (
              <button
                type="button"
                className="favorite-get"
                title={app.command}
                onClick={() => void copy(app, app.command!)}
              >
                {copied === app.id ? "Copié" : "Copier"}
                <span className="sr-only"> la commande {app.name}</span>
              </button>
            ) : app.url ? (
              <a
                className="favorite-get"
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir
                <span className="sr-only"> {app.name}</span>
              </a>
            ) : (
              <span className="favorite-get favorite-soon">Bientôt</span>
            )}
          </li>
        ))}
      </ul>
      <p className="tool-feedback" role="status">
        {message}
      </p>
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
