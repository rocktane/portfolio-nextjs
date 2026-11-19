"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type PointerEvent,
  type SetStateAction,
} from "react";
import {
  KNOWN_SITES,
  RANGES,
  SITE_ORDER,
  VISITORS_API,
  curveAt,
  easeOutCubic,
  formatDay,
  formatNumber,
  formatPoint,
  niceTicks,
  smoothPath,
  toChartData,
  type ChartData,
  type RangeDays,
  type VisitorsResponse,
} from "@/lib/visitors";

const PAD = { top: 16, right: 16, bottom: 30, left: 40 };
const DURATION = 650;
const SAMPLES = 180;
// Durée minimale du chargement, pour voir les courbes onduler avant qu'elles
// ne rejoignent les données (sinon elles apparaissent et changent aussitôt).
const MIN_LOADING = 1000;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const duration = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : DURATION;

// Courbe en S entre a et b : 0 avant a, 1 après b.
const smoothstep = (a: number, b: number, t: number) => {
  const u = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

// Fait progresser p de 0 à 1 (adouci) à chaque image, jusqu'à la fin de la
// transition ; `t` est le temps écoulé brut, de 0 à 1.
function animate(onFrame: (p: number, t: number) => void): () => void {
  const total = duration();
  const start = performance.now();
  let raf = requestAnimationFrame(function tick(now) {
    const p = total ? Math.min(1, (now - start) / total) : 1;
    onFrame(easeOutCubic(p), p);
    if (p < 1) raf = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(raf);
}

// Chiffre qui défile depuis la valeur affichée jusqu'à la nouvelle.
// `from` : valeur de départ à la première apparition (sinon, la valeur finale).
function AnimatedNumber({
  value,
  from = value,
}: {
  value: number;
  from?: number;
}) {
  const [shown, setShown] = useState(from);
  const current = useRef(from);
  useEffect(() => {
    const start = current.current;
    if (start === value) return;
    return animate((p) => {
      current.current = lerp(start, value, p);
      setShown(current.current);
    });
  }, [value]);
  return (
    <>
      <span aria-hidden="true">{formatNumber(Math.round(shown))}</span>
      <span className="sr-only">{formatNumber(value)}</span>
    </>
  );
}

// Forme affichée d'un graphique : plafond de l'axe et valeur de chaque série
// en tout point t ∈ [0, 1] de l'axe x.
// `axes` : graduations et dates à afficher pour cette forme (sans chart :
// chargement, lignes seules).
type Axes = { chart: ChartData | null; ticks: number[] };
type Shape = {
  top: number;
  at: (id: string, t: number) => number;
  axes: Axes;
};
function shapeOf(chart: ChartData, ticks: number[]): Shape {
  const curves = new Map(chart.sites.map((s) => [s.id, curveAt(s.values)]));
  return {
    top: ticks[ticks.length - 1],
    at: (id, t) => curves.get(id)?.(t) ?? 0,
    axes: { chart, ticks },
  };
}
function mix(a: Shape, b: Shape, p: number): Shape {
  return {
    top: lerp(a.top, b.top, p),
    at: (id, t) => lerp(a.at(id, t), b.at(id, t), p),
    axes: p < 0.5 ? a.axes : b.axes,
  };
}
type AxisLabel = {
  text: string;
  x: number;
  anchor: "start" | "middle" | "end";
};
function dateLabels(chart: ChartData | null, plotW: number): AxisLabel[] {
  if (!chart) return [];
  const n = chart.points.length;
  const count = Math.min(n, Math.max(2, Math.floor(plotW / 90)));
  const indexes = [
    ...new Set(
      Array.from({ length: count }, (_, k) =>
        Math.round((k * (n - 1)) / Math.max(1, count - 1)),
      ),
    ),
  ];
  return indexes.map((i) => ({
    text: formatDay(
      chart.unit === "day" ? chart.points[i].start : chart.points[i].end,
    ),
    x: PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW),
    anchor: i === 0 ? "start" : i === n - 1 ? "end" : "middle",
  }));
}

// Pendant le chargement : quatre courbes qui ondulent sans fin, comme au hasard
// (somme de sinus de fréquences sans rapport simple), pour la seconde `clock`.
const WANDER_TOP = 30;
const WANDER_AXES: Axes = { chart: null, ticks: [0, 10, 20, 30] };
function wanderShape(clock: number): Shape {
  return {
    top: WANDER_TOP,
    axes: WANDER_AXES,
    at: (id, t) => {
      const s = Math.max(0, SITE_ORDER.indexOf(id));
      const wave = (freq: number, speed: number, phase: number) =>
        Math.sin(2 * Math.PI * (freq * t + speed * clock + phase));
      // Valeurs basses (peu de visiteurs) : entre 0 et ~8 sur un axe à 30.
      return Math.max(
        0,
        [3, 5, 4, 2.5][s] +
          1.6 * wave(1.1, 0.13, s * 0.23) +
          1 * wave(2.3, -0.19, s * 0.57) +
          0.8 * wave(0.55, 0.07, s * 0.31),
      );
    },
  };
}
const WANDER_SITES = KNOWN_SITES.map((site, slot) => ({ ...site, slot }));

type Result = VisitorsResponse | "error";

export default function VisitorsChart() {
  const [days, setDays] = useState<RangeDays>(30);
  // Toutes les périodes sont chargées dès l'arrivée : changer de période est instantané.
  const [results, setResults] = useState<Partial<Record<RangeDays, Result>>>(
    {},
  );
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    for (const { days: range } of RANGES)
      fetch(`${VISITORS_API}?days=${range}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<VisitorsResponse>;
        })
        .then((data) => setResults((r) => ({ ...r, [range]: data })))
        .catch(() => {
          if (!controller.signal.aborted)
            setResults((r) => ({ ...r, [range]: "error" }));
        });
    return () => controller.abort();
  }, []);

  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const timer = setTimeout(
      () => setWarm(true),
      duration() === 0 ? 0 : MIN_LOADING,
    );
    return () => clearTimeout(timer);
  }, []);
  const result = warm ? results[days] : undefined;
  const data = result && result !== "error" ? result : null;
  const chart = useMemo(() => (data ? toChartData(data) : null), [data]);
  const index =
    chart && active !== null ? Math.min(active, chart.points.length - 1) : null;
  const total = data?.sites.reduce((sum, site) => sum + site.visitors, 0);
  const rangeLabel = RANGES.find((r) => r.days === days)?.label;

  return (
    <section className="stats-panel" aria-label="Visiteurs de mes sites">
      <div className="stats-toolbar">
        <p className="stats-total">
          {total === undefined ? (
            result === "error" ? (
              <span className="stats-placeholder">—</span>
            ) : (
              <span className="stats-skeleton stats-skeleton-total" />
            )
          ) : (
            <>
              <strong>
                <AnimatedNumber value={total} from={0} />
              </strong>{" "}
              visiteurs uniques sur {days === 365 ? "un an" : `${days} jours`}
            </>
          )}
        </p>
        <div className="stats-range-wrap">
          <div className="stats-range" role="group" aria-label="Période">
            {RANGES.map((range) => (
              <button
                key={range.days}
                type="button"
                aria-pressed={range.days === days}
                onClick={() => setDays(range.days)}
              >
                {range.label}
              </button>
            ))}
          </div>
          {chart && index !== null && (
            <div className="stats-tooltip" role="status">
              <strong>{formatPoint(chart.points[index], chart.unit)}</strong>
              <ul>
                {chart.sites.map((site) => (
                  <li key={site.id} data-slot={site.slot}>
                    <span className="stats-swatch" aria-hidden="true" />
                    {site.name}
                    <span>{formatNumber(site.values[index])}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {result === "error" && !chart ? (
        <div className="stats-chart stats-chart-empty" role="status">
          Statistiques indisponibles pour le moment.
        </div>
      ) : (
        <>
          <Chart
            chart={chart}
            active={index}
            onActive={setActive}
            label={`Visiteurs par site, ${rangeLabel}`}
          />
          {/* Mêmes éléments pendant le chargement et après : seuls les chiffres
              (inconnus) passent du skeleton à leur valeur. */}
          <ul className="stats-legend">
            {(
              (chart?.sites ?? WANDER_SITES) as {
                id: string;
                name: string;
                slot: number;
                visitors?: number;
                domain?: string;
              }[]
            ).map((site) => (
              <li key={site.id} data-slot={site.slot}>
                <span className="stats-legend-name">{site.name}</span>
                {site.visitors !== undefined ? (
                  <span className="stats-legend-value">
                    <AnimatedNumber value={site.visitors} from={0} />
                    <span className="sr-only"> visiteurs</span>
                  </span>
                ) : (
                  <span
                    className="stats-skeleton stats-skeleton-value"
                    aria-hidden="true"
                  />
                )}
                <span className="stats-legend-line" aria-hidden="true" />
                {site.domain && (
                  <div className="stats-legend-card">
                    <strong>{site.name}</strong>
                    <a
                      href={`https://${site.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {site.domain} ↗
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {data?.unavailable?.length ? (
            <p className="stats-note">
              Données momentanément indisponibles pour :{" "}
              {data.unavailable.join(", ")}.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

function Chart({
  chart,
  active: index,
  onActive: setActive,
  label,
}: {
  chart: ChartData | null;
  active: number | null;
  onActive: Dispatch<SetStateAction<number | null>>;
  label: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const { width, height } = size;

  // Horloge des courbes de chargement, tant qu'aucune donnée n'est là.
  const [clock, setClock] = useState(() => performance.now() / 1000);
  const loading = chart === null;
  useEffect(() => {
    if (!loading || duration() === 0) return;
    let raf = requestAnimationFrame(function tick(now) {
      setClock(now / 1000);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [loading]);

  const shapeFor = (source: ChartData | null) =>
    source
      ? shapeOf(
          source,
          niceTicks(Math.max(0, ...source.sites.flatMap((s) => s.values))),
        )
      : wanderShape(clock);
  const real = useMemo(() => (chart ? shapeFor(chart) : null), [chart]); // eslint-disable-line react-hooks/exhaustive-deps -- shapeFor(chart) ne dépend que de chart
  const target = real ?? wanderShape(clock);

  // Transition : dès le rendu où la source change, on part de la forme
  // affichée juste avant (même figée en pleine transition), pour qu'aucune
  // image ne montre la nouvelle période avant l'animation.
  const [source, setSource] = useState(chart);
  const [anim, setAnim] = useState<{
    id: number;
    from: Shape;
    p: number;
    t: number;
  } | null>(null);
  if (source !== chart) {
    const before = shapeFor(source);
    setSource(chart);
    setAnim({
      id: (anim?.id ?? 0) + 1,
      from: anim ? mix(anim.from, before, anim.p) : before,
      p: 0,
      t: 0,
    });
  }
  const animId = anim?.id;
  useEffect(() => {
    if (animId === undefined) return;
    return animate((p, t) =>
      setAnim((a) => (a?.id !== animId ? a : t < 1 ? { ...a, p, t } : null)),
    );
  }, [animId]);

  const top = anim ? lerp(anim.from.top, target.top, anim.p) : target.top;
  const valueAt = (id: string, t: number) =>
    anim
      ? lerp(anim.from.at(id, t), target.at(id, t), anim.p)
      : target.at(id, t);
  const n = chart?.points.length ?? 0;
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = Math.max(0, height - PAD.top - PAD.bottom);
  const x = (i: number) =>
    PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const settled = chart && !anim;

  // Graduations : fondu enchaîné pendant qu'elles glissent avec l'échelle.
  // Dates : les anciennes s'effacent d'abord, puis les nouvelles apparaissent,
  // pour ne jamais superposer deux séries de textes. Ce qui est commun aux
  // deux périodes reste affiché. `other` absent : tout afficher ; sinon,
  // seulement ce qui est (still) ou n'est pas dans `other`.
  const renderAxes = (
    axes: Axes,
    phase: "out" | "in" | "still",
    other?: Axes,
  ) => {
    const t = anim?.t ?? 1;
    const p = anim?.p ?? 1;
    const ticksOpacity = phase === "out" ? 1 - p : phase === "in" ? p : 1;
    const datesOpacity =
      phase === "out"
        ? 1 - smoothstep(0, 0.4, t)
        : phase === "in"
          ? smoothstep(0.4, 1, t)
          : 1;
    const shift =
      phase === "out"
        ? 5 * smoothstep(0, 0.4, t)
        : phase === "in"
          ? -5 * (1 - smoothstep(0.4, 1, t))
          : 0;
    const otherLabels = other ? dateLabels(other.chart, plotW) : [];
    const keep = (inOther: boolean) =>
      !other || inOther === (phase === "still");
    return (
      <>
        <g opacity={ticksOpacity}>
          {axes.ticks
            .filter((tick) =>
              keep(
                !!other?.chart && !!axes.chart && other.ticks.includes(tick),
              ),
            )
            .map((tick) => (
              <g key={tick} opacity={tick <= top + 1e-6 ? 1 : 0}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + plotW}
                  y1={y(tick)}
                  y2={y(tick)}
                />
                {axes.chart && (
                  <text
                    x={PAD.left - 8}
                    y={y(tick)}
                    dy="0.32em"
                    textAnchor="end"
                  >
                    {formatNumber(tick)}
                  </text>
                )}
              </g>
            ))}
        </g>
        <g opacity={datesOpacity} transform={`translate(0 ${shift})`}>
          {dateLabels(axes.chart, plotW)
            .filter((l) =>
              keep(
                otherLabels.some(
                  (o) => o.text === l.text && Math.abs(o.x - l.x) < 1,
                ),
              ),
            )
            .map((l) => (
              <text key={l.text} x={l.x} y={height - 8} textAnchor={l.anchor}>
                {l.text}
              </text>
            ))}
        </g>
      </>
    );
  };

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    if (!chart) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left - PAD.left;
    setActive(
      Math.max(0, Math.min(n - 1, Math.round((px / (plotW || 1)) * (n - 1)))),
    );
  };
  const key = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!chart) return;
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      Home: -Infinity,
      End: Infinity,
    };
    if (event.key === "Escape") return setActive(null);
    if (!(event.key in moves)) return;
    event.preventDefault();
    setActive((current) =>
      Math.max(0, Math.min(n - 1, (current ?? n - 1) + moves[event.key])),
    );
  };

  const series = chart?.sites ?? WANDER_SITES;
  return (
    <div className="stats-chart" ref={box} aria-busy={loading}>
      {loading && (
        <span className="sr-only" role="status">
          Chargement des statistiques…
        </span>
      )}
      {width > 0 && height > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-hidden={loading || undefined}
          aria-label={
            chart
              ? `${label}. Utilisez les flèches pour parcourir les ${chart.unit === "day" ? "jours" : "semaines"}.`
              : undefined
          }
          tabIndex={chart ? 0 : -1}
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={() => setActive(null)}
          onKeyDown={key}
          onBlur={() => setActive(null)}
        >
          <g className="stats-grid">
            {anim && renderAxes(anim.from.axes, "out", target.axes)}
            {anim && renderAxes(target.axes, "in", anim.from.axes)}
            {renderAxes(target.axes, "still", anim?.from.axes)}
          </g>
          {index !== null && settled && (
            <line
              className="stats-crosshair"
              x1={x(index)}
              x2={x(index)}
              y1={PAD.top}
              y2={PAD.top + plotH}
            />
          )}
          {series.map((site) => {
            const values = settled
              ? chart.sites.find((s) => s.id === site.id)!.values
              : null;
            return (
              <g key={site.id} data-slot={site.slot} className="stats-series">
                <path
                  d={smoothPath(
                    values
                      ? values.map((v, i) => [x(i), y(v)])
                      : Array.from({ length: SAMPLES + 1 }, (_, k) => {
                          const t = k / SAMPLES;
                          return [PAD.left + t * plotW, y(valueAt(site.id, t))];
                        }),
                  )}
                />
                {values && n === 1 && (
                  <circle
                    className="stats-dot"
                    cx={x(0)}
                    cy={y(values[0])}
                    r={4}
                  />
                )}
                {values && index !== null && (
                  <circle
                    className="stats-dot"
                    cx={x(index)}
                    cy={y(values[index])}
                    r={4.5}
                  />
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
