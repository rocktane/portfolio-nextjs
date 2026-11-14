import { type CareerEntry } from "@/data/career";
import { normalizeSearch } from "./atelier";

export const careerProperties = [
  { key: "title", label: "Expérience / formation", icon: "Aa", width: 320 },
  { key: "organization", label: "Organisme", icon: "↗", width: 160 },
  { key: "kind", label: "Type", icon: "≡", width: 140 },
  { key: "period", label: "Période", icon: "▦", width: 220 },
  { key: "contract", label: "Contrat", icon: "≡", width: 140 },
  { key: "domain", label: "Domaine", icon: "≡", width: 200 },
  { key: "skills", label: "Compétences", icon: "≡", width: 300 },
  { key: "context", label: "Contexte", icon: "☰", width: 320 },
  { key: "contributions", label: "Contributions", icon: "☰", width: 360 },
  { key: "projects", label: "Projets liés", icon: "↗", width: 180 },
  { key: "diploma", label: "Diplôme", icon: "Aa", width: 230 },
  { key: "specialty", label: "Spécialité", icon: "Aa", width: 260 },
  { key: "team", label: "Équipe", icon: "♧", width: 240 },
  { key: "url", label: "Site", icon: "↗", width: 200 },
] as const;
export type CareerProperty = (typeof careerProperties)[number]["key"];
export type CareerFilter = {
  id: string;
  property: CareerProperty;
  operator: "contains" | "is" | "not" | "empty" | "filled";
  value: string;
};
export type CareerSort = {
  property: CareerProperty;
  direction: "asc" | "desc";
};
export function careerText(
  entry: CareerEntry,
  property: CareerProperty,
): string {
  const value = entry[property];
  return Array.isArray(value) ? value.join(", ") : value;
}
export function queryCareer(
  entries: CareerEntry[],
  query: string,
  kind: string,
  filters: CareerFilter[],
  combination: "and" | "or",
  sorts: CareerSort[],
) {
  return entries
    .filter((entry) => {
      if (kind && entry.kind !== kind) return false;
      if (
        query &&
        !normalizeSearch(
          careerProperties.map((p) => careerText(entry, p.key)).join(" "),
        ).includes(normalizeSearch(query))
      )
        return false;
      const active = filters.filter(
        (f) =>
          f.operator === "empty" || f.operator === "filled" || f.value.trim(),
      );
      const matches = active.map((f) => {
        const text = normalizeSearch(careerText(entry, f.property)),
          value = normalizeSearch(f.value);
        switch (f.operator) {
          case "empty":
            return !text;
          case "filled":
            return Boolean(text);
          case "is":
            return text === value;
          case "not":
            return text !== value;
          default:
            return text.includes(value);
        }
      });
      return (
        !matches.length ||
        (combination === "and" ? matches.every(Boolean) : matches.some(Boolean))
      );
    })
    .sort((a, b) => {
      for (const sort of sorts) {
        const av =
            sort.property === "period" ? a.start : careerText(a, sort.property),
          bv =
            sort.property === "period" ? b.start : careerText(b, sort.property);
        // Empty properties stay last, whichever direction was selected.
        if (!av && bv) return 1;
        if (av && !bv) return -1;
        const result = av.localeCompare(bv, "fr", {
          numeric: true,
          sensitivity: "base",
        });
        if (result) return sort.direction === "asc" ? result : -result;
      }
      return 0;
    });
}
