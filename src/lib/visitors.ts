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
export const SITE_ORDER = ["portfolio", "betterview", "akolyt", "frsque"];
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
// Écarte verticalement des étiquettes (y triés) d'au moins `gap` px,
// en restant dans [min, max].
export function spreadLabels(
  ys: number[],
  gap: number,
  min: number,
  max: number,
): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++)
    order[k].y = Math.max(order[k].y, order[k - 1].y + gap);
  const overflow = order.length ? order[order.length - 1].y - max : 0;
  if (overflow > 0) for (const o of order) o.y -= overflow;
  for (let k = 0; k < order.length; k++)
    order[k].y = Math.max(order[k].y, k === 0 ? min : order[k - 1].y + gap);
  const out = new Array<number>(ys.length);
  for (const o of order) out[o.i] = o.y;
  return out;
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
