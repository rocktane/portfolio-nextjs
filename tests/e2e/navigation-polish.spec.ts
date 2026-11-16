import { test, expect } from "@playwright/test";

test("mobile menu overlays content, closes accessibly and controls fit narrow screens", async ({
  page,
}) => {
  for (const width of [320, 390, 760]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/contact");
    const main = page.locator("main");
    const before = await main.boundingBox();
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    const theme = await page.locator(".theme-cycle").boundingBox();
    const search = await page.locator(".command-trigger").boundingBox();
    const toggle = await menu.boundingBox();
    const brand = await page.locator(".atelier-brand").boundingBox();
    expect(brand!.x + brand!.width).toBeLessThanOrEqual(theme!.x);
    expect(theme!.x + theme!.width).toBeLessThanOrEqual(search!.x);
    expect(search!.x + search!.width).toBeLessThanOrEqual(toggle!.x);
    await menu.click();
    await expect(page.locator(".sidebar-panel")).toBeVisible();
    expect((await main.boundingBox())!.y).toBe(before!.y);
    await page.getByRole("button", { name: /Renommer l’invité/ }).click();
    expect(
      (await page
        .getByRole("textbox", { name: "Votre prénom ou pseudo" })
        .boundingBox())!.width,
    ).toBeGreaterThan(200);
    await page
      .getByRole("textbox", { name: "Votre prénom ou pseudo" })
      .press("Enter");
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".sidebar-panel")).not.toBeVisible();
    await expect(menu).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight - innerHeight,
      ),
    ).toBeLessThanOrEqual(1);
  }
});

test("CV annotation fades after a keyboard move", async ({ page }) => {
  await page.goto("/");
  const note = page.locator(".cv-qr-note");
  await expect(note).toHaveCSS("opacity", "1");
  await page.locator(".cv-qr").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(note).toHaveCSS("opacity", "0");
});

test("Umami uses production domains and omits credentials", async ({
  page,
}) => {
  await page.goto("/");
  const tracker = page.locator(
    'script[src="https://stats.yohan.one/script.js"]',
  );
  await expect(tracker).toHaveAttribute("data-fetch-credentials", "omit");
  await expect(tracker).toHaveAttribute(
    "data-domains",
    "yohangouiran.com,www.yohangouiran.com",
  );
  await expect(tracker).toHaveAttribute("data-exclude-search", "true");
  expect(await page.context().cookies()).toEqual([]);
});
