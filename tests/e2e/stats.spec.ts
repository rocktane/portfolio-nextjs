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
          { id: "betterview", name: "BetterView", domain: "betterview.photos", visitors: days === 365 ? 400 : 40, series: series(2) },
          { id: "portfolio", name: "Portfolio", domain: "yohangouiran.com", visitors: 30, series: series(1) },
          { id: "akolyt", name: "akolyt", domain: "akolyt.fr", visitors: 20, series: series(3) },
          { id: "frsque", name: "frsque", domain: "frsque.app", visitors: 10, series: series(4) },
        ],
      }),
    });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/statistiques");
  const total = page.locator(".stats-total strong [aria-hidden]");
  // Même avec des données immédiates, le chargement reste affiché un moment.
  await expect(page.locator(".stats-skeleton-total")).toBeVisible();
  await expect(page.locator(".breadcrumbs")).toContainText("Statistiques");
  await expect(total).toHaveText("100");
  await expect(page.locator(".stats-series path")).toHaveCount(4);
  await expect(page.locator(".stats-legend-line")).toHaveCount(4);
  await expect(page.locator(".stats-legend li").first()).toContainText("Portfolio30");
  expect([...requested].sort()).toEqual(["30", "365", "7", "90"]);
  await expect(page.locator(".stats-source")).toHaveCount(0);

  // La carte remplit la hauteur disponible.
  const panel = (await page.locator(".stats-panel").boundingBox())!;
  expect(panel.height).toBeGreaterThan(560);

  // La carte de légende reste ouverte quand on y monte, et son lien est cliquable.
  const first = page.locator(".stats-legend li").first();
  await first.hover();
  const link = first.getByRole("link", { name: "yohangouiran.com ↗" });
  await expect(link).toHaveAttribute("href", "https://yohangouiran.com");
  await link.hover();
  await expect(link).toBeVisible();
  await expect(first.locator(".stats-legend-card")).toHaveCSS("opacity", "1");

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
  // Le total et les courbes passent progressivement à la nouvelle période.
  await expect(total).not.toHaveText("460");
  await expect(total).toHaveText("460");
  await expect
    .poll(async () =>
      (await page.locator(".stats-series path").first().getAttribute("d"))
        ?.match(/C/g)?.length,
    )
    .toBe(52);
  expect(requested).toHaveLength(4);
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

test("loading curves wander, then morph into the data without being replaced", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("https://visites.23o.dev/visitors**", async (route) => {
    await gate;
    const days = Number(new URL(route.request().url()).searchParams.get("days"));
    const site = (id: string) => ({ id, name: id, domain: `${id}.fr`, visitors: 3, series: Array(days).fill(1) });
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        generatedAt: "",
        timezone: "Europe/Paris",
        days,
        dates: dates(days),
        sites: ["portfolio", "betterview", "akolyt", "frsque"].map(site),
      }),
    });
  });
  await page.goto("/statistiques");
  const paths = page.locator(".stats-series path");
  await expect(paths).toHaveCount(4);
  // Les noms des sites sont connus d'avance, seuls les chiffres attendent.
  await expect(page.locator(".stats-legend-name")).toHaveText(["Portfolio", "BetterView", "akolyt", "frsque"]);
  await expect(page.locator(".stats-legend .stats-skeleton-value")).toHaveCount(4);
  await page.locator(".stats-legend li").first().evaluate((el) => ((el as unknown as { mark: number }).mark = 1));
  await expect(page.locator(".stats-skeleton-total")).toBeVisible();
  const chartBox = (await page.locator(".stats-chart").boundingBox())!;
  expect(chartBox.height).toBeGreaterThanOrEqual(280);

  // Les courbes bougent pendant le chargement.
  const before = await paths.first().getAttribute("d");
  await expect.poll(() => paths.first().getAttribute("d")).not.toBe(before);

  // Les mêmes éléments <path> se déforment jusqu'aux données.
  await paths.first().evaluate((el) => ((el as unknown as { mark: number }).mark = 1));
  release();
  await expect(page.locator(".stats-total strong [aria-hidden]")).toHaveText("12");
  await expect
    .poll(async () => (await paths.first().getAttribute("d"))?.match(/C/g)?.length)
    .toBe(29);
  expect(await paths.first().evaluate((el) => (el as unknown as { mark?: number }).mark)).toBe(1);
  expect(await page.locator(".stats-legend li").first().evaluate((el) => (el as unknown as { mark?: number }).mark)).toBe(1);
});
