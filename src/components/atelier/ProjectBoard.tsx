"use client";
import Link from "next/link";
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type CollisionDetection,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { normalizeSearch } from "@/lib/atelier";
import {
  projectBoardStore,
  moveBoardCard,
  type BoardCard,
  type BoardColumn,
  type ProjectBoard,
} from "@/lib/project-board";
import WorkspaceDialog from "./WorkspaceDialog";
import Icon from "./Icon";

type Editor =
  | { kind: "card"; columnId: string; card?: BoardCard }
  | { kind: "column"; column?: BoardColumn }
  | { kind: "reset" }
  | { kind: "delete-column"; column: BoardColumn };
const collision: CollisionDetection = (args) =>
  args.active.data.current?.type === "column"
    ? closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (c) => c.data.current?.type === "column",
        ),
      })
    : closestCorners({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (c) =>
            c.data.current?.type === "card" ||
            (c.data.current?.type === "column" && !c.data.current?.count),
        ),
      });

// Nested sortable lists share a DndContext. Keyboard navigation must use the
// same targets as pointer collisions, rather than selecting a parent column.
const keyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
  const rects = new Map(args.context.droppableRects);
  const type = args.context.active?.data.current?.type;
  for (const container of args.context.droppableContainers.values()) {
    const data = container.data.current;
    const eligible =
      type === "column"
        ? data?.type === "column"
        : data?.type === "card" || (data?.type === "column" && !data?.count);
    if (!eligible) rects.delete(container.id);
  }
  return sortableKeyboardCoordinates(event, {
    ...args,
    context: { ...args.context, droppableRects: rects },
  });
};

function CardFace({ card }: { card: BoardCard }) {
  return (
    <>
      <span className="kb-card-tab" style={{ background: card.accent }} />
      <span className="kb-card-labels">
        {card.tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </span>
      <span className="kb-card-title">{card.title}</span>
      <span className="kb-card-summary">{card.description}</span>
      {card.projectId && (
        <span className="kb-card-footer">
          <Icon name="file" /> Fiche projet
        </span>
      )}
    </>
  );
}
function SortableCard({
  card,
  disabled,
  onOpen,
}: {
  card: BoardCard;
  disabled: boolean;
  onOpen: () => void;
}) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
    isOver,
  } = useSortable({
    id: card.id,
    data: { type: "card", title: card.title },
    disabled,
  });
  return (
    <li
      ref={setNodeRef}
      {...listeners}
      className={`kb-card${isDragging ? " is-dragging" : ""}${isOver && !isDragging ? " is-over" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        className="kb-card-open"
        type="button"
        onClick={onOpen}
        aria-label={`Ouvrir ${card.title}`}
      >
        <CardFace card={card} />
      </button>
      <button
        ref={setActivatorNodeRef}
        className="kb-card-grip"
        type="button"
        {...attributes}
        disabled={disabled}
        aria-label={`Déplacer ${card.title}`}
        title="Glisser ou appuyer sur Espace pour déplacer"
      >
        ⠿
      </button>
    </li>
  );
}
function Column({
  column,
  disabled,
  onOpen,
  onEdit,
  onDelete,
  onMove,
  children,
}: {
  column: BoardColumn;
  disabled: boolean;
  onOpen: (card: BoardCard) => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: number) => void;
  children: ReactNode;
}) {
  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
    isOver,
  } = useSortable({
    id: column.id,
    data: { type: "column", count: column.cards.length, title: column.title },
    disabled,
  });
  return (
    <section
      ref={setNodeRef}
      className={`kb-column${isDragging ? " is-dragging" : ""}${isOver ? " is-over" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      aria-label={column.title}
    >
      <header className="kb-column-heading">
        <button
          className="kb-column-grip"
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled}
          aria-label={`Déplacer la colonne ${column.title}`}
        >
          ⠿
        </button>
        <h2>{column.title}</h2>
        <span className="kb-count">{column.cards.length}</span>
        <details className="workspace-menu">
          <summary aria-label={`Actions de la colonne ${column.title}`}>
            ⋯
          </summary>
          <div
            className="workspace-menu-content"
            onClick={(event) => {
              if (event.target instanceof HTMLButtonElement)
                event.currentTarget.closest("details")?.removeAttribute("open");
            }}
          >
            <button type="button" onClick={onEdit}>
              Renommer
            </button>
            <button type="button" onClick={() => onMove(-1)}>
              Déplacer à gauche
            </button>
            <button type="button" onClick={() => onMove(1)}>
              Déplacer à droite
            </button>
            <button type="button" className="danger-text" onClick={onDelete}>
              Supprimer la colonne
            </button>
          </div>
        </details>
      </header>
      <SortableContext
        items={column.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="kb-cards">
          {column.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              disabled={disabled}
              onOpen={() => onOpen(card)}
            />
          ))}
          {!column.cards.length && (
            <li className="kb-empty">
              {disabled ? "Aucun résultat" : "Glissez une carte ici."}
            </li>
          )}
        </ol>
      </SortableContext>
      {children}
    </section>
  );
}
export default function ProjectBoardView({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const board = projectBoardStore.useValue();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [message, setMessage] = useState("");
  const [previous, setPrevious] = useState<ProjectBoard | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: keyboardCoordinates,
      scrollBehavior: "auto",
    }),
  );
  const normalized = normalizeSearch(query);
  const filtered = Boolean(normalized);
  const columns = board.columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) =>
      normalizeSearch(
        [card.title, card.description, ...card.tags].join(" "),
      ).includes(normalized),
    ),
  }));
  const activeCard = board.columns
    .flatMap((c) => c.cards)
    .find((c) => c.id === activeId);
  const activeColumn = board.columns.find((c) => c.id === activeId);
  function commit(next: ProjectBoard, text: string) {
    setPrevious(board);
    const persisted = projectBoardStore.set(next);
    setMessage(
      text +
        (persisted
          ? ""
          : " Le stockage est indisponible : modifications conservées pour cette visite."),
    );
  }
  function moveColumn(columnId: string, direction: number) {
    const from = board.columns.findIndex((c) => c.id === columnId);
    const to = Math.max(
      0,
      Math.min(board.columns.length - 1, from + direction),
    );
    if (from !== to)
      commit(
        { columns: arrayMove(board.columns, from, to) },
        "Colonne déplacée.",
      );
  }
  function onDrop({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (filtered || !over || active.id === over.id) return;
    if (active.data.current?.type === "column") {
      const from = board.columns.findIndex((c) => c.id === active.id),
        to = board.columns.findIndex((c) => c.id === over.id);
      if (from >= 0 && to >= 0)
        commit(
          { columns: arrayMove(board.columns, from, to) },
          "Colonne déplacée.",
        );
      return;
    }
    const target = board.columns.find(
      (c) => c.id === over.id || c.cards.some((card) => card.id === over.id),
    );
    if (!target) return;
    const index = target.cards.findIndex((c) => c.id === over.id);
    commit(
      moveBoardCard(
        board,
        String(active.id),
        target.id,
        index < 0 ? target.cards.length : index,
      ),
      `Carte déplacée dans ${target.title}.`,
    );
  }
  return (
    <div className="kanban-workspace">
      <div className="kb-toolbar">
        <label className="kb-search">
          <Icon name="search" />
          <input
            type="search"
            aria-label="Filtrer les cartes"
            placeholder="Titre, description ou technologie"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <div className="kb-toolbar-actions">
          {previous && (
            <button
              type="button"
              onClick={() => {
                projectBoardStore.set(previous);
                setPrevious(null);
                setMessage("Dernière modification annulée.");
              }}
            >
              Annuler
            </button>
          )}
          <button type="button" onClick={() => setEditor({ kind: "reset" })}>
            Réinitialiser
          </button>
        </div>
      </div>
      {filtered && (
        <p className="kb-help" role="status">
          {columns.reduce((n, c) => n + c.cards.length, 0)} résultat(s). Effacez
          la recherche pour déplacer les cartes.
        </p>
      )}
      <DndContext
        id={id}
        sensors={sensors}
        collisionDetection={collision}
        onDragStart={({ active }) => setActiveId(String(active.id))}
        onDragEnd={onDrop}
        onDragCancel={() => setActiveId(null)}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              "Appuyez sur Espace pour saisir, utilisez les flèches pour déplacer, Espace pour déposer, Échap pour annuler.",
          },
          announcements: {
            onDragStart: () =>
              "Élément saisi. Utilisez les flèches pour le déplacer.",
            onDragOver: ({ over }) =>
              over
                ? `Au-dessus de ${over.data.current?.title ?? "la zone de dépôt"}.`
                : "En dehors du tableau.",
            onDragEnd: () => "Déplacement terminé.",
            onDragCancel: () => "Déplacement annulé.",
          },
        }}
      >
        <div
          className="kb-scroll"
          tabIndex={0}
          role="region"
          aria-label="Tableau des projets, défilement horizontal"
        >
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="kb-columns">
              {columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  disabled={filtered}
                  onOpen={(card) =>
                    setEditor({ kind: "card", card, columnId: column.id })
                  }
                  onEdit={() => setEditor({ kind: "column", column })}
                  onDelete={() => setEditor({ kind: "delete-column", column })}
                  onMove={(direction) => moveColumn(column.id, direction)}
                >
                  <button
                    type="button"
                    className="kb-add-card"
                    onClick={() =>
                      setEditor({ kind: "card", columnId: column.id })
                    }
                  >
                    + Ajouter une carte
                  </button>
                </Column>
              ))}
              <button
                type="button"
                className="kb-add-column"
                disabled={board.columns.length >= 30}
                onClick={() => setEditor({ kind: "column" })}
              >
                + Ajouter une colonne
              </button>
            </div>
          </SortableContext>
        </div>
        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <div
              className="kb-card kb-card-overlay"
              style={{ "--card-accent": activeCard.accent } as CSSProperties}
            >
              <div className="kb-card-open">
                <CardFace card={activeCard} />
              </div>
            </div>
          ) : activeColumn ? (
            <div className="kb-column kb-column-overlay">
              <h2>{activeColumn.title}</h2>
              <span>{activeColumn.cards.length} cartes</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <p className="workspace-feedback" role="status">
        {message}
      </p>
      {editor && (
        <BoardEditor
          key={
            editor.kind === "card"
              ? (editor.card?.id ?? "new-card")
              : editor.kind
          }
          editor={editor}
          board={board}
          close={() => setEditor(null)}
          commit={commit}
        />
      )}
    </div>
  );
}
function BoardEditor({
  editor,
  board,
  close,
  commit,
}: {
  editor: Editor;
  board: ProjectBoard;
  close: () => void;
  commit: (board: ProjectBoard, text: string) => void;
}) {
  const existing = editor.kind === "card" ? editor.card : undefined;
  const [title, setTitle] = useState(
    existing?.title ??
      (editor.kind === "column" ? (editor.column?.title ?? "") : ""),
  );
  const [description, setDescription] = useState(existing?.description ?? "");
  const [tags, setTags] = useState(existing?.tags.join(", ") ?? "");
  const [columnId, setColumnId] = useState(
    editor.kind === "card" ? editor.columnId : "",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const heading =
    editor.kind === "card"
      ? (existing?.title ?? "Nouvelle carte")
      : editor.kind === "column"
        ? editor.column
          ? "Renommer la colonne"
          : "Nouvelle colonne"
        : editor.kind === "reset"
          ? "Réinitialiser le tableau ?"
          : "Supprimer la colonne ?";
  function save() {
    if (editor.kind === "column") {
      const columns = editor.column
        ? board.columns.map((c) =>
            c.id === editor.column!.id ? { ...c, title: title.trim() } : c,
          )
        : [
            ...board.columns,
            {
              id: `column-${crypto.randomUUID()}`,
              title: title.trim(),
              cards: [],
            },
          ];
      commit({ columns }, "Colonne enregistrée.");
    } else if (editor.kind === "card") {
      const card: BoardCard = {
        id: existing?.id ?? `card-${crypto.randomUUID()}`,
        projectId: existing?.projectId,
        title: title.trim(),
        description: description.trim(),
        tags: [
          ...new Set(
            tags
              .split(",")
              .map((s) => s.trim().slice(0, 80))
              .filter(Boolean),
          ),
        ].slice(0, 30),
        accent: existing?.accent ?? "#3342d6",
      };
      let next = {
        columns: board.columns.map((c) => ({
          ...c,
          cards: c.cards.map((p) => (p.id === card.id ? card : p)),
        })),
      };
      if (!existing)
        next = {
          columns: next.columns.map((c) =>
            c.id === columnId ? { ...c, cards: [...c.cards, card] } : c,
          ),
        };
      else if (columnId !== editor.columnId)
        next = moveBoardCard(next, card.id, columnId, Number.MAX_SAFE_INTEGER);
      commit(next, "Carte enregistrée.");
    }
    close();
  }
  return (
    <WorkspaceDialog title={heading} onClose={close} className="kb-dialog">
      {editor.kind === "reset" ? (
        <>
          <p>
            Retrouver les projets et leurs statuts d’origine ? Vos modifications
            du tableau seront remplacées.
          </p>
          <div className="dialog-actions">
            <button type="button" onClick={close}>
              Annuler
            </button>
            <button
              className="kb-primary"
              type="button"
              onClick={() => {
                commit(projectBoardStore.initial, "Tableau réinitialisé.");
                close();
              }}
            >
              Réinitialiser le tableau
            </button>
          </div>
        </>
      ) : editor.kind === "delete-column" ? (
        <>
          <p>
            La colonne « {editor.column.title} » et ses{" "}
            {editor.column.cards.length} carte(s) seront retirées de votre
            tableau.
          </p>
          {board.columns.length === 1 ? (
            <p>Conservez au moins une colonne.</p>
          ) : (
            <div className="dialog-actions">
              <button type="button" onClick={close}>
                Annuler
              </button>
              <button
                type="button"
                className="danger-text"
                onClick={() => {
                  commit(
                    {
                      columns: board.columns.filter(
                        (c) => c.id !== editor.column.id,
                      ),
                    },
                    "Colonne supprimée. Vous pouvez annuler.",
                  );
                  close();
                }}
              >
                Supprimer la colonne
              </button>
            </div>
          )}
        </>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          className="workspace-form"
        >
          <label>
            Titre
            <input
              required
              maxLength={editor.kind === "column" ? 80 : 120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          {editor.kind === "card" && (
            <>
              <label>
                Description
                <textarea
                  rows={5}
                  maxLength={5000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <label>
                Technologies
                <input
                  maxLength={1000}
                  value={tags}
                  placeholder="TypeScript, React…"
                  onChange={(e) => setTags(e.target.value)}
                />
              </label>
              <label>
                Colonne
                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
                >
                  {board.columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              {existing && (
                <div className="kb-position">
                  <span>Position dans la colonne</span>
                  {[-1, 1].map((direction) => (
                    <button
                      key={direction}
                      type="button"
                      onClick={() => {
                        const c = board.columns.find((c) =>
                          c.cards.some((p) => p.id === existing.id),
                        );
                        if (c)
                          commit(
                            moveBoardCard(
                              board,
                              existing.id,
                              c.id,
                              c.cards.findIndex((p) => p.id === existing.id) +
                                direction,
                            ),
                            "Carte déplacée.",
                          );
                      }}
                    >
                      {direction < 0 ? "Monter" : "Descendre"}
                    </button>
                  ))}
                </div>
              )}
              {existing?.projectId && (
                <Link
                  className="kb-project-link"
                  href={`/projets/${existing.projectId}`}
                >
                  Ouvrir la fiche du projet <Icon name="arrow" />
                </Link>
              )}
            </>
          )}
          <div className="dialog-actions">
            {existing && (
              <button
                type="button"
                className="danger-text"
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    return;
                  }
                  commit(
                    {
                      columns: board.columns.map((c) => ({
                        ...c,
                        cards: c.cards.filter((p) => p.id !== existing.id),
                      })),
                    },
                    "Carte supprimée. Vous pouvez annuler.",
                  );
                  close();
                }}
              >
                {confirmDelete ? "Confirmer la suppression" : "Supprimer"}
              </button>
            )}
            <button type="button" onClick={close}>
              Annuler
            </button>
            <button
              type="submit"
              className="kb-primary"
              disabled={!title.trim()}
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}
    </WorkspaceDialog>
  );
}
