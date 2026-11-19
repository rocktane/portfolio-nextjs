import { describe, expect, test } from "bun:test";
import { curveAt, niceTicks, smoothPath, toChartData } from "@/lib/visitors";

const dates = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
  );

describe("toChartData", () => {
  test("keeps daily points up to 90 days and orders sites by fixed slot", () => {
    const chart = toChartData({
      generatedAt: "",
      timezone: "Europe/Paris",
      days: 3,
      dates: dates(3),
      sites: [
        { id: "akolyt", name: "akolyt", domain: "", visitors: 3, series: [1, 1, 1] },
        { id: "portfolio", name: "Portfolio", domain: "", visitors: 2, series: [0, 2, 0] },
      ],
    });
    expect(chart.unit).toBe("day");
    expect(chart.sites.map((s) => [s.id, s.slot])).toEqual([
      ["portfolio", 0],
      ["akolyt", 2],
    ]);
    expect(chart.sites[0].values).toEqual([0, 2, 0]);
  });

  test("sums weeks from the most recent day beyond 90 days", () => {
    const series = Array.from({ length: 365 }, () => 1);
    const chart = toChartData({
      generatedAt: "",
      timezone: "Europe/Paris",
      days: 365,
      dates: dates(365),
      sites: [{ id: "frsque", name: "frsque", domain: "", visitors: 9, series }],
    });
    expect(chart.unit).toBe("week");
    expect(chart.points).toHaveLength(53);
    expect(chart.sites[0].values[0]).toBe(1);
    expect(chart.sites[0].values.at(-1)).toBe(7);
    expect(chart.points.at(-1)?.end).toBe("2026-12-31");
    expect(chart.sites[0].values.reduce((a, b) => a + b)).toBe(365);
  });
});

test("niceTicks covers the maximum with round steps", () => {
  expect(niceTicks(0)).toEqual([0, 1]);
  expect(niceTicks(21)).toEqual([0, 10, 20, 30]);
  expect(niceTicks(3)).toEqual([0, 1, 2, 3]);
  expect(niceTicks(1234).at(-1)).toBeGreaterThanOrEqual(1234);
});

test("smoothPath passes through every point without overshooting", () => {
  expect(smoothPath([])).toBe("");
  expect(smoothPath([[0, 5], [10, 7]])).toBe("M0,5L10,7");
  const d = smoothPath([[0, 100], [10, 100], [20, 20], [30, 100]]);
  expect(d.startsWith("M0,100C")).toBe(true);
  expect(d.endsWith(",30,100")).toBe(true);
  const ys = d.split(/[MC]/).filter(Boolean).flatMap((seg) =>
    seg.split(",").map(Number).filter((_, i) => i % 2 === 1),
  );
  // Plat puis creux : aucun point de contrôle au-delà de [20, 100].
  for (const y of ys) expect(y >= 20 && y <= 100).toBe(true);
});

test("curveAt follows the smoothed series along normalized x", () => {
  const values = [0, 4, 4, 10, 2];
  const f = curveAt(values);
  values.forEach((v, i) => expect(f(i / 4)).toBeCloseTo(v));
  expect(f(0.375)).toBeCloseTo(4); // palier plat : pas de bosse
  expect(curveAt([])(0.5)).toBe(0);
  expect(curveAt([3, 5])(0.5)).toBe(4);
});
