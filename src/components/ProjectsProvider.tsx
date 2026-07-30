"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { projects } from "@/data/projects";
import { lockScroll } from "@/components/SmoothScroll";
import {
  getHash,
  getServerHash,
  setHash,
  subscribeToHash,
} from "@/lib/hash";
import type { Project } from "@/types";

interface ProjectsContextValue {
  active: Project | null;
  open: (id: string) => void;
  close: () => void;
  next: () => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects doit être utilisé dans ProjectsProvider");
  return ctx;
}

/**
 * La fiche projet s'ouvre en surcouche plutôt que sur une page dédiée, mais
 * elle reste partageable : l'ancre `#id` de l'URL est le seul état: on la lit
 * au chargement comme on la lit après un clic, sans la dupliquer dans React.
 */
export default function ProjectsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash);

  const active = useMemo(
    () => projects.find((p) => p.id === hash) ?? null,
    [hash],
  );

  const open = useCallback((id: string) => setHash(id), []);
  const close = useCallback(() => setHash(null), []);

  const next = useCallback(() => {
    if (!active) return;
    const index = projects.findIndex((p) => p.id === active.id);
    setHash(projects[(index + 1) % projects.length].id);
  }, [active]);

  // Le scroll de la page est gelé tant que la fiche est ouverte.
  useEffect(() => {
    lockScroll(active !== null);
    return () => lockScroll(false);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

  const value = useMemo<ProjectsContextValue>(
    () => ({ active, open, close, next }),
    [active, open, close, next],
  );

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  );
}
