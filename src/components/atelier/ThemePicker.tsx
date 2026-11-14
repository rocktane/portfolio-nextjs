"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import {
  applyTheme,
  readThemePreference,
  saveThemePreference,
  subscribeTheme,
  type ThemePreference,
} from "@/lib/theme";
import Icon, { type IconName } from "./Icon";
const options: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: "light", label: "Clair", icon: "sun" },
  { value: "system", label: "Système", icon: "monitor" },
  { value: "dark", label: "Sombre", icon: "moon" },
];
const serverPreference = (): ThemePreference => "system";
export default function ThemePicker() {
  const preference = useSyncExternalStore(
    subscribeTheme,
    readThemePreference,
    serverPreference,
  );
  const menu = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const transition = useRef<ViewTransition | null>(null);
  const generation = useRef(0);
  const pathname = usePathname();
  useEffect(() => {
    if (menu.current) menu.current.open = false;
    applyTheme(readThemePreference());
  }, [pathname]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node))
        menu.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  function choose(next: ThemePreference) {
    if (menu.current) menu.current.open = false;
    trigger.current?.focus();
    const version = ++generation.current;
    const root = document.documentElement;
    const rect = trigger.current?.getBoundingClientRect();
    const apply = () => {
      if (version === generation.current)
        flushSync(() => saveThemePreference(next));
    };
    transition.current?.skipTransition();
    // Same radial View Transition as Exo; no animation for reduced-motion users.
    if (
      !document.startViewTransition ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !rect
    ) {
      apply();
      return;
    }
    const x = rect.left + rect.width / 2,
      y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );
    const previous = root.dataset.theme;
    const resolved =
      next === "dark" ||
      (next === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";
    if (previous === resolved) {
      apply();
      return;
    }
    const view = document.startViewTransition(apply);
    transition.current = view;
    void view.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 450,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        applyTheme(readThemePreference());
      });
    void view.finished
      .catch(() => {})
      .finally(() => {
        if (transition.current === view) transition.current = null;
      });
  }
  const current = options.find((option) => option.value === preference)!;
  return (
    <details
      className="theme-picker"
      ref={menu}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          if (menu.current) menu.current.open = false;
          trigger.current?.focus();
        }
      }}
    >
      <summary
        ref={trigger}
        role="button"
        aria-label="Choisir le thème"
        title={`Thème : ${current.label}`}
      >
        <Icon name={current.icon} />
      </summary>
      <div className="theme-menu" role="group" aria-label="Thème">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={preference === option.value}
            onClick={() => choose(option.value)}
          >
            <Icon name={option.icon} />
            <span>{option.label}</span>
            <span className="theme-check" aria-hidden="true">
              {preference === option.value ? "✓" : ""}
            </span>
          </button>
        ))}
      </div>
    </details>
  );
}
