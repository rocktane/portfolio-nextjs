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
  RANGES,
  VISITORS_API,
  formatDay,
  formatNumber,
  formatPoint,
  niceTicks,
  spreadLabels,
  toChartData,
  type ChartData,
  type RangeDays,
  type VisitorsResponse,
} from "@/lib/visitors";

const HEIGHT = 300;
const PAD = { top: 16, right: 92, bottom: 30, left: 40 };
const LABEL_GAP = 16;

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: VisitorsResponse };

export default function VisitorsChart() {
  const [days, setDays] = useState<RangeDays>(30);
  const [state, setState] = useState<State>({ status: "loading" });
  const cache = useRef(new Map<number, VisitorsResponse>());
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    const hit = cache.current.get(days);
    if (hit) {
      setState({ status: "ready", data: hit });
      return;
    }
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(`${VISITORS_API}?days=${days}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<VisitorsResponse>;
      })
      .then((data) => {
        cache.current.set(days, data);
        setState({ status: "ready", data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });
    return () => controller.abort();
  }, [days]);

  const data = state.status === "ready" ? state.data : null;
  const chart = useMemo(() => (data ? toChartData(data) : null), [data]);
  const index =
    chart && active !== null ? Math.min(active, chart.points.length - 1) : null;
  const total = data?.sites.reduce((sum, site) => sum + site.visitors, 0);
  const rangeLabel = RANGES.find((r) => r.days === days)?.label;

  return (
    <section className="stats-panel" aria-labelledby="stats-title">
      <div className="stats-toolbar">
        <div>
          <h2 id="stats-title">Visiteurs de mes sites</h2>
          <p className="stats-total" aria-live="polite">
            {total === undefined ? (
              <span className="stats-placeholder">—</span>
            ) : (
              <>
                <strong>{formatNumber(total)}</strong> visiteurs uniques sur{" "}
                {days === 365 ? "un an" : `${days} jours`}
              </>
            )}
          </p>
        </div>
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
      {data && chart ? (
        <>
          <ul className="stats-legend">
            {chart.sites.map((site) => (
              <li key={site.id} data-slot={site.slot}>
                <span className="stats-swatch" aria-hidden="true" />
                <span className="stats-legend-name">{site.name}</span>
                <span className="stats-legend-domain">{site.domain}</span>
                <span className="stats-legend-value">
                  {formatNumber(site.visitors)}
                </span>
              </li>
            ))}
          </ul>
          <Chart
            chart={chart}
            active={index}
            onActive={setActive}
            label={`Visiteurs par site, ${rangeLabel}`}
          />
          {data.unavailable?.length ? (
            <p className="stats-note">
              Données momentanément indisponibles pour :{" "}
              {data.unavailable.join(", ")}.
            </p>
          ) : null}
        </>
      ) : (
        <div
          className="stats-chart stats-chart-empty"
          style={{ height: HEIGHT }}
          role="status"
        >
          {state.status === "error"
            ? "Statistiques indisponibles pour le moment."
            : "Chargement des statistiques…"}
        </div>
      )}
      <p className="stats-source">
        Mesure respectueuse de la vie privée (Umami auto-hébergé) : sans
        cookies, Do Not Track respecté. Un visiteur est compté une fois par jour
        et par site.
      </p>
    </section>
  );
}

function Chart({
  chart,
  active: index,
  onActive: setActive,
  label,
}: {
  chart: ChartData;
  active: number | null;
  onActive: Dispatch<SetStateAction<number | null>>;
  label: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const n = chart.points.length;
  const ticks = niceTicks(
    Math.max(0, ...chart.sites.flatMap((site) => site.values)),
  );
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const labelYs = spreadLabels(
    chart.sites.map((site) => y(site.values[n - 1] ?? 0)),
    LABEL_GAP,
    PAD.top + 4,
    PAD.top + plotH,
  );
  const xLabelCount = Math.min(n, Math.max(2, Math.floor(plotW / 90)));
  const xLabels = [
    ...new Set(
      Array.from({ length: xLabelCount }, (_, k) =>
        Math.round((k * (n - 1)) / Math.max(1, xLabelCount - 1)),
      ),
    ),
  ];

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left - PAD.left;
    setActive(
      Math.max(0, Math.min(n - 1, Math.round((px / (plotW || 1)) * (n - 1)))),
    );
  };
  const key = (event: KeyboardEvent<SVGSVGElement>) => {
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

  return (
    <div className="stats-chart" ref={box} style={{ height: HEIGHT }}>
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`${label}. Utilisez les flèches pour parcourir les ${chart.unit === "day" ? "jours" : "semaines"}.`}
          tabIndex={0}
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={() => setActive(null)}
          onKeyDown={key}
          onBlur={() => setActive(null)}
        >
          <g className="stats-grid">
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + plotW}
                  y1={y(tick)}
                  y2={y(tick)}
                />
                <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end">
                  {formatNumber(tick)}
                </text>
              </g>
            ))}
            {xLabels.map((i) => (
              <text
                key={i}
                x={x(i)}
                y={HEIGHT - 8}
                textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              >
                {formatDay(
                  chart.unit === "day"
                    ? chart.points[i].start
                    : chart.points[i].end,
                )}
              </text>
            ))}
          </g>
          {index !== null && (
            <line
              className="stats-crosshair"
              x1={x(index)}
              x2={x(index)}
              y1={PAD.top}
              y2={PAD.top + plotH}
            />
          )}
          {chart.sites.map((site, s) => (
            <g key={site.id} data-slot={site.slot} className="stats-series">
              <polyline
                points={site.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              />
              {n === 1 && (
                <circle
                  className="stats-dot"
                  cx={x(0)}
                  cy={y(site.values[0])}
                  r={4}
                />
              )}
              <text
                className="stats-end-label"
                x={x(n - 1) + 10}
                y={labelYs[s]}
                dy="0.32em"
              >
                {site.name}
              </text>
              {index !== null && (
                <circle
                  className="stats-dot"
                  cx={x(index)}
                  cy={y(site.values[index])}
                  r={4.5}
                />
              )}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
