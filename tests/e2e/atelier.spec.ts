import { test, expect } from "@playwright/test";
const current = {
  temperature_2m: 18.4,
  weather_code: 61,
  is_day: 1,
  time: Math.floor(Date.now() / 1000),
};
test.beforeEach(async ({ page }) => {
  await page.route(/api\.open-meteo\.com/, (route) =>
    route.fulfill({ json: { current } }),
  );
});
test("guest is editable in place, local-only, persistent and cancellable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Renommer l’invité/ }).click();
  const input = page.getByRole("textbox", { name: "Votre prénom ou pseudo" });
  await input.fill("Camille");
  await input.press("Enter");
  await expect(
    page.getByRole("button", { name: /actuellement Camille/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /actuellement Camille/ }),
  ).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([
    "atelier.guest-name",
  ]);
  await page.getByRole("button", { name: /Renommer l’invité/ }).click();
  await input.fill("À annuler");
  await input.press("Escape");
  await expect(
    page.getByRole("button", { name: /actuellement Camille/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Renommer l’invité/ }).click();
  await input.fill(" ");
  await input.press("Enter");
  await expect(
    page.getByRole("button", { name: /actuellement Invité/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("atelier.guest-name")),
  ).toBeNull();
});
test("denied localStorage doesn't break guest editing", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get: () => {
        throw new DOMException("Denied", "SecurityError");
      },
    }),
  );
  await page.goto("/contact");
  await page.getByRole("button", { name: /Renommer l’invité/ }).click();
  const input = page.getByRole("textbox", { name: "Votre prénom ou pseudo" });
  await input.fill("Alex");
  await input.press("Enter");
  await expect(
    page.getByRole("button", { name: /actuellement Alex/ }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /stockage local est indisponible/ }),
  ).toHaveCount(1);
});
test("weather comes from live API data, uses the rain icon and persists across navigation", async ({
  page,
}) => {
  const urls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("api.open-meteo.com")) urls.push(r.url());
  });
  await page.goto("/");
  const weather = page.locator(".sidebar-weather .marseille-weather");
  await expect(weather).toContainText("18°");
  await expect(weather.locator("svg[data-weather-icon]")).toHaveAttribute(
    "data-weather-icon",
    "rain",
  );
  await expect(weather).toHaveAttribute("aria-label", /Pluie/);
  const count = urls.length;
  await page.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Contact", exact: true }),
  ).toBeVisible();
  expect(urls.length).toBe(count);
  expect(
    urls.every(
      (u) => u.includes("latitude=43.2965") && u.includes("longitude=5.3698"),
    ),
  ).toBe(true);
});
test("weather failure is honest, not a made-up temperature", async ({
  page,
}) => {
  await page.route(/api\.open-meteo\.com/, (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("/");
  const weather = page.locator(".sidebar-weather .marseille-weather");
  await expect(weather).toContainText("indisponible");
  await expect(weather).not.toContainText("18°");
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(
    page.locator(".header-weather .weather-condition"),
  ).toBeVisible();
  await expect(page.locator(".header-weather .weather-condition")).toHaveText(
    "Météo indisponible",
  );
});
test("catalog filters, actual routes and query state survive a project round trip", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Rechercher un projet" })
    .fill("Brower");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Voir le projet Brower", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projets\/brower/);
  await expect(
    page.getByRole("heading", { name: "Brower", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("searchbox")).toHaveValue("Brower");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.getByRole("link", { name: /Le labo/ }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await page.getByRole("button", { name: "Vue liste" }).click();
  await expect(page.locator(".project-grid")).toHaveClass(/project-list/);
  await page.getByRole("searchbox").fill("rien-zzz");
  await expect(
    page.getByRole("heading", { name: "Aucun projet trouvé." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Réinitialiser la recherche" })
    .click();
  await expect(page.locator(".project-card")).not.toHaveCount(0);
});
test("Safee is first in the reverse-chronological career", async ({ page }) => {
  await page.goto("/parcours");
  const first = page.locator(".career-list li").first();
  await expect(first).toContainText("Safee");
  await expect(first.getByRole("heading")).toHaveText(
    "Développeur Fullstack / mobile",
  );
});
test("header size is invariant; footer stays at the bottom or after content at every size", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    let headerHeight: number | undefined;
    for (const path of [
      "/",
      "/contact",
      "/parcours",
      "/labo",
      "/archives",
      "/projets/amp",
      "/projets/zzz",
    ]) {
      await page.goto(path);
      const header = await page.locator(".workspace-header").boundingBox();
      expect(header).not.toBeNull();
      if (headerHeight === undefined) headerHeight = header!.height;
      expect(header!.height).toBe(headerHeight);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const geometry = await page.evaluate(() => {
        const m = document.querySelector("main")!.getBoundingClientRect(),
          f = document.querySelector("footer")!.getBoundingClientRect();
        return {
          mainBottom: m.bottom + scrollY,
          footerTop: f.top + scrollY,
          footerBottom: f.bottom + scrollY,
          height: innerHeight,
          scrollHeight: document.documentElement.scrollHeight,
        };
      });
      expect(geometry.footerTop).toBeGreaterThanOrEqual(
        geometry.mainBottom - 1,
      );
      expect(geometry.footerBottom).toBeGreaterThanOrEqual(geometry.height - 1);
      if (
        [390, 1440].includes(width) &&
        ["/", "/contact", "/parcours"].includes(path)
      )
        await page.screenshot({
          path: test
            .info()
            .outputPath(
              `layout-${width}-${path.replace(/\W/g, "_") || "projects"}.png`,
            ),
          animations: "disabled",
        });
      expect(
        Math.abs(geometry.footerBottom - geometry.scrollHeight),
      ).toBeLessThanOrEqual(2);
    }
  }
});
test("keyboard skip and unknown pages work without duplicate shells", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Aller au contenu principal" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.goto("/projets/zzz");
  await expect(
    page.getByRole("heading", { name: "Page introuvable." }),
  ).toBeVisible();
  await expect(page.locator("header.workspace-header")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
});

test("same-collection links clear both the URL and filtered results", async ({
  page,
}) => {
  for (const entry of ["typed", "deep-link"]) {
    for (const selector of [
      '.sidebar-nav a[href="/"]',
      ".atelier-brand",
      '.breadcrumbs a[href="/"]',
    ]) {
      await page.goto(entry === "deep-link" ? "/?q=Brower" : "/");
      if (entry === "typed") await page.getByRole("searchbox").fill("Brower");
      await expect(page.locator(".project-card")).toHaveCount(1);
      await page.locator(selector).click();
      await expect(page.getByRole("searchbox")).toHaveValue("");
      await expect(page.locator(".project-card")).toHaveCount(7);
      await expect(page).toHaveURL("/");
    }
  }
});

test("a quota error still updates the displayed name for the visit", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("atelier.guest-name", "Avant");
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      },
    });
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /actuellement Avant/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Renommer l’invité/ }).click();
  await page
    .getByRole("textbox", { name: "Votre prénom ou pseudo" })
    .fill("Après");
  await page
    .getByRole("textbox", { name: "Votre prénom ou pseudo" })
    .press("Enter");
  await expect(
    page.getByRole("button", { name: /actuellement Après/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("atelier.guest-name")),
  ).toBe("Avant");
});

test("editing a search in the middle preserves caret and character order", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.getByRole("searchbox");
  for (let attempt = 0; attempt < 5; attempt++) {
    await input.fill("abcdef");
    await input.press("Home");
    await input.press("ArrowRight");
    await input.press("ArrowRight");
    await page.keyboard.type("XY");
    await expect(input).toHaveValue("abXYcdef");
  }
  await page.locator('.sidebar-nav a[href="/"]').click();
  await expect(input).toHaveValue("");
  await expect(page.locator(".project-card")).toHaveCount(7);
});

test("editing the guest name does not move sidebar items", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const before = await page.locator(".sidebar-nav").boundingBox();
    const profile = await page.locator(".guest-identity").boundingBox();
    for (const key of ["Escape", "Enter"]) {
      await page.getByRole("button", { name: /Renommer l’invité/ }).click();
      const input = page.getByRole("textbox", {
        name: "Votre prénom ou pseudo",
      });
      await input.fill("Un prénom et un nom particulièrement longs");
      const after = await page.locator(".sidebar-nav").boundingBox();
      const editingProfile = await page
        .locator(".guest-identity")
        .boundingBox();
      expect(Math.abs(after!.y - before!.y)).toBeLessThanOrEqual(0.5);
      expect(
        Math.abs(editingProfile!.height - profile!.height),
      ).toBeLessThanOrEqual(0.5);
      await input.press(key);
      const saved = await page.locator(".sidebar-nav").boundingBox();
      expect(Math.abs(saved!.y - before!.y)).toBeLessThanOrEqual(0.5);
    }
  }
});

test("sidebar identity aligns with the header; networks and CV have their own place", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const brand = await page.locator(".atelier-brand").boundingBox();
  const breadcrumb = await page.locator(".breadcrumbs").boundingBox();
  expect(
    Math.abs(
      brand!.y + brand!.height / 2 - breadcrumb!.y - breadcrumb!.height / 2,
    ),
  ).toBeLessThanOrEqual(1);
  await expect(page.locator(".workspace-header a[href$='.pdf']")).toHaveCount(
    0,
  );
  for (const name of ["GitHub", "LinkedIn"]) {
    await expect(
      page.locator(".sidebar-bottom").getByRole("link", { name, exact: true }),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 320, height: 900 });
  for (const name of ["GitHub", "LinkedIn"]) {
    await expect(
      page
        .locator(".workspace-header")
        .getByRole("link", { name, exact: true }),
    ).toBeVisible();
  }
  await page.goto("/parcours");
  await expect(page.locator("main a[href$='.pdf']")).toBeVisible();
});

test("search focus follows its container and list screenshots fill their card", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?vue=liste");
    await page.getByRole("searchbox").focus();
    const focus = await page.locator(".project-search").evaluate((el) => ({
      outline: getComputedStyle(el.querySelector("input")!).outlineStyle,
      border: getComputedStyle(el).borderColor,
      shadow: getComputedStyle(el).boxShadow,
    }));
    expect(focus.outline).toBe("none");
    expect(focus.border).toBe("rgb(36, 91, 70)");
    expect(focus.shadow).not.toBe("none");
    for (const card of await page.locator(".project-card").all()) {
      const image = card.locator("img");
      if (!(await image.count())) continue;
      const box = await card.boundingBox();
      const shot = await image.boundingBox();
      expect(Math.abs(box!.height - 2 - shot!.height)).toBeLessThanOrEqual(1);
      expect(await image.evaluate((el) => getComputedStyle(el).filter)).toBe(
        "none",
      );
    }
    await page.screenshot({
      path: test.info().outputPath(`list-${width}.png`),
      animations: "disabled",
    });
  }
});

test("project details preserve every image ratio and the archive visual fits", async ({
  page,
}) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of [
      "safee",
      "brower",
      "exo",
      "cashou",
      "tvcal",
      "snake",
      "amp",
      "tamanotchi",
      "betterbattery",
      "removebg",
      "exif-dates",
      "geeft",
    ]) {
      await page.goto(`/projets/${id}`);
      const img = page.locator(".project-detail img");
      await img.evaluate((el: HTMLImageElement) => el.decode());
      const g = await img.evaluate((el: HTMLImageElement) => ({
        ratio: el.naturalWidth / el.naturalHeight,
        actual: el.clientWidth / el.clientHeight,
        frame: el.parentElement!.clientHeight,
        height: el.clientHeight,
      }));
      expect(Math.abs(g.ratio - g.actual)).toBeLessThan(0.015);
      expect(Math.abs(g.frame - g.height)).toBeLessThanOrEqual(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.goto("/archives");
  await expect(page.getByAltText("Visuel de Geeft")).toBeVisible();
});
test("requested chrome and contact copy are present without duplicate footer links", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".brand-monogram")).toHaveCount(0);
  await expect(page.locator("footer a")).toHaveCount(0);
  await expect(page.locator(".sidebar-contact")).toHaveText("Se connecter");
  await expect(
    page.locator(".project-technologies").first().locator("li"),
  ).toHaveCount(5);
  await page.locator(".sidebar-contact").click();
  await expect(
    page.getByRole("heading", { name: "Un projet ? Une mission ?" }),
  ).toBeVisible();
  await expect(page.locator(".contact-mark")).toHaveCount(0);
});
