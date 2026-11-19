import { describe, expect, test } from "bun:test";
import { niceTicks, spreadLabels, toChartData } from "@/lib/visitors";

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

test("spreadLabels separates close labels within bounds", () => {
  const out = spreadLabels([100, 100, 100, 50], 16, 10, 120);
  const sorted = [...out].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++)
    expect(sorted[i] - sorted[i - 1]).toBeGreaterThanOrEqual(16);
  expect(Math.max(...out)).toBeLessThanOrEqual(120);
  expect(Math.min(...out)).toBeGreaterThanOrEqual(10);
});
