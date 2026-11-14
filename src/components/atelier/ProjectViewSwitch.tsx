"use client";
import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";

type View = "kanban" | "grille" | "liste";
const labels: Record<View, string> = {
  kanban: "Kanban",
  grille: "Grille",
  liste: "Liste",
};

export default function ProjectViewSwitch({
  view,
  kanban,
  onChange,
}: {
  view: View;
  kanban: boolean;
  onChange: (view: View) => void;
}) {
  const group = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tooltip, setTooltip] = useState<{ mode: View; center: number } | null>(
    null,
  );
  const tooltipId = useId();
  const modes: View[] = kanban
    ? ["kanban", "grille", "liste"]
    : ["grille", "liste"];

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function hideTooltip() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setTooltip(null);
  }
  function showTooltip(
    mode: View,
    button: HTMLButtonElement,
    immediate = false,
  ) {
    if (timer.current) clearTimeout(timer.current);
    const next = { mode, center: button.offsetLeft + button.offsetWidth / 2 };
    if (tooltip || immediate) setTooltip(next);
    else
      timer.current = setTimeout(() => {
        setTooltip(next);
        timer.current = null;
      }, 70);
  }
  return (
    <div
      ref={group}
      className="view-switch"
      role="group"
      aria-label="Présentation des projets"
      onPointerLeave={hideTooltip}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) hideTooltip();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") hideTooltip();
      }}
    >
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          aria-label={`Vue ${mode}`}
          aria-pressed={view === mode}
          aria-describedby={tooltip?.mode === mode ? tooltipId : undefined}
          onPointerEnter={(event) => {
            if (event.pointerType !== "touch")
              showTooltip(mode, event.currentTarget);
          }}
          onFocus={(event) => showTooltip(mode, event.currentTarget, true)}
          onClick={() => onChange(mode)}
        >
          <Icon
            name={
              mode === "kanban" ? "kanban" : mode === "grille" ? "grid" : "list"
            }
          />
        </button>
      ))}
      {tooltip && (
        <span
          id={tooltipId}
          role="tooltip"
          className="view-switch-tooltip"
          style={{
            left: `clamp(34px, ${tooltip.center}px, calc(100% - 34px))`,
          }}
        >
          {labels[tooltip.mode]}
        </span>
      )}
    </div>
  );
}
