"use client";
import { useState } from "react";
import Image from "next/image";
import { favorites } from "@/data/favorites";
import { normalizeSearch } from "@/lib/atelier";
import Icon from "./Icon";

export default function Favorites() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("selection");
  const categories = [...new Set(favorites.map((f) => f.category))];
  const filtered = favorites.filter(
    (f) =>
      (!category || f.category === category) &&
      normalizeSearch(`${f.name} ${f.description} ${f.category}`).includes(
        normalizeSearch(query),
      ),
  );
  if (sort === "name")
    filtered.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return (
    <section className="favorites-page">
      <div className="page-heading">
        <h1>Favoris</h1>
        <span className="favorites-count">{favorites.length} applications</span>
      </div>
      <div className="favorites-toolbar">
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
        <label className="favorites-sort">
          Trier
          <select
            aria-label="Trier les favoris"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="selection">Ma sélection</option>
            <option value="name">Nom A → Z</option>
          </select>
        </label>
      </div>
      <div
        className="favorites-categories"
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
            {value || "Tout"}
            <span>
              {value
                ? favorites.filter((f) => f.category === value).length
                : favorites.length}
            </span>
          </button>
        ))}
      </div>
      <p className="results-meta" role="status">
        {filtered.length} application{filtered.length > 1 ? "s" : ""}
      </p>
      <div className="favorites-grid">
        {filtered.map((favorite) => (
          <a
            key={favorite.id}
            className="favorite-card"
            href={favorite.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="favorite-icon">
              <Image
                src={`/images/favorites/${favorite.id}.png`}
                alt=""
                width={48}
                height={48}
              />
            </span>
            <span className="favorite-info">
              <span className="favorite-heading">
                <h2>{favorite.name}</h2>
                <Icon name="arrow" />
              </span>
              <span className="favorite-category">{favorite.category}</span>
              <span className="favorite-description">
                {favorite.description}
              </span>
            </span>
          </a>
        ))}
      </div>
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
      <p className="favorites-brower">
        Pour explorer d’autres applications :{" "}
        <a
          href="https://bro.yohan.one"
          target="_blank"
          rel="noopener noreferrer"
        >
          Brower <Icon name="arrow" />
        </a>
      </p>
    </section>
  );
}
