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
  await page
    .locator(".sidebar-nav")
    .getByRole("link", { name: "Contact", exact: true })
    .click();
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
  await page.goto("/projets");
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
      "/projets",
      "/a-essayer",
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
    for (const selector of ['.sidebar-nav a[href="/projets"]']) {
      await page.goto(entry === "deep-link" ? "/projets?q=Brower" : "/projets");
      if (entry === "typed") await page.getByRole("searchbox").fill("Brower");
      await expect(page.locator(".project-card")).toHaveCount(1);
      await page.locator(selector).click();
      await expect(page.getByRole("searchbox")).toHaveValue("");
      await expect(page.locator(".project-card")).toHaveCount(7);
      await expect(page).toHaveURL("/projets");
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
  await page.goto("/projets");
  const input = page.getByRole("searchbox");
  for (let attempt = 0; attempt < 5; attempt++) {
    await input.fill("abcdef");
    await input.press("Home");
    await input.press("ArrowRight");
    await input.press("ArrowRight");
    await page.keyboard.type("XY");
    await expect(input).toHaveValue("abXYcdef");
  }
  await page.locator('.sidebar-nav a[href="/projets"]').click();
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
      page.locator(".sidebar-nav").getByRole("link", { name, exact: true }),
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
    await page.goto("/projets?vue=liste");
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
      expect(g.height).toBeLessThanOrEqual(g.frame + 1);
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
  await page.goto("/projets");
  await expect(page.locator(".brand-monogram")).toHaveCount(0);
  await expect(page.locator("footer a")).toHaveCount(0);
  await expect(page.locator(".header-contact")).toHaveText("Se connecter");
  await expect(
    page.locator(".project-technologies").first().locator("li"),
  ).toHaveCount(5);
  await page.locator(".header-contact").click();
  await expect(
    page.getByRole("heading", { name: "Un projet ? Une mission ?" }),
  ).toBeVisible();
  await expect(page.locator(".contact-mark")).toHaveCount(0);
});

test("home has three working paths and no duplicated project catalog", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".sidebar-nav a[aria-current='page']")).toHaveText(
    "Accueil",
  );
  await expect(page.locator(".home-page h1")).toContainText(
    "fullstack & mobile.",
  );
  await expect(
    page.locator(".home-page p, .home-page img, .home-page .project-card"),
  ).toHaveCount(0);
  const paths = page.getByRole("navigation", { name: "Explorer le portfolio" });
  await expect(paths.getByRole("link")).toHaveCount(3);
  for (const [label, url] of [
    ["Projets", "/projets"],
    ["Parcours", "/parcours"],
    ["Contact", "/contact"],
  ]) {
    await paths.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(url);
    await expect(
      page.getByRole("heading", { name: label, exact: true }),
    ).toBeVisible();
    await page.locator(".atelier-brand").click();
    await expect(page).toHaveURL("/");
  }
  await page.goto("/projets/safee");
  await expect(
    page.locator(".sidebar-nav a[aria-current='page']"),
  ).toContainText("Projets");
  await page.locator(".detail-back").click();
  await expect(page).toHaveURL("/projets");
});

test("guest label and pencil stay inside the sidebar; footer is compact and sign-in unique", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Se connecter", exact: true }),
    ).toHaveCount(1);
    for (const name of ["Boris", "Boris Ameldojfsojfndsojfnsdojnfs"]) {
      await page.getByRole("button", { name: /Renommer l’invité/ }).click();
      await page
        .getByRole("textbox", { name: "Votre prénom ou pseudo" })
        .fill(name);
      await page
        .getByRole("textbox", { name: "Votre prénom ou pseudo" })
        .press("Enter");
      const box = await page.locator(".guest-identity").boundingBox();
      const pencil = await page.locator(".guest-name svg").boundingBox();
      const span = await page.locator(".guest-name span").boundingBox();
      expect(pencil!.x + pencil!.width).toBeLessThanOrEqual(
        box!.x + box!.width + 1,
      );
      expect(pencil!.x - span!.x - span!.width).toBeLessThanOrEqual(7);
      expect(pencil!.x - span!.x - span!.width).toBeGreaterThanOrEqual(0);
    }
    const footer = await page.locator("footer").evaluate((el) => ({
      border: getComputedStyle(el).borderTopWidth,
      height: el.getBoundingClientRect().height,
      align: getComputedStyle(el).textAlign,
    }));
    expect(footer.border).toBe("0px");
    expect(footer.align).toBe("right");
    expect(footer.height).toBeLessThan(48);
  }
});
test("try tools show precise destinations, constraints and a copyable install command", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/a-essayer");
  await expect(page.locator(".try-tools > li")).toHaveCount(7);
  await expect(
    page.getByRole("link", { name: /Composer son flux/ }),
  ).toHaveAttribute("href", "https://tvcal.yohan.one");
  const battery = page.locator(".try-tools > li").filter({
    has: page.getByRole("heading", { name: "BetterBattery", exact: true }),
  });
  await expect(battery).toContainText("Apple Silicon");
  await battery.getByRole("button", { name: "Copier la commande" }).click();
  await expect(battery.getByRole("button")).toHaveText("Copié !");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "brew install --cask rocktane/tap/betterbattery",
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, "writeText", {
      value: () => Promise.reject(new Error("Denied")),
    }),
  );
  await battery.getByRole("button").click();
  await expect(page.locator(".tool-feedback")).toContainText(
    "Copie indisponible",
  );
  await expect(battery.locator("code")).toBeVisible();
});
test("command search supports keyboard, empty states, focus return and navigation", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Rechercher dans le portfolio",
  });
  await trigger.focus();
  await page.keyboard.press("Meta+k");
  const dialog = page.getByRole("dialog", { name: "Rechercher", exact: true });
  const input = dialog.getByRole("combobox");
  await expect(dialog).toBeVisible();
  await expect(input).toBeFocused();
  await input.fill("zzzz-no-results");
  await expect(dialog.getByText("Aucun résultat.")).toBeVisible();
  await input.fill("typescript");
  await expect(dialog.getByRole("option")).not.toHaveCount(0);
  await input.fill("Brower");
  await input.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await input.fill("Brower");
  await input.press("Enter");
  await expect(page).toHaveURL("/projets/brower");
  await expect(dialog).not.toBeVisible();
  await trigger.click();
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page).toHaveURL("/projets");
  await trigger.click();
  await input.fill("a essayer");
  await input.press("Enter");
  await expect(page).toHaveURL("/a-essayer");
  await trigger.focus();
  await page.keyboard.press("Control+k");
  await expect(input).toBeFocused();
  await input.press("Escape");
  await expect(trigger).toBeFocused();
  await page.setViewportSize({ width: 320, height: 900 });
  await trigger.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Fermer la recherche" }).click();
  await expect(trigger).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("floating sidebar keeps a tight inset and follows desktop scroll", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const box = await page.locator(".atelier-sidebar").boundingBox();
    expect(box!.x).toBe(8);
    expect(box!.y).toBe(8);
    expect(
      await page
        .locator(".atelier-sidebar")
        .evaluate((el) => getComputedStyle(el).borderRadius),
    ).toBe("14px");
    if (width > 760) expect(box!.height).toBe(884);
  }
  await page.goto("/projets");
  await page.evaluate(() => scrollTo(0, 400));
  const sticky = await page.locator(".atelier-sidebar").boundingBox();
  expect(sticky!.y).toBe(8);
});

test("all desktop project sheets fit without page or nested scrolling", async ({
  page,
}) => {
  const ids = [
    "safee",
    "brower",
    "exo",
    "amp",
    "cashou",
    "tvcal",
    "travel-resolver",
    "snake",
    "tamanotchi",
    "betterbattery",
    "kubequest",
    "removebg",
    "exif-dates",
    "geeft",
  ];
  for (const [width, height] of [
    [1100, 680],
    [1280, 680],
    [1100, 720],
    [1280, 720],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    for (const id of ids) {
      await page.goto(`/projets/${id}`);
      await page.evaluate(() => document.fonts.ready);
      const geometry = await page.evaluate(() => ({
        doc: document.documentElement.scrollHeight,
        viewport: innerHeight,
        horizontal: document.documentElement.scrollWidth <= innerWidth,
        bounds: [
          ...document.querySelectorAll(
            ".detail-metadata, .project-detail figure, .detail-heading, footer",
          ),
        ].map((el) => el.getBoundingClientRect().bottom),
        overflow: [
          ...document.querySelectorAll(
            ".project-page, .project-detail, .detail-metadata",
          ),
        ].map((el) => ({ scroll: el.scrollHeight, client: el.clientHeight })),
      }));
      expect(geometry.doc, `${id} at ${width}x${height}`).toBeLessThanOrEqual(
        height + 1,
      );
      expect(geometry.horizontal).toBe(true);
      for (const bottom of geometry.bounds)
        expect(bottom).toBeLessThanOrEqual(height + 1);
      for (const box of geometry.overflow)
        expect(box.scroll).toBeLessThanOrEqual(box.client + 1);
      if (width === 1440 && ["safee", "exif-dates", "geeft"].includes(id))
        await page.screenshot({
          path: test.info().outputPath(`sheet-${id}.png`),
        });
    }
  }
});

async function pickTheme(page: import("@playwright/test").Page, name: string) {
  await page
    .getByRole("radiogroup", { name: "Thème", exact: true })
    .getByRole("radio", { name, exact: true })
    .click();
}
test("icon-only theme toggle defaults to system, supports keyboard, and portfolio branding is consistent", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.goto("/");
  const toggle = page.getByRole("radiogroup", { name: "Thème", exact: true });
  await expect(toggle.getByRole("radio")).toHaveCount(3);
  await expect(toggle).toHaveText("");
  await expect(toggle.getByRole("radio", { name: "Système" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(
    page.getByRole("link", { name: "yohan/portfolio — Accueil" }),
  ).toBeVisible();
  for (const width of [320, 390, 760, 768, 900, 1100, 1150, 1151, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(toggle).toBeVisible();
    const bounds = await toggle.boundingBox();
    expect(bounds).toMatchObject({ width: 98, height: 32 });
    const sidebar = await page.locator(".atelier-sidebar").boundingBox();
    const brand = await page.locator(".brand-word").boundingBox();
    const guest = await page.locator(".guest-identity").boundingBox();
    const nav = await page.locator(".sidebar-nav").boundingBox();
    expect(bounds!.x).toBeGreaterThan(sidebar!.x);
    expect(bounds!.x + bounds!.width).toBeLessThan(sidebar!.x + sidebar!.width);
    expect(bounds!.y).toBeGreaterThan(sidebar!.y);
    if (width > 760) {
      expect(brand!.x + brand!.width).toBeLessThanOrEqual(bounds!.x - 1);
      expect(
        Math.abs(brand!.y + brand!.height / 2 - bounds!.y - bounds!.height / 2),
      ).toBeLessThan(1);
    } else {
      expect(brand!.y + brand!.height).toBeLessThanOrEqual(bounds!.y);
      expect(bounds!.x + bounds!.width).toBeLessThan(guest!.x);
      expect(bounds!.y + bounds!.height).toBeLessThan(nav!.y);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 900, height: 900 });
  const largerFallback = await page.addStyleTag({
    content: ".sidebar-brand-row .brand-word { font: 22px monospace; }",
  });
  expect(
    await page
      .locator(".brand-word")
      .evaluate((el) => el.scrollWidth > el.clientWidth),
  ).toBe(true);
  const clippedTitle = await page.locator(".brand-word").boundingBox();
  const stableToggle = await toggle.boundingBox();
  expect(clippedTitle!.x + clippedTitle!.width).toBeLessThan(stableToggle!.x);
  await largerFallback.evaluate((el) => el.parentNode?.removeChild(el));
  await page.emulateMedia({ forcedColors: "active" });
  await expect(toggle.getByRole("radio", { name: "Système" })).toHaveCSS(
    "outline-style",
    "solid",
  );
  await expect(toggle.getByRole("radio", { name: "Système" })).toHaveCSS(
    "outline-width",
    "2px",
  );
  await page.emulateMedia({ forcedColors: "none" });
  await toggle.getByRole("radio", { name: "Système" }).focus();
  await page.keyboard.press("Home");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(toggle.getByRole("radio", { name: "Clair" })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle.getByRole("radio", { name: "Sombre" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.keyboard.press("ArrowLeft");
  await expect(toggle.getByRole("radio", { name: "Système" })).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme-preference",
    "system",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("atelier.theme")),
  ).toBeNull();
  for (const path of [
    "/",
    "/projets",
    "/a-essayer",
    "/labo",
    "/parcours",
    "/contact",
    "/archives",
    "/404",
  ]) {
    await page.goto(path);
    await expect(page.locator("body")).not.toContainText(/atelier/i);
  }
});
test("header is transparent and controls have equal height; dark theme covers every page", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.goto("/");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const search = await page.locator(".command-trigger").boundingBox();
    const login = await page.locator(".header-contact").boundingBox();
    expect(search!.height).toBe(42);
    expect(login!.height).toBe(42);
    expect(
      await page
        .locator(".workspace-header")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgba(0, 0, 0, 0)");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await pickTheme(page, "Sombre");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("atelier.theme"))).toBe(
    "dark",
  );
  for (const path of [
    "/",
    "/projets",
    "/a-essayer",
    "/labo",
    "/parcours",
    "/contact",
    "/archives",
    "/projets/safee",
  ]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(
      await page
        .locator("body")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgb(12, 32, 24)");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projets");
  await expect(page.locator(".project-card").first()).toHaveCSS(
    "background-color",
    "rgb(18, 43, 32)",
  );
  await expect(page.locator(".project-capture").first()).toHaveCSS(
    "filter",
    "none",
  );
  await page.screenshot({ path: test.info().outputPath("dark-desktop.png") });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page.screenshot({ path: test.info().outputPath("dark-mobile.png") });
  await page
    .getByRole("button", { name: "Rechercher dans le portfolio" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCSS(
    "background-color",
    "rgb(12, 32, 24)",
  );
});
test("system theme follows OS, explicit choice overrides it, and storage failures stay usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme-preference",
    "system",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("atelier.theme")),
  ).toBeNull();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await pickTheme(page, "Sombre");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await pickTheme(page, "Système");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.evaluate(() =>
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      },
    }),
  );
  await pickTheme(page, "Clair");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator('.sidebar-nav a[href="/projets"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("theme starts before hydration; unsupported/reduced animation and cross-tab changes work", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("atelier.theme", "dark");
    Object.defineProperty(document, "startViewTransition", {
      value: undefined,
      configurable: true,
    });
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.route(/_next\/static\/.*\.js/, (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.unroute(/_next\/static\/.*\.js/);
  await page.reload();
  await pickTheme(page, "Clair");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.evaluate(() => {
    localStorage.setItem("atelier.theme", "dark");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "atelier.theme", newValue: "dark" }),
    );
  });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "Sombre" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});
test("theme transition expands a circle from its button like Exo and skips reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  await page.goto("/");
  await page.evaluate(() => {
    const animate = document.documentElement.animate.bind(
      document.documentElement,
    );
    (window as unknown as { themeAnimations: unknown[] }).themeAnimations = [];
    document.documentElement.animate = ((frames, options) => {
      (
        window as unknown as { themeAnimations: unknown[] }
      ).themeAnimations.push({ frames, options });
      return animate(frames, options);
    }) as typeof document.documentElement.animate;
  });
  await pickTheme(page, "Sombre");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { themeAnimations: unknown[] }).themeAnimations
            .length,
      ),
    )
    .toBe(1);
  const animation = await page.evaluate(
    () =>
      (
        window as unknown as {
          themeAnimations: {
            frames: { clipPath: string[] };
            options: { duration: number; pseudoElement: string };
          }[];
        }
      ).themeAnimations[0],
  );
  expect(animation.frames.clipPath[0]).toContain("circle(0px");
  expect(animation.options.duration).toBe(450);
  expect(animation.options.pseudoElement).toBe("::view-transition-new(root)");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await pickTheme(page, "Clair");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { themeAnimations: unknown[] }).themeAnimations
          .length,
    ),
  ).toBe(1);
});
