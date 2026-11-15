import { test, expect } from "@playwright/test";

test("drag across the page, cancel, clamp, resume floating and reset on reload", async ({
  page,
}) => {
  await page.goto("/");
  const logo = page.locator("a.floating-tool-claude");
  const bob = logo.locator(".floating-tool-bob");
  const origin = (await logo.boundingBox())!;
  await page.mouse.move(
    origin.x + origin.width / 2,
    origin.y + origin.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(180, 180, { steps: 8 });
  await expect(logo).toHaveClass(/is-held/);
  await expect(bob).toHaveCSS("animation-play-state", "paused");
  const dragged = (await logo.boundingBox())!;
  expect(dragged.x).toBeLessThan(origin.x - 100);
  await page.waitForTimeout(100);
  await page.mouse.up();
  await expect(bob).toHaveCSS("animation-play-state", "running");
  expect((await logo.boundingBox())!.x).toBeCloseTo(dragged.x, 0);
  expect(page.context().pages()).toHaveLength(1);

  await page.mouse.down();
  await page.mouse.move(500, 300);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect((await logo.boundingBox())!.x).toBeCloseTo(dragged.x, 0);
  await logo.focus();
  for (let i = 0; i < 15; i++) await page.keyboard.press("Shift+ArrowRight");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(
      async () =>
        (await logo.boundingBox())!.x + (await logo.boundingBox())!.width,
    )
    .toBeLessThanOrEqual(390 - 28);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.reload();
  await expect
    .poll(async () => (await logo.boundingBox())!.x)
    .toBeCloseTo(origin.x, 0);
});

test("folding and unfolding the sidebar leaves the logos in place", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    const logo = page.locator("a.floating-tool-claude");
    const toggle = page.locator("#sidebar-toggle");
    const before = (await logo.boundingBox())!;
    for (const collapsed of [true, false]) {
      await toggle.click();
      await page.waitForTimeout(600);
      expect(await page.locator("html").getAttribute("data-sidebar")).toBe(
        collapsed ? "collapsed" : null,
      );
      const after = (await logo.boundingBox())!;
      expect(after.x).toBeCloseTo(before.x, 0);
      expect(after.y).toBeCloseTo(before.y, 0);
    }
    // A reload re-anchors the constellation on the marker layout.
    await page.reload();
    await expect
      .poll(async () => (await logo.boundingBox())!.x)
      .toBeCloseTo(before.x, 0);
  }
});

test("monochrome themes, no hover scale, reduced motion and keyboard movement", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const logo = page.locator("a.floating-tool-t3");
  await expect(logo.locator(".floating-tool-bob")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(logo.locator(".floating-tool-tile")).toHaveCSS(
    "background-color",
    "rgb(36, 91, 70)",
  );
  const initial = (await logo.boundingBox())!;
  await logo.hover();
  expect((await logo.boundingBox())!.width).toBe(initial.width);
  await expect(logo.locator(".floating-tool-tile")).toHaveCSS(
    "transform",
    "none",
  );
  await logo.focus();
  await page.keyboard.press("ArrowLeft");
  expect((await logo.boundingBox())!.x).toBeCloseTo(initial.x - 10, 0);
  await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
  await expect(logo.locator(".floating-tool-tile")).toHaveCSS(
    "background-color",
    "rgb(164, 215, 181)",
  );
  await expect(logo.locator(".floating-logo-black")).toBeVisible();
  await expect(logo.locator(".floating-logo-white")).toBeHidden();
  expect(
    await page
      .locator(".floating-tool img")
      .evaluateAll((imgs) =>
        imgs.every(
          (img) =>
            (img as HTMLImageElement).complete &&
            (img as HTMLImageElement).naturalWidth > 0,
        ),
      ),
  ).toBe(true);
});

test("touch cancellation and window blur release the logo without navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const logo = page.locator("a.floating-tool-claude");
  const origin = (await logo.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: origin.x + 30, y: origin.y + 30 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 140, y: 300 }],
  });
  await expect(logo).toHaveClass(/is-held/);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  await expect(logo).not.toHaveClass(/is-held/);
  expect((await logo.boundingBox())!.x).toBeCloseTo(origin.x, 0);
  expect((await logo.boundingBox())!.y).toBeCloseTo(origin.y, 0);
  await page.mouse.move(origin.x + 30, origin.y + 30);
  await page.mouse.down();
  await page.mouse.move(200, 300);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.mouse.up();
  await expect(logo).not.toHaveClass(/is-held/);
  expect((await logo.boundingBox())!.x).toBeCloseTo(origin.x, 0);
  expect(page.context().pages()).toHaveLength(1);
});

test("release velocity adds inertia; grabbing again stops it; a stationary release stays put", async ({
  page,
}) => {
  await page.goto("/");
  const logo = page.locator("a.floating-tool-claude");
  let box = (await logo.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 4; i++) {
    await page.waitForTimeout(20);
    await page.mouse.move(
      box.x + box.width / 2 - i * 20,
      box.y + box.height / 2,
    );
  }
  const released = (await logo.boundingBox())!.x;
  await page.mouse.up();
  await expect
    .poll(async () => (await logo.boundingBox())!.x)
    .toBeLessThan(released - 15);
  // Catch the moving tile, then hold it still before release.
  box = (await logo.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  box = (await logo.boundingBox())!;
  await page.waitForTimeout(150);
  expect((await logo.boundingBox())!.x).toBeCloseTo(box.x, 0);
  await page.mouse.up();
  await page.waitForTimeout(150);
  expect((await logo.boundingBox())!.x).toBeCloseTo(box.x, 0);
  await expect(page.locator(".floating-tool-name")).toHaveCount(0);
});

test("CV QR code drags like the logos, stays in the viewport and hides on phones", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const qr = page.locator("a.cv-qr");
  await expect(qr).toHaveAttribute("href", "/CV.pdf");
  const origin = (await qr.boundingBox())!;
  expect(origin.x + origin.width).toBeGreaterThan(1300);
  expect(origin.y + origin.height).toBeGreaterThan(780);

  await page.mouse.move(
    origin.x + origin.width / 2,
    origin.y + origin.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(700, 400, { steps: 8 });
  await expect(qr).toHaveClass(/is-held/);
  await page.waitForTimeout(100);
  await page.mouse.up();
  const dragged = (await qr.boundingBox())!;
  expect(dragged.x).toBeLessThan(origin.x - 400);
  expect(page.context().pages()).toHaveLength(1);

  // Escape returns an ongoing drag to where it started.
  await page.mouse.move(dragged.x + 50, dragged.y + 50);
  await page.mouse.down();
  await page.mouse.move(300, 300, { steps: 4 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect((await qr.boundingBox())!.x).toBeCloseTo(dragged.x, 0);

  // Arrow keys move it, always clamped to the viewport.
  await qr.focus();
  for (let i = 0; i < 40; i++) await page.keyboard.press("Shift+ArrowDown");
  const low = (await qr.boundingBox())!;
  expect(low.y + low.height).toBeLessThanOrEqual(900);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(qr).toBeHidden();

  // Only the home page carries it.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projets");
  await expect(page.locator("a.cv-qr")).toHaveCount(0);
});
