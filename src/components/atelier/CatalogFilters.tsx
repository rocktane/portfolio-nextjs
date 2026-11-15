"use client";
import { useLayoutEffect, useRef, useState } from "react";

type FilterOption = { value: string; label: string; count: number };
type Indicator = { x: number; y: number; width: number; height: number };

export default function CatalogFilters({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const group = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  // The first placement must not slide in from the corner.
  const [animated, setAnimated] = useState(false);

  useLayoutEffect(() => {
    const container = group.current;
    if (!container) return;
    const measure = () => {
      const active = container.querySelector<HTMLElement>(
        '[aria-pressed="true"]',
      );
      if (!active) return setIndicator(null);
      // Bounding rects keep subpixel precision, unlike offsetLeft/offsetWidth.
      const box = container.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      setIndicator({
        x: rect.left - box.left,
        y: rect.top - box.top,
        width: rect.width,
        height: rect.height,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    // Buttons can resize without the container (e.g. a late web font swap).
    observer.observe(container);
    for (const button of container.querySelectorAll("button"))
      observer.observe(button);
    return () => observer.disconnect();
  }, [value, options.length]);

  useLayoutEffect(() => {
    if (!indicator || animated) return;
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, [indicator, animated]);

  return (
    <div
      ref={group}
      className="catalog-filters"
      role="group"
      aria-label={label}
      data-indicator={indicator ? "" : undefined}
    >
      {indicator && (
        <span
          aria-hidden="true"
          className="catalog-filter-indicator"
          data-animated={animated ? "" : undefined}
          style={{
            width: indicator.width,
            height: indicator.height,
            transform: `translate(${indicator.x}px, ${indicator.y}px)`,
          }}
        />
      )}
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          <span className="catalog-filter-label" data-text={option.label}>
            {option.label}
          </span>
          <span className="catalog-filter-count" data-text={option.count}>
            {option.count}
          </span>
        </button>
      ))}
    </div>
  );
}
