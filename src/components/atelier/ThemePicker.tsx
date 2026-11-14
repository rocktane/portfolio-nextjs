"use client";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
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
  const control = useRef<HTMLDivElement>(null);
  const transition = useRef<ViewTransition | null>(null);
  const generation = useRef(0);
  const pathname = usePathname();
  useEffect(() => {
    applyTheme(readThemePreference());
  }, [pathname]);
  function choose(next: ThemePreference, origin: HTMLElement) {
    const version = ++generation.current;
    const root = document.documentElement;
    const rect = origin.getBoundingClientRect();
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
  const selected = options.findIndex((option) => option.value === preference);
  return (
    <div
      ref={control}
      className="theme-toggle"
      role="radiogroup"
      aria-label="Thème"
      style={{ "--theme-position": selected } as CSSProperties}
      onKeyDown={(event) => {
        const keys = [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const focused = Number(
          (event.target as HTMLElement).closest("button")?.dataset.index ??
            selected,
        );
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? 2
              : (focused +
                  (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) +
                  3) %
                3;
        const button = control.current?.querySelector<HTMLButtonElement>(
          `[data-index="${next}"]`,
        );
        if (button) {
          button.focus();
          choose(options[next].value, button);
        }
      }}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          data-index={index}
          type="button"
          role="radio"
          aria-label={option.label}
          aria-checked={preference === option.value}
          tabIndex={preference === option.value ? 0 : -1}
          title={option.label}
          onClick={(event) => choose(option.value, event.currentTarget)}
        >
          <Icon name={option.icon} />
        </button>
      ))}
    </div>
  );
}
