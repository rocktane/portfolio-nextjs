"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { career, type CareerEntry } from "@/data/career";
import { projects } from "@/data/projects";
import {
  careerProperties,
  careerText,
  queryCareer,
  type CareerProperty,
  type CareerFilter,
  type CareerSort,
} from "@/lib/career";
import WorkspaceDialog from "./WorkspaceDialog";
import Icon from "./Icon";
import CareerPopover from "./CareerPopover";
import { normalizeSearch } from "@/lib/atelier";

const defaults: CareerProperty[] = [
  "title",
  "organization",
  "kind",
  "period",
  "contract",
  "domain",
  "skills",
  "projects",
];
const domainColors: Record<string, string> = {
  Développement: "green",
  "Informatique & IA": "purple",
  "IA & automatisation": "pink",
  Enseignement: "blue",
  "Construction durable": "orange",
  "Construction & transport": "yellow",
};
function PropertySelect({
  value,
  onChange,
  label,
}: {
  value: CareerProperty;
  onChange: (value: CareerProperty) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as CareerProperty)}
    >
      {careerProperties.map((p) => (
        <option key={p.key} value={p.key}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
function PropertyValue({
  entry,
  property,
  expanded = false,
}: {
  entry: CareerEntry;
  property: CareerProperty;
  expanded?: boolean;
}): ReactNode {
  if (property === "kind" || property === "contract" || property === "domain") {
    const text = careerText(entry, property);
    return text ? (
      <span
        className={`notion-tag notion-tag-${property === "kind" ? (entry.kind === "Formation" ? "blue" : "orange") : property === "domain" ? (domainColors[entry.domain] ?? "gray") : "gray"}`}
      >
        {text}
      </span>
    ) : (
      <span className="notion-empty">—</span>
    );
  }
  if (property === "skills")
    return (
      <span className="notion-tags">
        {entry.skills.map((skill) => (
          <span className="notion-tag notion-tag-gray" key={skill}>
            {skill}
          </span>
        ))}
      </span>
    );
  if (property === "projects")
    return entry.projects.length ? (
      <span className="notion-relations">
        {entry.projects.map((id) => (
          <Link href={`/projets/${id}`} key={id}>
            <Icon name="file" />
            {projects.find((p) => p.id === id)?.title ?? id}
          </Link>
        ))}
      </span>
    ) : (
      <span className="notion-empty">—</span>
    );
  if (property === "url")
    return entry.url ? (
      <a
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        className="notion-link"
      >
        {new URL(entry.url).hostname}
        <Icon name="arrow" />
      </a>
    ) : (
      <span className="notion-empty">—</span>
    );
  if (property === "contributions" && expanded && entry.contributions.length)
    return (
      <ul className="notion-contributions">
        {entry.contributions.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    );
  return careerText(entry, property) || <span className="notion-empty">—</span>;
}
export default function CareerDatabase() {
  const [kind, setKind] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CareerFilter[]>([]);
  const [combination, setCombination] = useState<"and" | "or">("and");
  const [sorts, setSorts] = useState<CareerSort[]>([]);
  const [visible, setVisible] = useState<CareerProperty[]>(defaults);
  const [panel, setPanel] = useState<"filters" | "sorts" | null>(null);
  const [controlMode, setControlMode] = useState<"pick" | "edit" | "advanced">(
    "pick",
  );
  const [propertyQuery, setPropertyQuery] = useState("");
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [controlAnchor, setControlAnchor] = useState<HTMLElement | null>(null);
  const [propertiesAnchor, setPropertiesAnchor] = useState<HTMLElement | null>(
    null,
  );
  const propertiesOpen = propertiesAnchor !== null;
  const [visiblePropertyQuery, setVisiblePropertyQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);
  const [selected, setSelected] = useState<CareerEntry | null>(null);
  const rows = queryCareer(career, query, kind, filters, combination, sorts);
  function updateFilter(id: string, changes: Partial<CareerFilter>) {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...changes } : f)));
  }
  function reset() {
    setQuery("");
    setFilters([]);
  }
  function openControl(
    type: "filters" | "sorts",
    anchor: HTMLElement,
    mode: "pick" | "edit" | "advanced" = "pick",
  ) {
    setControlAnchor(anchor);
    setPanel(type);
    setControlMode(mode);
    setPropertyQuery("");
  }
  function chooseProperty(property: CareerProperty) {
    if (panel === "sorts") {
      setSorts([
        ...sorts.filter((s) => s.property !== property),
        { property, direction: property === "period" ? "desc" : "asc" },
      ]);
    } else {
      const id = crypto.randomUUID();
      setFilters([
        ...filters,
        {
          id,
          property,
          operator: ["organization", "kind", "domain", "contract"].includes(
            property,
          )
            ? "is"
            : "contains",
          value: "",
        },
      ]);
      setActiveFilterId(id);
    }
    setControlMode("edit");
    setPropertyQuery("");
  }
  return (
    <section
      className="notion-workspace"
      aria-label="Base de données du parcours"
    >
      <header className="notion-page-heading">
        <div className="page-heading notion-title-row">
          <h1>Parcours</h1>
          <a
            href="/CV-20260409.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="notion-cv"
          >
            Ouvrir le CV <Icon name="arrow" />
          </a>
        </div>
      </header>
      <div className="notion-database-title">
        <Icon name="briefcase" />
        <h2>Expériences & formations</h2>
      </div>
      <div className="notion-toolbar">
        <div
          className="notion-views"
          role="tablist"
          aria-label="Vues du parcours"
        >
          {[
            ["", "Tout le parcours"],
            ["Expérience", "Expériences"],
            ["Formation", "Formations"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              role="tab"
              tabIndex={kind === value ? 0 : -1}
              aria-selected={kind === value}
              aria-controls="career-table"
              id={`career-tab-${value || "all"}`}
              onClick={() => setKind(value)}
              onKeyDown={(event) => {
                const values = ["", "Expérience", "Formation"];
                const current = values.indexOf(value);
                const next =
                  event.key === "ArrowRight"
                    ? (current + 1) % values.length
                    : event.key === "ArrowLeft"
                      ? (current + values.length - 1) % values.length
                      : event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? values.length - 1
                          : -1;
                if (next < 0) return;
                event.preventDefault();
                setKind(values[next]);
                event.currentTarget.parentElement
                  ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                  [next]?.focus();
              }}
            >
              <Icon
                name={
                  value === "Formation"
                    ? "graduation"
                    : value === "Expérience"
                      ? "briefcase"
                      : "table"
                }
              />
              {label}
            </button>
          ))}
        </div>
        <div className="notion-tools">
          <button
            type="button"
            aria-label="Filtrer"
            aria-haspopup="dialog"
            title="Filtrer"
            aria-expanded={panel === "filters"}
            aria-controls="notion-filters"
            className={panel === "filters" || filters.length ? "is-active" : ""}
            onClick={(event) => {
              if (panel === "filters") setPanel(null);
              else openControl("filters", event.currentTarget);
            }}
          >
            <Icon name="filter" />
            {filters.length > 0 && (
              <span className="notion-tool-count">{filters.length}</span>
            )}
          </button>
          {searchOpen && (
            <label className="notion-inline-search" id="notion-search">
              <input
                ref={searchInput}
                type="search"
                value={query}
                placeholder="Rechercher…"
                aria-label="Rechercher dans le parcours"
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setQuery("");
                    setSearchOpen(false);
                    searchTrigger.current?.focus();
                  }
                }}
              />
            </label>
          )}
          <button
            ref={searchTrigger}
            type="button"
            aria-label="Rechercher dans le parcours"
            title="Rechercher"
            aria-expanded={searchOpen}
            aria-controls="notion-search"
            className={searchOpen || query ? "is-active" : ""}
            onClick={() => {
              setSearchOpen(!searchOpen);
              if (searchOpen) setQuery("");
            }}
          >
            <Icon name="search" />
          </button>
          <button
            type="button"
            aria-label="Propriétés"
            title="Propriétés"
            aria-expanded={propertiesOpen}
            aria-controls="notion-properties"
            className={propertiesOpen ? "is-active" : ""}
            aria-haspopup="dialog"
            onClick={(event) => {
              setPropertiesAnchor(propertiesOpen ? null : event.currentTarget);
              setVisiblePropertyQuery("");
            }}
          >
            <Icon name="sliders" />
          </button>
        </div>
      </div>
      {(sorts.length > 0 || filters.length > 0) && (
        <div className="notion-query-bar" aria-label="Filtres et tris actifs">
          {sorts.map((sort, index) => (
            <div
              className="notion-view-chip notion-sort-chip"
              key={`${sort.property}-${index}`}
            >
              <button
                type="button"
                aria-label={`Modifier le tri ${index + 1}`}
                onClick={(event) =>
                  openControl("sorts", event.currentTarget, "edit")
                }
              >
                <span aria-hidden="true">
                  {sort.direction === "asc" ? "↑" : "↓"}
                </span>
                {careerProperties.find((p) => p.key === sort.property)?.label}
                <span aria-hidden="true">⌄</span>
              </button>
            </div>
          ))}
          {filters.map((filter, index) => (
            <div
              className="notion-view-chip notion-filter-chip"
              key={filter.id}
            >
              <button
                type="button"
                aria-label={`Modifier le filtre ${index + 1}`}
                onClick={(event) => {
                  setActiveFilterId(filter.id);
                  openControl("filters", event.currentTarget, "edit");
                }}
              >
                {careerProperties.find((p) => p.key === filter.property)?.label}
                {filter.value
                  ? ` : ${filter.value}`
                  : filter.operator === "empty"
                    ? " : vide"
                    : filter.operator === "filled"
                      ? " : renseigné"
                      : ""}
                <span aria-hidden="true">⌄</span>
              </button>
              <button
                type="button"
                aria-label={`Retirer le filtre ${index + 1}`}
                onClick={() =>
                  setFilters(filters.filter((f) => f.id !== filter.id))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {panel && (
        <CareerPopover
          id={`notion-${panel}`}
          key={`${panel}-${controlMode}-${activeFilterId ?? ""}`}
          anchor={controlAnchor}
          title={
            panel === "filters" ? "Filtrer le parcours" : "Trier le parcours"
          }
          onClose={() => setPanel(null)}
        >
          {controlMode === "pick" ? (
            <>
              <input
                className="notion-property-search"
                type="search"
                aria-label={
                  panel === "filters"
                    ? "Rechercher une propriété à filtrer"
                    : "Rechercher une propriété à trier"
                }
                placeholder={
                  panel === "filters" ? "Filtrer par…" : "Trier par…"
                }
                value={propertyQuery}
                onChange={(e) => setPropertyQuery(e.target.value)}
              />
              <div className="notion-property-options">
                {careerProperties
                  .filter((p) =>
                    normalizeSearch(p.label).includes(
                      normalizeSearch(propertyQuery),
                    ),
                  )
                  .map((p) => (
                    <button
                      type="button"
                      key={p.key}
                      onClick={() => chooseProperty(p.key)}
                    >
                      <span className="notion-property-icon" aria-hidden="true">
                        {p.icon}
                      </span>
                      {p.label}
                    </button>
                  ))}
              </div>
              {careerProperties.filter((p) =>
                normalizeSearch(p.label).includes(
                  normalizeSearch(propertyQuery),
                ),
              ).length === 0 && (
                <p className="notion-property-no-results">
                  Aucune propriété trouvée.
                </p>
              )}
              {panel === "filters" && (
                <button
                  className="notion-advanced-filter"
                  type="button"
                  onClick={() => setControlMode("advanced")}
                >
                  + Ajouter un filtre avancé
                </button>
              )}
            </>
          ) : (
            <>
              <div className="notion-panel-heading">
                <strong>
                  {panel === "filters"
                    ? controlMode === "advanced"
                      ? "Filtres avancés"
                      : "Filtrer"
                    : "Trier"}
                </strong>
                <button
                  type="button"
                  aria-label="Fermer les options"
                  onClick={() => setPanel(null)}
                >
                  ×
                </button>
              </div>
              {panel === "filters" && (
                <>
                  {controlMode === "advanced" && filters.length > 1 && (
                    <label className="notion-combination">
                      Afficher les entrées correspondant à{" "}
                      <select
                        value={combination}
                        onChange={(e) =>
                          setCombination(e.target.value as "and" | "or")
                        }
                        aria-label="Combinaison des filtres"
                      >
                        <option value="and">toutes les conditions</option>
                        <option value="or">au moins une condition</option>
                      </select>
                    </label>
                  )}
                  {filters
                    .filter(
                      (f) =>
                        controlMode === "advanced" || f.id === activeFilterId,
                    )
                    .map((f) => {
                      const index = filters.findIndex(
                        (item) => item.id === f.id,
                      );
                      return (
                        <div className="notion-rule" key={f.id}>
                          <span>
                            {index
                              ? combination === "and"
                                ? "Et"
                                : "Ou"
                              : "Où"}
                          </span>
                          <PropertySelect
                            value={f.property}
                            label={`Propriété du filtre ${index + 1}`}
                            onChange={(property) =>
                              updateFilter(f.id, { property })
                            }
                          />
                          <select
                            aria-label={`Condition du filtre ${index + 1}`}
                            value={f.operator}
                            onChange={(e) =>
                              updateFilter(f.id, {
                                operator: e.target
                                  .value as CareerFilter["operator"],
                              })
                            }
                          >
                            <option value="contains">contient</option>
                            <option value="is">est</option>
                            <option value="not">n’est pas</option>
                            <option value="empty">est vide</option>
                            <option value="filled">n’est pas vide</option>
                          </select>
                          {!["empty", "filled"].includes(f.operator) && (
                            <input
                              aria-label={`Valeur du filtre ${index + 1}`}
                              placeholder="Saisir une valeur…"
                              value={f.value}
                              onChange={(e) =>
                                updateFilter(f.id, { value: e.target.value })
                              }
                            />
                          )}
                          {controlMode === "edit" &&
                            !["empty", "filled"].includes(f.operator) && (
                              <div className="notion-value-options">
                                {[
                                  ...new Set(
                                    career
                                      .flatMap((entry) => {
                                        const value = entry[f.property];
                                        return Array.isArray(value)
                                          ? value
                                          : [value];
                                      })
                                      .filter(Boolean),
                                  ),
                                ]
                                  .filter(
                                    (value) =>
                                      !f.value ||
                                      normalizeSearch(value).includes(
                                        normalizeSearch(f.value),
                                      ),
                                  )
                                  .slice(0, 20)
                                  .map((value) => (
                                    <button
                                      type="button"
                                      key={value}
                                      onClick={() =>
                                        updateFilter(f.id, { value })
                                      }
                                    >
                                      {value}
                                    </button>
                                  ))}
                              </div>
                            )}
                          <button
                            type="button"
                            aria-label={`Supprimer le filtre ${index + 1}`}
                            onClick={() =>
                              setFilters(
                                filters.filter((other) => other.id !== f.id),
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  <div className="notion-panel-actions">
                    <button
                      type="button"
                      onClick={() => setControlMode("pick")}
                    >
                      + Ajouter un filtre
                    </button>
                    {filters.length > 0 && (
                      <button type="button" onClick={() => setFilters([])}>
                        Tout effacer
                      </button>
                    )}
                  </div>
                </>
              )}
              {panel === "sorts" && (
                <>
                  {sorts.length === 0 && (
                    <p>
                      L’ordre du parcours est conservé tant qu’aucun tri n’est
                      appliqué.
                    </p>
                  )}
                  {sorts.map((sort, index) => (
                    <div className="notion-rule" key={index}>
                      <span>{index + 1}</span>
                      <PropertySelect
                        value={sort.property}
                        label={`Propriété du tri ${index + 1}`}
                        onChange={(property) =>
                          setSorts(
                            sorts.map((s, i) =>
                              i === index ? { ...s, property } : s,
                            ),
                          )
                        }
                      />
                      <select
                        aria-label={`Sens du tri ${index + 1}`}
                        value={sort.direction}
                        onChange={(e) =>
                          setSorts(
                            sorts.map((s, i) =>
                              i === index
                                ? {
                                    ...s,
                                    direction: e.target.value as "asc" | "desc",
                                  }
                                : s,
                            ),
                          )
                        }
                      >
                        <option value="asc">Croissant ↑</option>
                        <option value="desc">Décroissant ↓</option>
                      </select>
                      <button
                        type="button"
                        aria-label={`Supprimer le tri ${index + 1}`}
                        onClick={() =>
                          setSorts(sorts.filter((_, i) => i !== index))
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="notion-panel-actions">
                    <button
                      type="button"
                      onClick={() => setControlMode("pick")}
                    >
                      + Ajouter un tri
                    </button>
                    {sorts.length > 0 && (
                      <button type="button" onClick={() => setSorts([])}>
                        Tout effacer
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </CareerPopover>
      )}
      {propertiesOpen && (
        <CareerPopover
          id="notion-properties"
          anchor={propertiesAnchor}
          title="Propriétés du parcours"
          onClose={() => setPropertiesAnchor(null)}
        >
          <div className="notion-panel-heading">
            <strong>Propriétés visibles</strong>
            <button
              type="button"
              aria-label="Fermer les propriétés"
              onClick={() => setPropertiesAnchor(null)}
            >
              ×
            </button>
          </div>
          <input
            className="notion-property-search"
            type="search"
            aria-label="Rechercher une propriété à afficher"
            placeholder="Rechercher une propriété…"
            value={visiblePropertyQuery}
            onChange={(event) => setVisiblePropertyQuery(event.target.value)}
          />
          <div className="notion-property-options notion-properties">
            {careerProperties
              .filter((p) =>
                normalizeSearch(p.label).includes(
                  normalizeSearch(visiblePropertyQuery),
                ),
              )
              .map((p) => (
                <label key={p.key}>
                  <span>
                    <span className="notion-property-icon" aria-hidden="true">
                      {p.icon}
                    </span>
                    {p.label}
                  </span>
                  <input
                    type="checkbox"
                    aria-label={p.label}
                    checked={visible.includes(p.key)}
                    disabled={p.key === "title"}
                    onChange={(e) =>
                      setVisible(
                        e.target.checked
                          ? [...visible, p.key]
                          : visible.filter((key) => key !== p.key),
                      )
                    }
                  />
                </label>
              ))}
          </div>
          <div className="notion-panel-actions">
            <button
              type="button"
              onClick={() => setVisible(careerProperties.map((p) => p.key))}
            >
              Tout afficher
            </button>
            <button type="button" onClick={() => setVisible(defaults)}>
              Vue initiale
            </button>
          </div>
        </CareerPopover>
      )}
      <div className="notion-table-surface">
        <div
          className="notion-table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Tableau du parcours, défilement horizontal"
        >
          <table
            className="notion-table"
            id="career-table"
            aria-label="Expériences et formations"
          >
            <thead>
              <tr>
                {careerProperties
                  .filter((p) => visible.includes(p.key))
                  .map((p) => (
                    <th
                      scope="col"
                      key={p.key}
                      style={{ width: p.width, minWidth: p.width }}
                      aria-sort={
                        sorts[0]?.property === p.key
                          ? sorts[0].direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        aria-label={`Trier par ${p.label}`}
                        onClick={() =>
                          setSorts([
                            {
                              property: p.key,
                              direction:
                                sorts[0]?.property === p.key &&
                                sorts[0].direction === "asc"
                                  ? "desc"
                                  : "asc",
                            },
                          ])
                        }
                      >
                        <span
                          className="notion-property-icon"
                          aria-hidden="true"
                        >
                          {p.icon}
                        </span>
                        {p.label}
                        <span className="notion-sort-mark">
                          {sorts.find((s) => s.property === p.key)
                            ?.direction === "asc"
                            ? "↑"
                            : sorts.some((s) => s.property === p.key)
                              ? "↓"
                              : "⌄"}
                        </span>
                      </button>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id} data-career-id={entry.id}>
                  {careerProperties
                    .filter((p) => visible.includes(p.key))
                    .map((p) => (
                      <td
                        key={p.key}
                        title={
                          p.key !== "title"
                            ? careerText(entry, p.key)
                            : undefined
                        }
                      >
                        {p.key === "title" ? (
                          <button
                            type="button"
                            className="notion-row-title"
                            onClick={() => setSelected(entry)}
                          >
                            <Icon name="file" />
                            <span>{entry.title}</span>
                            <span className="notion-open-label">
                              <Icon name="panel" />
                              OUVRIR
                            </span>
                          </button>
                        ) : (
                          <div className="notion-cell">
                            <PropertyValue entry={entry} property={p.key} />
                          </div>
                        )}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!rows.length && (
        <div className="notion-no-results">
          <p>Aucune entrée ne correspond à cette vue.</p>
          <button type="button" onClick={reset}>
            Réinitialiser les filtres
          </button>
        </div>
      )}
      <div className="notion-table-footer" role="status">
        {rows.length} entrée{rows.length > 1 ? "s" : ""}
        <span>
          {career.filter((e) => e.kind === "Expérience").length} expériences ·{" "}
          {career.filter((e) => e.kind === "Formation").length} formations
        </span>
      </div>
      {selected && (
        <WorkspaceDialog
          title={selected.title}
          onClose={() => setSelected(null)}
          className="notion-dialog"
        >
          <p className="notion-record-org">{selected.organization}</p>
          <dl className="notion-record-properties">
            {careerProperties
              .filter((p) => p.key !== "title" && p.key !== "contributions")
              .map((p) => (
                <div key={p.key}>
                  <dt>
                    <span className="notion-property-icon" aria-hidden="true">
                      {p.icon}
                    </span>
                    {p.label}
                  </dt>
                  <dd>
                    <PropertyValue entry={selected} property={p.key} expanded />
                  </dd>
                </div>
              ))}
          </dl>
          {selected.contributions.length > 0 && (
            <section className="notion-record-body">
              <h3>
                {selected.kind === "Formation"
                  ? "Travaux & apprentissages"
                  : "Contributions"}
              </h3>
              <PropertyValue
                entry={selected}
                property="contributions"
                expanded
              />
            </section>
          )}
          <Link href="/contact" className="notion-record-contact">
            Échanger sur mon parcours <Icon name="arrow" />
          </Link>
        </WorkspaceDialog>
      )}
    </section>
  );
}
