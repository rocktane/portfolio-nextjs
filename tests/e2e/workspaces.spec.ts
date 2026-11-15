import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/api\.open-meteo\.com/, (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
});
test("kanban moves across columns with pointer and keyboard, persists, and resets", async ({
  page,
}) => {
  await page.goto("/projets");
  await expect(page.locator(".kb-card")).toHaveCount(14);
  const card = page.getByRole("button", {
    name: "Déplacer Travel Resolver",
    exact: true,
  });
  const target = page.getByRole("button", {
    name: "Déplacer Amp",
    exact: true,
  });
  const from = await card.boundingBox(),
    to = await target.boundingBox();
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    from!.x + from!.width / 2 + 10,
    from!.y + from!.height / 2,
    { steps: 3 },
  );
  await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, {
    steps: 20,
  });
  await page.mouse.up();
  const column = page.locator(".kb-column").filter({
    has: page.getByRole("heading", { name: "En cours", exact: true }),
  });
  await expect(
    column.getByRole("button", { name: "Ouvrir Travel Resolver", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    column.getByRole("button", { name: "Ouvrir Travel Resolver", exact: true }),
  ).toBeVisible();
  const grip = page.getByRole("button", {
    name: "Déplacer Travel Resolver",
    exact: true,
  });
  await grip.focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".kb-card-overlay")).toBeVisible();
  // The sensor attaches its document listeners and measures droppables on the next frame.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.keyboard.press("ArrowDown");
  await expect(
    page.locator('[role="status"]').filter({ hasText: "Au-dessus de Amp." }),
  ).toHaveCount(1);
  await page.keyboard.press("Space");
  const names = await column.locator(".kb-card-title").allTextContents();
  expect(names.indexOf("Travel Resolver")).toBeGreaterThan(0);
  await page
    .getByRole("button", { name: "Réinitialiser", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Réinitialiser le tableau", exact: true })
    .click();
  await expect(
    page
      .locator(".kb-column")
      .first()
      .getByRole("button", { name: "Ouvrir Travel Resolver", exact: true }),
  ).toBeVisible();
});
test("kanban column and card editing, undo, filter and reorder work", async ({
  page,
}) => {
  await page.goto("/projets");
  await page
    .getByRole("button", { name: "Ajouter une colonne", exact: false })
    .click();
  await page
    .getByRole("textbox", { name: "Titre", exact: true })
    .fill("À explorer");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  let column = page.locator(".kb-column").filter({
    has: page.getByRole("heading", { name: "À explorer", exact: true }),
  });
  await column
    .getByRole("button", { name: "Ajouter une carte", exact: false })
    .click();
  await page
    .getByRole("textbox", { name: "Titre", exact: true })
    .fill("Nouvelle idée");
  await page
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Un outil à prototyper");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(
    column.getByRole("button", { name: "Ouvrir Nouvelle idée", exact: true }),
  ).toBeVisible();
  await page.reload();
  column = page.locator(".kb-column").filter({
    has: page.getByRole("heading", { name: "À explorer", exact: true }),
  });
  await column.locator("summary").click();
  await column
    .getByRole("button", { name: "Déplacer à gauche", exact: true })
    .click();
  await expect(
    page
      .locator(".kb-column")
      .nth(4)
      .getByRole("heading", { name: "À explorer", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await expect(
    page
      .locator(".kb-column")
      .last()
      .getByRole("heading", { name: "À explorer", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("searchbox", { name: "Filtrer les cartes" })
    .fill("Nouvelle idée");
  await expect(page.locator(".kb-card")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Déplacer Nouvelle idée", exact: true }),
  ).toBeDisabled();
});
test("a denied local workspace stays usable", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get: () => {
        throw new DOMException("Denied", "SecurityError");
      },
    }),
  );
  await page.goto("/projets");
  await page.getByRole("button", { name: "Ouvrir Amp", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Titre", exact: true })
    .fill("Amp personnalisé");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Ouvrir Amp personnalisé", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".workspace-feedback")).toContainText(
    "stockage est indisponible",
  );
});
test("columns can be dragged and card bodies are draggable too", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/projets");
  async function drag(sourceName: string, targetName: string) {
    const source = page.getByRole("button", { name: sourceName, exact: true });
    const target = page.getByRole("button", { name: targetName, exact: true });
    const from = await source.boundingBox(),
      to = await target.boundingBox();
    await page.mouse.move(
      from!.x + from!.width / 2,
      from!.y + from!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      from!.x + from!.width / 2 + 10,
      from!.y + from!.height / 2,
      { steps: 3 },
    );
    await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, {
      steps: 20,
    });
    await page.mouse.up();
  }
  await drag("Déplacer la colonne Non publié", "Déplacer la colonne En cours");
  await expect(
    page.locator(".kb-column").first().getByRole("heading"),
  ).toHaveText("En cours");
  await drag("Ouvrir Travel Resolver", "Ouvrir Amp");
  await expect(
    page
      .locator(".kb-column")
      .first()
      .getByRole("button", { name: "Ouvrir Travel Resolver", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("Notion property menus combine filters, show sort chips and open records", async ({
  page,
}) => {
  await page.goto("/parcours");
  await expect(page.locator(".notion-table tbody tr")).toHaveCount(11);
  const before = await page.locator(".notion-table-scroll").boundingBox();
  await page.getByRole("button", { name: "Filtrer", exact: true }).click();
  expect((await page.locator(".notion-table-scroll").boundingBox())!.y).toBe(
    before!.y,
  );

  await page
    .getByRole("searchbox", { name: "Rechercher une propriété à filtrer" })
    .fill("organ");
  await page
    .getByRole("dialog", { name: "Filtrer le parcours" })
    .getByRole("button", { name: "Organisme", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Condition du filtre 1" })
    .selectOption("contains");
  await page.getByRole("textbox", { name: "Valeur du filtre 1" }).fill("Wagon");
  await expect(page.locator(".notion-table tbody tr")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Ajouter un filtre", exact: false })
    .click();
  await page
    .getByRole("dialog", { name: "Filtrer le parcours" })
    .getByRole("button", { name: "Type", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Valeur du filtre 2" })
    .fill("Formation");
  await expect(page.locator(".notion-table tbody tr")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Filtrer", exact: true }).click();
  await page
    .getByRole("button", { name: "Ajouter un filtre avancé", exact: false })
    .click();
  await page
    .getByRole("combobox", { name: "Combinaison des filtres" })
    .selectOption("or");
  await expect(page.locator(".notion-table tbody tr")).toHaveCount(4);
  await page.getByRole("button", { name: "Tout effacer", exact: true }).click();
  await expect(page.locator(".notion-table tbody tr")).toHaveCount(11);
  await page.keyboard.press("Escape");
  for (const name of ["Expériences", "Formations", "Tout le parcours"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Réinitialiser la vue", exact: true }),
    ).toHaveCount(0);
  }
  await expect(
    page.getByRole("button", { name: "Trier", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "+ Filtrer", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Trier par Période", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Trier par Période", exact: true })
    .click();
  await expect(page.locator(".notion-sort-chip")).toContainText("Période");
  await expect(page.locator(".notion-table tbody tr").first()).toContainText(
    "Déploiement d’agents IA",
  );
  await page.getByRole("button", { name: "Modifier le tri 1" }).click();
  await page
    .getByRole("combobox", { name: "Sens du tri 1" })
    .selectOption("asc");
  await expect(page.locator(".notion-table tbody tr").first()).toContainText(
    "Apprenti ingénieur",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Propriétés", exact: true }).click();
  await page
    .getByRole("button", { name: "Tout afficher", exact: true })
    .click();
  await expect(page.locator(".notion-table th")).toHaveCount(14);
  await page.getByRole("checkbox", { name: "Contexte", exact: true }).uncheck();
  await expect(page.locator(".notion-table th")).toHaveCount(13);
  await page
    .getByRole("button", { name: "Fermer les propriétés", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Développeur fullstack web et mobile/ })
    .click();
  await expect(page.getByRole("dialog")).toContainText("WebSocket");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("workspaces fit small screens and support the dark theme", async ({
  page,
}) => {
  for (const width of [320, 390, 1100, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/projets", "/parcours", "/favoris"]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (path === "/projets") {
        const shell = await page.locator(".workspace-shell").boundingBox();
        const viewport = await page.locator(".kb-scroll").boundingBox();
        expect(viewport!.x).toBeCloseTo(0, 0);
        if (width > 760) {
          const underlay = await page.evaluate(() => {
            const scroller = document.querySelector<HTMLElement>(".kb-scroll")!;
            scroller.scrollLeft = 180;
            const card = document
              .querySelector(".kb-column")!
              .getBoundingClientRect();
            const sidebar = document
              .querySelector(".atelier-sidebar")!
              .getBoundingClientRect();
            const hit = document.elementFromPoint(40, card.top + 80);
            const result = {
              passesUnder: card.left < sidebar.right,
              navigationAbove: Boolean(hit?.closest(".atelier-sidebar")),
            };
            scroller.scrollLeft = 0;
            return result;
          });
          expect(underlay.passesUnder).toBe(true);
          expect(underlay.navigationAbove).toBe(true);
        }
        expect(viewport!.x + viewport!.width).toBeCloseTo(
          shell!.x + shell!.width,
          0,
        );
      }
      await page.screenshot({
        path: `/tmp/portfolio-${path.slice(1)}-${width}.png`,
        animations: "disabled",
        fullPage: true,
      });
    }
  }
  await page.evaluate(() => localStorage.setItem("atelier.theme", "dark"));
  await page.goto("/parcours");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".notion-workspace")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await page.screenshot({
    path: "/tmp/portfolio-parcours-dark.png",
    animations: "disabled",
  });
});

test("portfolio workspaces use the shared theme and compact Notion controls", async ({
  page,
}) => {
  await page.goto("/projets");
  await expect(page.locator(".kanban-workspace")).toHaveCSS(
    "border-top-width",
    "0px",
  );
  await expect(page.locator(".kanban-workspace")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(
    page.getByText("Le tableau des projets", { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".kb-intro, .kb-total, .kb-help")).toHaveCount(0);
  await page.getByRole("button", { name: "Ouvrir Amp", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(page.getByRole("dialog")).toHaveCSS("color", "rgb(25, 62, 50)");
  await page.keyboard.press("Escape");
  await page.goto("/parcours");
  await expect(
    page.locator(".notion-page-icon, .notion-database-title > span"),
  ).toHaveCount(0);
  await expect(page.locator(".notion-workspace")).toHaveCSS(
    "padding-top",
    "0px",
  );
  await expect(
    page.getByRole("searchbox", { name: "Rechercher dans le parcours" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Rechercher dans le parcours", exact: true })
    .click();
  const input = page.getByRole("searchbox", {
    name: "Rechercher dans le parcours",
  });
  await expect(input).toBeFocused();
  await input.fill("Wagon");
  await expect(page.locator(".notion-table tbody tr")).toHaveCount(2);
  await input.press("Escape");
  await expect(input).toHaveCount(0);
  await expect(page.locator(".notion-table tbody tr")).toHaveCount(11);
  const tableBefore = await page.locator(".notion-table-scroll").boundingBox();
  await page.getByRole("button", { name: "Propriétés", exact: true }).click();
  const sidebar = page.getByRole("dialog", {
    name: "Propriétés du parcours",
  });
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveCSS("position", "fixed");
  expect((await sidebar.boundingBox())!.width).toBeLessThanOrEqual(380);
  await expect(sidebar.getByRole("searchbox")).toBeFocused();
  expect(
    (await page.locator(".notion-table-scroll").boundingBox())!.width,
  ).toBe(tableBefore!.width);
  await sidebar
    .getByRole("checkbox", { name: "Contexte", exact: true })
    .check();
  await expect(page.locator(".notion-table th")).toHaveCount(9);
  await page.keyboard.press("Escape");
  await expect(sidebar).toHaveCount(0);
  const firstTitle = page.locator(".notion-row-title").first();
  await firstTitle.hover();
  await expect(firstTitle.locator(".notion-open-label")).toHaveText("OUVRIR");
  await expect(firstTitle.locator(".notion-open-label svg")).toBeVisible();
  const colors = await page
    .locator(
      ".notion-table tbody td .notion-tag-green, .notion-table tbody td .notion-tag-purple, .notion-table tbody td .notion-tag-pink, .notion-table tbody td .notion-tag-yellow",
    )
    .evaluateAll((elements) => [
      ...new Set(elements.map((el) => getComputedStyle(el).backgroundColor)),
    ]);
  expect(colors.length).toBeGreaterThanOrEqual(4);
});
test("record dialogs lock the background and restore its scroll position", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto("/parcours");
  await page.evaluate(() => window.scrollTo({ top: 120, behavior: "instant" }));
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const titleBefore = (await page.locator(".notion-title-row").boundingBox())!
    .y;
  await page
    .getByRole("button", { name: /Développeur fullstack web et mobile/ })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await expect(page.locator("body")).toHaveCSS("position", "fixed");
  await page.mouse.move(10, 300);
  await page.mouse.wheel(0, 600);
  expect(
    (await page.locator(".notion-title-row").boundingBox())!.y,
  ).toBeCloseTo(titleBefore, 0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBe(scrollBefore);
  await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
});

test("glass buttons share a hover and the view switch keeps its tooltip while switching", async ({
  page,
}) => {
  await page.goto("/projets");
  const add = page.getByRole("button", {
    name: "Ajouter une colonne",
    exact: false,
  });
  const signIn = page.locator(".header-contact");
  const search = page.locator(".command-trigger");
  const appearance = (element: import("@playwright/test").Locator) =>
    element.evaluate((el) => {
      const css = getComputedStyle(el);
      return {
        background: css.backgroundColor,
        border: css.borderColor,
        height: css.height,
        weight: css.fontWeight,
        fontSize: css.fontSize,
      };
    });
  expect(await appearance(add)).toEqual(await appearance(signIn));
  for (const button of [add, search, signIn]) {
    await button.hover();
    const expected = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--hover")
        .trim(),
    );
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).backgroundColor))
      .toBe(
        await page.evaluate((color) => {
          const el = document.createElement("div");
          el.style.color = color;
          document.body.append(el);
          const normalized = getComputedStyle(el).color;
          el.remove();
          return normalized;
        }, expected),
      );
  }
  const grid = page.getByRole("button", { name: "Vue grille", exact: true });
  const list = page.getByRole("button", { name: "Vue liste", exact: true });
  await grid.hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toHaveText("Grille", { timeout: 500 });
  const originalTooltip = await tooltip.elementHandle();
  await list.hover();
  await expect(tooltip).toHaveText("Liste");
  expect(await originalTooltip!.evaluate((node) => node.isConnected)).toBe(
    true,
  );
  await list.click();
  await expect(list).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(tooltip).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await grid.focus();
  await expect(page.getByRole("tooltip")).toHaveText("Grille");
  await grid.press("Enter");
  await expect(grid).toHaveAttribute("aria-pressed", "true");
});
