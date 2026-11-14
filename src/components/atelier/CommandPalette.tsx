"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { projects } from "@/data/projects";
import { normalizeSearch } from "@/lib/atelier";
import Icon from "./Icon";
const pages = [
  ["Accueil", "/"],
  ["Projets", "/projets"],
  ["À essayer", "/a-essayer"],
  ["Le labo", "/labo"],
  ["Favoris", "/favoris"],
  ["Parcours", "/parcours"],
  ["Archives", "/archives"],
  ["Contact", "/contact"],
];
const entries = [
  ...pages.map(([label, href]) => ({
    label,
    href,
    detail: "Page",
    terms: label,
  })),
  ...projects.map((p) => ({
    label: p.title,
    href: `/projets/${p.id}`,
    detail: p.stack.join(", "),
    terms: [p.title, p.tagline, ...p.stack].join(" "),
  })),
  {
    label: "Ouvrir le CV",
    href: "/CV-20260409.pdf",
    detail: "PDF",
    terms: "cv curriculum vitae recruteur",
    external: true,
  },
  {
    label: "Copier l’e-mail",
    href: "",
    detail: "dev@yohangouiran.com",
    terms: "mail email contact copier",
    copy: true,
  },
];
export default function CommandPalette() {
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const filtered = entries.filter((entry) =>
    normalizeSearch(entry.terms).includes(normalizeSearch(query)),
  );
  const open = useCallback(() => {
    if (dialog.current?.open) return;
    opener.current = document.activeElement as HTMLElement;
    setQuery("");
    setSelected(0);
    setMessage("");
    dialog.current?.showModal();
    search.current?.focus();
  }, []);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [open]);
  useEffect(() => {
    if (dialog.current?.open)
      document
        .getElementById(`command-result-${selected}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [selected]);
  async function choose(entry: (typeof entries)[number]) {
    if ("copy" in entry && entry.copy) {
      try {
        await navigator.clipboard.writeText("dev@yohangouiran.com");
        setMessage("Adresse copiée.");
      } catch {
        setMessage("Copie indisponible. Adresse : dev@yohangouiran.com");
      }
      return;
    }
    dialog.current?.close();
    if ("external" in entry && entry.external)
      window.open(entry.href, "_blank", "noopener,noreferrer");
    else router.push(entry.href);
  }
  return (
    <>
      <button
        className="command-trigger"
        onClick={open}
        aria-haspopup="dialog"
        aria-controls="command-palette"
        aria-label="Rechercher dans le portfolio"
      >
        <Icon name="search" />
        <span>Rechercher</span>
        <kbd>⌘K</kbd>
      </button>
      <dialog
        id="command-palette"
        className="command-dialog"
        ref={dialog}
        aria-labelledby="command-title"
        onClose={() => opener.current?.focus()}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            dialog.current?.close();
        }}
      >
        <div className="command-heading">
          <h2 id="command-title">Rechercher</h2>
          <button
            onClick={() => dialog.current?.close()}
            aria-label="Fermer la recherche"
          >
            Échap
          </button>
        </div>
        <label className="command-search">
          <Icon name="search" />
          <input
            ref={search}
            type="search"
            role="combobox"
            aria-label="Rechercher une page, un projet ou une technologie"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls="command-results"
            aria-activedescendant={
              filtered[selected] ? `command-result-${selected}` : undefined
            }
            placeholder="Page, projet, technologie…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(0);
              setMessage("");
            }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Escape") {
                event.preventDefault();
                dialog.current?.close();
                return;
              }
              if (
                (event.key === "ArrowDown" || event.key === "ArrowUp") &&
                filtered.length
              ) {
                event.preventDefault();
                setSelected(
                  (index) =>
                    (index +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      filtered.length) %
                    filtered.length,
                );
              } else if (event.key === "Enter" && filtered[selected]) {
                event.preventDefault();
                void choose(filtered[selected]);
              }
            }}
          />
        </label>
        <ul
          id="command-results"
          className="command-results"
          role="listbox"
          aria-label="Résultats"
        >
          {filtered.map((entry, index) => (
            <li key={entry.label} role="presentation">
              <button
                role="option"
                id={`command-result-${index}`}
                aria-selected={index === selected}
                tabIndex={-1}
                onClick={() => void choose(entry)}
                onMouseMove={() => setSelected(index)}
              >
                <span>
                  {entry.label}
                  <small>{entry.detail}</small>
                </span>
                <Icon name="arrow" />
              </button>
            </li>
          ))}
        </ul>
        {!filtered.length && <p className="command-empty">Aucun résultat.</p>}
        <p className="command-feedback" role="status">
          {message}
        </p>
      </dialog>
    </>
  );
}
