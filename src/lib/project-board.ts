import { projects } from "@/data/projects";
import { createLocalStore } from "./local-store";

export type BoardCard = {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  tags: string[];
  accent: string;
};
export type BoardColumn = { id: string; title: string; cards: BoardCard[] };
export type ProjectBoard = { columns: BoardColumn[] };
const statuses = [
  ["unreleased", "Non publié"],
  ["wip", "En cours"],
  ["beta", "Bêta"],
  ["live", "En ligne"],
  ["sunset", "Archives"],
] as const;
export const initialBoard: ProjectBoard = {
  columns: statuses.map(([status, title]) => ({
    id: `column-${status}`,
    title,
    cards: projects
      .filter((p) => p.status === status)
      .map((p) => ({
        id: `card-${p.id}`,
        projectId: p.id,
        title: p.title,
        description: p.summary,
        tags: p.stack,
        accent: p.accent,
      })),
  })),
};
export function isProjectBoard(value: unknown): value is ProjectBoard {
  if (
    !value ||
    typeof value !== "object" ||
    !("columns" in value) ||
    !Array.isArray(value.columns) ||
    value.columns.length < 1 ||
    value.columns.length > 30
  )
    return false;
  const ids = new Set<string>();
  return value.columns.every((column: unknown) => {
    if (!column || typeof column !== "object") return false;
    const c = column as BoardColumn;
    if (
      typeof c.id !== "string" ||
      !c.id.startsWith("column-") ||
      ids.has(c.id) ||
      typeof c.title !== "string" ||
      !c.title.trim() ||
      c.title.length > 80 ||
      !Array.isArray(c.cards) ||
      c.cards.length > 200
    )
      return false;
    ids.add(c.id);
    return c.cards.every((card: unknown) => {
      if (!card || typeof card !== "object") return false;
      const p = card as BoardCard;
      if (
        typeof p.id !== "string" ||
        !p.id.startsWith("card-") ||
        ids.has(p.id) ||
        typeof p.title !== "string" ||
        !p.title.trim() ||
        p.title.length > 120 ||
        typeof p.description !== "string" ||
        p.description.length > 5000 ||
        !Array.isArray(p.tags) ||
        p.tags.length > 30 ||
        !p.tags.every((t) => typeof t === "string" && t.length <= 80) ||
        typeof p.accent !== "string" ||
        !/^#[0-9a-f]{6}$/i.test(p.accent) ||
        (p.projectId !== undefined &&
          !projects.some((project) => project.id === p.projectId))
      )
        return false;
      ids.add(p.id);
      return true;
    });
  });
}
export function moveBoardCard(
  board: ProjectBoard,
  cardId: string,
  columnId: string,
  index: number,
): ProjectBoard {
  const card = board.columns
    .flatMap((c) => c.cards)
    .find((c) => c.id === cardId);
  if (!card || !board.columns.some((c) => c.id === columnId)) return board;
  return {
    columns: board.columns.map((c) => {
      const cards = c.cards.filter((p) => p.id !== cardId);
      if (c.id === columnId)
        cards.splice(Math.max(0, Math.min(index, cards.length)), 0, card);
      return { ...c, cards };
    }),
  };
}
export const projectBoardStore = createLocalStore(
  "atelier.project-board.v1",
  initialBoard,
  isProjectBoard,
);
