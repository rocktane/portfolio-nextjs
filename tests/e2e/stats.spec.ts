import { test, expect } from "@playwright/test";

const dates = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    new Date(Date.UTC(2026, 10, 19 - n + 1 + i)).toISOString().slice(0, 10),
  );

test("stats page charts visitors of every site with range and hover", async ({
  page,
}) => {
  const requested: string[] = [];
  await page.route("https://visites.23o.dev/visitors**", async (route) => {
    const days = Number(new URL(route.request().url()).searchParams.get("days"));
    requested.push(String(days));
    const series = (k: number) => Array.from({ length: days }, (_, i) => (i * k) % 7);
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        generatedAt: "2026-11-19T12:00:00Z",
        timezone: "Europe/Paris",
        days,
        dates: dates(days),
        sites: [
          { id: "betterview", name: "BetterView", domain: "betterview.photos", visitors: 40, series: series(2) },
          { id: "portfolio", name: "Portfolio", domain: "yohangouiran.com", visitors: 30, series: series(1) },
          { id: "akolyt", name: "akolyt", domain: "akolyt.fr", visitors: 20, series: series(3) },
          { id: "frsque", name: "frsque", domain: "frsque.app", visitors: 10, series: series(4) },
        ],
      }),
    });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/statistiques");
  await expect(page.locator(".breadcrumbs")).toContainText("Statistiques");
  await expect(page.locator(".stats-total strong")).toHaveText("100");
  await expect(page.locator(".stats-series polyline")).toHaveCount(4);
  await expect(page.locator(".stats-legend li").first()).toContainText("Portfolio");

  const chart = page.locator(".stats-chart > svg");
  const box = (await chart.boundingBox())!;
  expect(box.width).toBeGreaterThan(600);
  await page.mouse.move(box.x + box.width / 2, box.y + 120);
  await expect(page.locator(".stats-tooltip li")).toHaveCount(4);
  const range = (await page.locator(".stats-range").boundingBox())!;
  const tip = (await page.locator(".stats-tooltip").boundingBox())!;
  expect(tip.y).toBeGreaterThanOrEqual(range.y + range.height);
  expect(Math.abs(tip.x + tip.width - (range.x + range.width))).toBeLessThan(2);

  await chart.focus();
  await page.keyboard.press("End");
  await expect(page.locator(".stats-tooltip strong")).toHaveText("19 nov.");

  await page.getByRole("button", { name: "1 an" }).click();
  await expect(page.getByRole("button", { name: "1 an" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".stats-series polyline").first()).toHaveAttribute(
    "points",
    /^(\S+ ){52}\S+$/,
  );
  expect(requested).toEqual(["30", "365"]);
});

test("range selector spans the card on mobile", async ({ page }) => {
  await page.route("https://visites.23o.dev/visitors**", (route) =>
    route.fulfill({ status: 502, body: "{}" }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/statistiques");
  const toolbar = (await page.locator(".stats-toolbar").boundingBox())!;
  const range = (await page.locator(".stats-range").boundingBox())!;
  expect(Math.abs(range.width - toolbar.width)).toBeLessThan(2);
});

test("stats page reports an unavailable API", async ({ page }) => {
  await page.route("https://visites.23o.dev/visitors**", (route) =>
    route.fulfill({ status: 502, body: "{}" }),
  );
  await page.goto("/statistiques");
  await expect(page.getByText("Statistiques indisponibles pour le moment.")).toBeVisible();
});
