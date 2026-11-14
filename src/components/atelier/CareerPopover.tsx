"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";

/** A nonmodal property menu anchored to either the toolbar or a view chip. */
export default function CareerPopover({
  id,
  anchor,
  title,
  children,
  onClose,
}: {
  id: string;
  anchor: HTMLElement | null;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useLayoutEffect(() => {
    close.current = onClose;
  });
  useLayoutEffect(() => {
    const menu = ref.current!;
    function position() {
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const below = innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      const flip = below < 220 && above > below;
      menu.style.maxHeight = `${Math.max(120, flip ? above : below)}px`;
      menu.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - menu.offsetWidth - 8))}px`;
      menu.style.top = `${flip ? Math.max(8, rect.top - menu.offsetHeight - 8) : rect.bottom + 8}px`;
    }
    position();
    (
      menu.querySelector<HTMLElement>('input[type="search"]') ??
      menu.querySelector<HTMLElement>("input, select, button")
    )?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menu.contains(event.target) &&
        !anchor?.contains(event.target)
      )
        close.current();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close.current();
        anchor?.focus({ preventScroll: true });
      }
    };
    const scroll = (event: Event) => {
      if (event.target instanceof Node && menu.contains(event.target)) return;
      position();
    };
    document.addEventListener("pointerdown", outside);
    menu.addEventListener("keydown", key);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", scroll, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      menu.removeEventListener("keydown", key);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [anchor]);
  return (
    <div
      id={id}
      ref={ref}
      className="notion-control-panel"
      role="dialog"
      aria-label={title}
    >
      {children}
    </div>
  );
}
