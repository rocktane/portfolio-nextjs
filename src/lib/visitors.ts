export const VISITORS_API =
  process.env.NEXT_PUBLIC_VISITORS_API ?? "https://visites.23o.dev/visitors";
export const RANGES = [
  { days: 7, label: "7 j" },
  { days: 30, label: "30 j" },
  { days: 90, label: "90 j" },
  { days: 365, label: "1 an" },
] as const;
export type RangeDays = (typeof RANGES)[number]["days"];
export type VisitorSite = {
  id: string;
  name: string;
  domain: string;
  visitors: number;
  series: number[];
};
export type VisitorsResponse = {
  generatedAt: string;
  timezone: string;
  days: number;
  dates: string[];
  sites: VisitorSite[];
  unavailable?: string[];
};
// Couleur fixée par site (jamais par rang) : palette catégorielle validée.
// Sites suivis, connus d'avance : leur nom s'affiche dès le chargement.
export const KNOWN_SITES = [
  { id: "portfolio", name: "Portfolio" },
  { id: "betterview", name: "BetterView" },
  { id: "akolyt", name: "akolyt" },
  { id: "frsque", name: "frsque" },
];
export const SITE_ORDER = KNOWN_SITES.map((site) => site.id);
export function siteSlot(id: string, index: number): number {
  const slot = SITE_ORDER.indexOf(id);
  return (slot === -1 ? index : slot) % 4;
}
export type ChartPoint = { start: string; end: string };
export type ChartData = {
  points: ChartPoint[];
  sites: (VisitorSite & { values: number[]; slot: number })[];
  unit: "day" | "week";
};
// Au-delà de 90 jours, les visiteurs quotidiens sont additionnés par semaine
// (en partant du jour le plus récent) pour garder une courbe lisible.
export function toChartData(data: VisitorsResponse): ChartData {
  const size = data.dates.length > 90 ? 7 : 1;
  const groups: [number, number][] = [];
  for (let end = data.dates.length; end > 0; end -= size)
    groups.unshift([Math.max(0, end - size), end]);
  const sites = [...data.sites]
    .map((site, index) => ({ ...site, slot: siteSlot(site.id, index) }))
    .sort((a, b) => a.slot - b.slot)
    .map((site) => ({
      ...site,
      values: groups.map(([from, to]) =>
        site.series.slice(from, to).reduce((sum, value) => sum + value, 0),
      ),
    }));
  return {
    points: groups.map(([from, to]) => ({
      start: data.dates[from],
      end: data.dates[to - 1],
    })),
    sites,
    unit: size === 1 ? "day" : "week",
  };
}
// Plafond « rond » de l'axe et ses graduations (4 intervalles au plus).
export function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? raw;
  const roundStep = Math.max(1, Math.ceil(step));
  const top = Math.ceil(max / roundStep) * roundStep;
  const ticks = [];
  for (let t = 0; t <= top; t += roundStep) ticks.push(t);
  return ticks;
}
const dayFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
export function formatDay(date: string): string {
  return dayFormat.format(new Date(`${date}T00:00:00Z`));
}
export function formatPoint(point: ChartPoint, unit: ChartData["unit"]) {
  return unit === "day"
    ? formatDay(point.start)
    : `${formatDay(point.start)} – ${formatDay(point.end)}`;
}
export const formatNumber = new Intl.NumberFormat("fr-FR").format;
// Tangentes d'une cubique monotone (Fritsch-Butland, comme d3.curveMonotoneX) :
// la courbe passe par chaque point sans dépasser ses voisins, donc jamais sous zéro.
function monotoneTangents(xs: number[], ys: number[]): number[] {
  const n = xs.length;
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = xs[i + 1] - xs[i];
    slopes.push(dx ? (ys[i + 1] - ys[i]) / dx : 0);
  }
  return xs.map((_, i) => {
    if (i === 0) return slopes[0] ?? 0;
    if (i === n - 1) return slopes[n - 2];
    const a = slopes[i - 1];
    const b = slopes[i];
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  });
}
// Tracé SVG lissé passant par les points.
export function smoothPath(points: [number, number][]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n < 3)
    return points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("");
  const tangents = monotoneTangents(
    points.map((p) => p[0]),
    points.map((p) => p[1]),
  );
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = (x1 - x0) / 3;
    d += `C${x0 + h},${y0 + h * tangents[i]},${x1 - h},${y1 - h * tangents[i + 1]},${x1},${y1}`;
  }
  return d;
}
// Valeur de la même courbe lissée à une position t ∈ [0, 1] le long de l'axe x :
// permet de comparer des séries de longueurs différentes pendant une transition.
export function curveAt(values: number[]): (t: number) => number {
  const n = values.length;
  if (n === 0) return () => 0;
  if (n === 1) return () => values[0];
  const xs = values.map((_, i) => i);
  const m = n < 3 ? [] : monotoneTangents(xs, values);
  return (t) => {
    const u = Math.max(0, Math.min(1, t)) * (n - 1);
    const i = Math.min(n - 2, Math.floor(u));
    const s = u - i;
    const [y0, y1] = [values[i], values[i + 1]];
    if (n < 3) return y0 + (y1 - y0) * s;
    const s2 = s * s;
    const s3 = s2 * s;
    return (
      (2 * s3 - 3 * s2 + 1) * y0 +
      (s3 - 2 * s2 + s) * m[i] +
      (-2 * s3 + 3 * s2) * y1 +
      (s3 - s2) * m[i + 1]
    );
  };
}
export const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;
