import { test, expect } from "@playwright/test";

test("home cards retain navigation and reveal decorative brand colors with keyboard and pointer", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const navigation = page.getByRole("navigation", { name: "Explorer le portfolio" });
    await expect(navigation.getByRole("link")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });

    for (const [label, href] of [["Projets", "/projets"], ["Parcours", "/parcours"], ["Contact", "/contact"]]) {
      const card = navigation.getByRole("link", { name: label, exact: true });
      await expect(card).toBeVisible();
      await expect(card.locator("svg")).toHaveAttribute("aria-hidden", "true");
      await page.mouse.move(0, 0);
      await card.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(card).toBeFocused();
      const brand = card.locator(".home-stack-logo path").first();
      await expect(brand).not.toHaveCSS("fill", "rgba(0, 0, 0, 0)");
      await card.hover();
      await expect(brand).not.toHaveCSS("fill", "rgba(0, 0, 0, 0)");
      await card.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.getByRole("heading", { level: 1, name: label, exact: true })).toBeVisible();
      await page.goto("/");
    }
  }
  expect(errors).toEqual([]);
});
