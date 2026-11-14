"use client";
import { useEffect, useSyncExternalStore } from "react";
import {
  applySidebar,
  readSidebarCollapsed,
  saveSidebarCollapsed,
  subscribeSidebar,
} from "@/lib/sidebar";
import Icon from "./Icon";

const DESKTOP = "(min-width: 761px)";
const serverFalse = () => false;
function subscribeDesktop(listener: () => void) {
  const query = matchMedia(DESKTOP);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);
const subscribeNothing = () => () => {};
const FOLD_MS = 420;
let settleTimer: ReturnType<typeof setTimeout> | undefined;

export function useSidebar() {
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    readSidebarCollapsed,
    serverFalse,
  );
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    () => matchMedia(DESKTOP).matches,
    serverFalse,
  );
  // The sidebar only folds on desktop; on mobile it stays the navigation band.
  return { collapsed, hidden: collapsed && desktop, desktop };
}

export function toggleSidebar() {
  const next = !readSidebarCollapsed();
  const panel = document.getElementById("sidebar-panel");
  // Keep keyboard focus visible when the element holding it is folded away.
  if (next && panel?.contains(document.activeElement))
    document.getElementById("sidebar-toggle")?.focus();
  const moving = [
    document.getElementById("sidebar-toggle"),
    document.querySelector<HTMLElement>(".sidebar-brand-row .atelier-brand"),
  ].filter((el): el is HTMLElement => !!el);
  const before = moving.map((el) => el.getBoundingClientRect().left);
  saveSidebarCollapsed(next);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // Scroll areas resize on every frame of the fold; keep their scrollbars quiet.
  const root = document.documentElement;
  root.dataset.sidebarAnimating = "";
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    delete root.dataset.sidebarAnimating;
  }, FOLD_MS + 80);
  // The button swaps sides with the title: glide both from where they were.
  moving.forEach((el, i) => {
    const shift = before[i] - el.getBoundingClientRect().left;
    if (!shift) return;
    el.animate(
      [{ transform: `translateX(${shift}px)` }, { transform: "none" }],
      { duration: FOLD_MS, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
    );
  });
}

export default function SidebarToggle() {
  const { collapsed, desktop } = useSidebar();
  const mac = useSyncExternalStore(subscribeNothing, isMac, () => true);
  const shortcut = mac ? "⌘B" : "Ctrl+B";

  useEffect(() => {
    applySidebar(readSidebarCollapsed());
    const onKey = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.altKey ||
        event.shiftKey ||
        event.key.toLowerCase() !== "b" ||
        !matchMedia(DESKTOP).matches ||
        document.querySelector("dialog[open]")
      )
        return;
      const target = event.target as HTMLElement | null;
      // Rich-text editors keep ⌘B for bold.
      if (target?.isContentEditable) return;
      event.preventDefault();
      toggleSidebar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const label = collapsed
    ? "Afficher la barre latérale"
    : "Masquer la barre latérale";
  return (
    <button
      id="sidebar-toggle"
      type="button"
      className="sidebar-toggle"
      aria-label={label}
      aria-expanded={!(collapsed && desktop)}
      aria-controls="sidebar-panel"
      aria-keyshortcuts="Meta+B Control+B"
      title={`${label} (${shortcut})`}
      onClick={toggleSidebar}
    >
      <Icon name="sidebar" />
    </button>
  );
}
