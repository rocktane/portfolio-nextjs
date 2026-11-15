import { test, expect } from "@playwright/test";

test("modal keeps background geometry, traps focus, animates closure and restores scroll/focus", async ({
  page,
}) => {
  await page.goto("/a-essayer");
  const opener = page.getByRole("button", {
    name: "Détails de BetterBattery",
    exact: true,
  });
  await opener.scrollIntoViewIfNeeded();
  await opener.focus();
  const before = await opener.boundingBox();
  const scroll = await page.evaluate(() => scrollY);
  await opener.click();
  const dialog = page.getByRole("dialog", {
    name: "Détails de BetterBattery",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  const after = await opener.boundingBox();
  expect(after!.x).toBeCloseTo(before!.x, 0);
  expect(after!.y).toBeCloseTo(before!.y, 0);
  const close = dialog.getByRole("button", { name: "Fermer les détails" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.mouse.wheel(0, 700);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveAttribute("data-closing", "true");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await expect(page).not.toHaveURL(/app=/);
});

test("deep links, module icons and navigation, latest download, backdrop closure", async ({
  page,
}) => {
  await page.goto("/a-essayer?app=mdeck");
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "mdeck", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "Télécharger" }),
  ).toHaveAttribute("href", /releases\/latest\/download\//);
  const family = dialog.getByRole("navigation", { name: "mdeck" });
  await expect(family.getByRole("button")).toHaveCount(7);
  for (const button of await family.getByRole("button").all()) {
    await button.click();
    await expect(button).toHaveAttribute("aria-current", "page");
    await expect
      .poll(() =>
        button
          .locator("img")
          .evaluate((el) => (el as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await family.getByRole("button", { name: "Altty", exact: true }).click();
  await expect(page).toHaveURL(/app=altty/);
  await expect(
    dialog.getByRole("link", { name: "Documentation", exact: true }),
  ).toHaveAttribute("href", /github.com/);
  await expect(
    dialog.getByRole("heading", { name: "mdeck", exact: true }),
  ).toBeVisible();
  await expect(dialog.locator(".app-detail-command")).toHaveText(
    "brew install --cask rocktane/tap/mdeck",
  );
  await expect(
    dialog.locator("dt").filter({ hasText: "Module de" }),
  ).toHaveCount(0);
  await family.getByRole("button", { name: "Altty", exact: true }).click();
  await expect(page).toHaveURL(/app=mdeck/);
  await expect(
    dialog.getByRole("heading", { name: "mdeck", exact: true }),
  ).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(dialog).toHaveCount(0);
});

for (const width of [1440, 390, 320]) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`natural images, aligned actions and screenshots at ${width} ${colorScheme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme });
      for (const id of ["betterbattery", "tvcal", "mdeck", "betterdraw"]) {
        await page.goto(`/a-essayer?app=${id}`);
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          colorScheme,
        );
        for (const img of await dialog.locator("img").all()) {
          await expect
            .poll(() =>
              img.evaluate((el) => (el as HTMLImageElement).naturalWidth),
            )
            .toBeGreaterThan(0);
        }
        await dialog.evaluate(async (el) => {
          await Promise.all(
            el.getAnimations().map((animation) => animation.finished),
          );
        });
        const metrics = await dialog.evaluate((el) => {
          const shot = el.querySelector<HTMLImageElement>(".app-detail-shot");
          const buttons = [
            ...el.querySelectorAll<HTMLElement>(".app-detail-button"),
          ];
          return {
            overflow: el.scrollWidth > el.clientWidth,
            height: el.getBoundingClientRect().height,
            imageRatio: shot ? shot.clientWidth / shot.clientHeight : null,
            naturalRatio: shot ? shot.naturalWidth / shot.naturalHeight : null,
            heights: buttons.map((b) => b.getBoundingClientRect().height),
            media: el.querySelectorAll("figure").length,
          };
        });
        expect(metrics.overflow).toBe(false);
        expect(metrics.height).toBeLessThanOrEqual(876);
        for (const height of metrics.heights) expect(height).toBe(40);
        if (metrics.imageRatio)
          expect(metrics.imageRatio).toBeCloseTo(metrics.naturalRatio!, 1);
        else expect(metrics.media).toBe(0);
        await page.screenshot({
          path: test.info().outputPath(`${id}-${width}-${colorScheme}.png`),
          animations: "disabled",
        });
        await dialog
          .getByRole("button", { name: "Fermer les détails" })
          .click();
        await expect(dialog).toHaveCount(0);
      }
    });
  }
}

test("reduced motion opens/closes without animation and unknown IDs do not open", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/a-essayer?app=unknown");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Détails de Frsque", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("module selection smoothly resizes mdeck and copies its install command", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/a-essayer?app=mdeck");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.evaluate(async (el) => {
    await Promise.all(
      el.getAnimations().map((animation) => animation.finished),
    );
  });
  // Keep evidence after the short animation ends, even on a busy runner.
  await dialog.evaluate((el) => {
    const animate = el.animate.bind(el);
    el.animate = (frames, options) => {
      const animation = animate(frames, options);
      const effect = animation.effect as KeyframeEffect;
      const heights = effect.getKeyframes().map((frame) => frame.height);
      if (heights.some(Boolean)) {
        (el as HTMLElement).dataset.heightMotion = JSON.stringify({
          duration: effect.getTiming().duration,
          frames: heights,
        });
      }
      return animation;
    };
  });
  await dialog.getByRole("button", { name: "Ping", exact: true }).click();
  await expect(dialog).toHaveAttribute("data-height-motion", /frames/);
  const motion = JSON.parse((await dialog.getAttribute("data-height-motion"))!);
  expect(motion?.duration).toBe(220);
  expect(motion?.frames[0]).not.toBe(motion?.frames[1]);
  await dialog.getByRole("button", { name: "Copier la commande" }).click();
  await expect(
    dialog.getByRole("button", { name: "Commande copiée" }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "brew install --cask rocktane/tap/mdeck",
  );
  await expect(
    dialog.getByRole("heading", { name: "mdeck", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Ping", exact: true }),
  ).toBeVisible();
});

test("catalog data has the real icons, Frsque, the Web Store link and project URLs", async ({
  page,
}) => {
  await page.goto("/a-essayer");
  await expect(page.locator(".favorite-card")).toHaveCount(25);
  await expect(
    page.getByRole("heading", { name: "Woodle", exact: true }),
  ).toHaveCount(0);
  for (const name of [
    "Brower",
    "RemoveBG",
    "EXIF Dates",
    "Humain vs Jev",
    "Amp",
    "Frsque",
    "Exo",
    "QR Code Scanner",
  ]) {
    const card = page
      .locator(".favorite-card")
      .filter({ has: page.getByRole("heading", { name, exact: true }) });
    const icon = card.locator("img.favorite-icon");
    await icon.scrollIntoViewIfNeeded();
    await expect
      .poll(() => icon.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
  for (const [name, url] of [
    ["Frsque", "https://frsque.diy"],
    [
      "AltJump",
      "https://chromewebstore.google.com/detail/altjump/imigccmncifliibpcbenpfhjgkcdcbld",
    ],
    ["Brower", "https://bro.yohan.one"],
  ]) {
    await page
      .getByRole("button", { name: `Détails de ${name}`, exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.locator(".app-detail-group").getByRole("link").first(),
    ).toHaveAttribute("href", url);
    await dialog.getByRole("button", { name: "Fermer les détails" }).click();
    await expect(dialog).toHaveCount(0);
  }
});
