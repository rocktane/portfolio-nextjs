import { describe, expect, test } from "bun:test";
import {
  initialBoard,
  isProjectBoard,
  moveBoardCard,
} from "../../src/lib/project-board";
import { career } from "../../src/data/career";
import { queryCareer, type CareerFilter } from "../../src/lib/career";

describe("visitor project board", () => {
  test("moves between columns and reorders without duplicating or changing the source", () => {
    const source = initialBoard.columns[0],
      card = source.cards[0],
      target = initialBoard.columns[3];
    const moved = moveBoardCard(initialBoard, card.id, target.id, 0);
    expect(moved.columns[3].cards[0].id).toBe(card.id);
    expect(moved.columns[0].cards).not.toContainEqual(card);
    expect(initialBoard.columns[0].cards[0].id).toBe(card.id);
    const reordered = moveBoardCard(moved, card.id, target.id, 999);
    expect(reordered.columns[3].cards.at(-1)?.id).toBe(card.id);
    expect(reordered.columns.flatMap((c) => c.cards).length).toBe(14);
    expect(
      new Set(reordered.columns.flatMap((c) => c.cards.map((p) => p.id))).size,
    ).toBe(14);
  });
  test("rejects broken, duplicate, empty and hostile saved data", () => {
    expect(isProjectBoard(initialBoard)).toBe(true);
    expect(isProjectBoard({ columns: [] })).toBe(false);
    expect(isProjectBoard({ columns: [null] })).toBe(false);
    const broken = structuredClone(initialBoard);
    broken.columns[1].cards[0].id = broken.columns[0].cards[0].id;
    expect(isProjectBoard(broken)).toBe(false);
    const unknown = structuredClone(initialBoard);
    unknown.columns[0].cards[0].projectId = "not-a-real-project";
    expect(isProjectBoard(unknown)).toBe(false);
    expect(moveBoardCard(initialBoard, "missing", "missing", 0)).toBe(
      initialBoard,
    );
  });
});
describe("career database", () => {
  const filters: CareerFilter[] = [
    { id: "1", property: "organization", operator: "contains", value: "wagon" },
    { id: "2", property: "kind", operator: "is", value: "Formation" },
  ];
  test("combines conditions with AND or OR and handles missing information", () => {
    expect(
      queryCareer(career, "", "", filters, "and", []).map((e) => e.id),
    ).toEqual(["wagon-bootcamp"]);
    expect(queryCareer(career, "", "", filters, "or", [])).toHaveLength(4);
    const empty: CareerFilter = {
      id: "3",
      property: "contract",
      operator: "empty",
      value: "",
    };
    expect(
      queryCareer(career, "", "", [empty], "and", []).every((e) => !e.contract),
    ).toBe(true);
    expect(
      queryCareer(career, "epitech", "Expérience", [], "and", []),
    ).toHaveLength(0);
    expect(
      queryCareer(career, "ENERGIE", "", [], "and", []).some(
        (e) => e.id === "themaverde",
      ),
    ).toBe(true);
  });
  test("sorts real dates and applies secondary sorts consistently", () => {
    const dates = queryCareer(career, "", "", [], "and", [
      { property: "period", direction: "desc" },
    ]);
    expect(dates[0].id).toBe("missions-ia");
    expect(dates.at(-1)?.id).toBe("themaverde-apprentissage");
    const sorted = queryCareer(career, "", "", [], "and", [
      { property: "organization", direction: "asc" },
      { property: "period", direction: "desc" },
    ]);
    expect(
      sorted.filter((e) => e.organization === "Le Wagon").map((e) => e.id),
    ).toEqual(["wagon-assistant", "wagon-bootcamp"]);
    expect(career[0].id).toBe("safee");
  });
});
