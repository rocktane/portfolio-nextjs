"use client";
import { useState } from "react";
import Image from "next/image";
import { favorites } from "@/data/favorites";
import { normalizeSearch } from "@/lib/atelier";
import Icon from "./Icon";

export default function Favorites() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const categories = [...new Set(favorites.map((f) => f.category))];
  const normalized = normalizeSearch(query);
  const filtered = favorites.filter(
    (f) =>
      (!category || f.category === category) &&
      normalizeSearch(`${f.name} ${f.description} ${f.category}`).includes(
        normalized,
      ),
  );
  return (
    <section className="favorites-page">
      <div className="page-heading">
        <h1>Favoris</h1>
      </div>
      <div className="catalog-toolbar">
        <div
          className="catalog-filters"
          role="group"
          aria-label="Catégories des favoris"
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
                  ? favorites.filter((f) => f.category === value).length
                  : favorites.length}
              </span>
            </button>
          ))}
        </div>
        <label className="project-search">
          <Icon name="search" />
          <input
            type="search"
            aria-label="Rechercher un favori"
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
        {filtered.map((favorite) => (
          <li key={favorite.id} className="favorite-card">
            <Image
              className="favorite-icon"
              src={`/images/favorites/${favorite.id}.png`}
              alt=""
              width={64}
              height={64}
            />
            <div className="favorite-info">
              <h2>{favorite.name}</h2>
              <p>{favorite.description}</p>
            </div>
            <a
              className="favorite-get"
              href={favorite.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ouvrir
              <span className="sr-only"> {favorite.name}</span>
            </a>
          </li>
        ))}
      </ul>
      {!filtered.length && (
        <div className="empty-results">
          <h2>Aucun favori trouvé.</h2>
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
