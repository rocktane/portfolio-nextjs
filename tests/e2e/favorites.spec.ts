import { test, expect } from "@playwright/test";

test("favorites has all 26 apps, local icons, search and official Zen URL", async ({
  page,
}) => {
  await page.goto("/favoris");
  await expect(page.locator(".favorite-card")).toHaveCount(26);
  await expect(
    page.locator('.favorite-get[href="https://zen-browser.app"]'),
  ).toHaveCount(1);
  for (const image of await page.locator("img.favorite-icon").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
  await page
    .getByRole("searchbox", { name: "Rechercher un favori" })
    .fill("menubar");
  await expect(page.locator(".favorite-card")).toHaveCount(2);
  await page
    .getByRole("searchbox", { name: "Rechercher un favori" })
    .fill("absent-zzz");
  await expect(
    page.getByRole("heading", { name: "Aucun favori trouvé." }),
  ).toBeVisible();
});
