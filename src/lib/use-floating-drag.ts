"use client";

import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

export type FloatPosition = {
  x: number;
  y: number;
  size: number;
  moved: boolean;
};
type Drag = {
  pointerId: number;
  startX: number;
  startY: number;
  origin: FloatPosition;
  active: boolean;
  samples: { x: number; y: number; time: number }[];
};

/**
 * Drag, inertia, keyboard moves and click suppression shared by the floating
 * tiles. `coords` picks page coordinates (tiles in the document) or client
 * coordinates (tiles fixed to the viewport); `constrain` keeps them in bounds
 * and must be stable (a module-level function).
 */
export function useFloatingDrag(
  constrain: (position: FloatPosition) => FloatPosition,
  coords: "page" | "client" = "page",
) {
  const link = useRef<HTMLAnchorElement>(null);
  const drag = useRef<Drag | null>(null);
  const inertiaFrame = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const current = useRef<FloatPosition | null>(null);
  const [position, setPosition] = useState<FloatPosition | null>(null);
  const [held, setHeld] = useState(false);

  const point = (event: PointerEvent) =>
    coords === "page"
      ? { x: event.pageX, y: event.pageY }
      : { x: event.clientX, y: event.clientY };

  const place = useCallback((next: FloatPosition) => {
    current.current = next;
    setPosition(next);
  }, []);
  const read = useCallback(() => current.current, []);

  function stopInertia() {
    if (inertiaFrame.current !== null)
      cancelAnimationFrame(inertiaFrame.current);
    inertiaFrame.current = null;
  }

  function coast(session: Drag) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const samples = session.samples;
    const first = samples[0],
      last = samples.at(-1);
    const now = performance.now();
    // A stationary hold before release must not launch an old gesture.
    if (!first || !last || now - last.time > 80 || last.time - first.time < 8)
      return;
    const elapsed = last.time - first.time;
    let vx = (last.x - first.x) / elapsed;
    let vy = (last.y - first.y) / elapsed;
    const speed = Math.hypot(vx, vy);
    const scale = Math.min(1, 1.8 / Math.max(speed, 0.001));
    vx *= scale;
    vy *= scale;
    let previousTime = now;
    function frame(time: number) {
      const position = current.current;
      if (!position) return;
      const dt = time - previousTime;
      previousTime = time;
      // Avoid a large leap if rendering was suspended.
      if (dt > 100) {
        inertiaFrame.current = null;
        return;
      }
      const decay = Math.exp(-dt / 200);
      const requested = {
        ...position,
        x: position.x + vx * 200 * (1 - decay),
        y: position.y + vy * 200 * (1 - decay),
      };
      const next = constrain(requested);
      vx = next.x === requested.x ? vx * decay : 0;
      vy = next.y === requested.y ? vy * decay : 0;
      place(next);
      if (Math.hypot(vx, vy) > 0.02)
        inertiaFrame.current = requestAnimationFrame(frame);
      else inertiaFrame.current = null;
    }
    if (Math.hypot(vx, vy) > 0.02)
      inertiaFrame.current = requestAnimationFrame(frame);
  }

  function finish(cancel = false, withInertia = false) {
    const session = drag.current;
    if (!session) return;
    drag.current = null;
    if (cancel) place(constrain(session.origin));
    suppressClick.current = session.active;
    setHeld(false);
    if (!cancel && withInertia && session.active) coast(session);
    if (link.current?.hasPointerCapture(session.pointerId))
      link.current.releasePointerCapture(session.pointerId);
  }

  /** Stops inertia and returns an ongoing gesture to its origin. */
  const cancel = useCallback(() => {
    if (inertiaFrame.current !== null)
      cancelAnimationFrame(inertiaFrame.current);
    inertiaFrame.current = null;
    const session = drag.current;
    if (!session) return;
    current.current = constrain(session.origin);
    setPosition(current.current);
    drag.current = null;
    suppressClick.current = session.active;
    setHeld(false);
    if (link.current?.hasPointerCapture(session.pointerId))
      link.current.releasePointerCapture(session.pointerId);
  }, [constrain]);

  function down(event: PointerEvent<HTMLAnchorElement>) {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      !current.current ||
      drag.current
    )
      return;
    stopInertia();
    suppressClick.current = false;
    const { x, y } = point(event);
    drag.current = {
      pointerId: event.pointerId,
      startX: x,
      startY: y,
      origin: current.current,
      active: false,
      samples: [{ x, y, time: performance.now() }],
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(true);
  }
  function move(event: PointerEvent<HTMLAnchorElement>) {
    const session = drag.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const time = performance.now();
    const { x, y } = point(event);
    session.samples.push({ x, y, time });
    session.samples = session.samples.filter(
      (sample) => time - sample.time <= 100,
    );
    const dx = x - session.startX,
      dy = y - session.startY;
    if (!session.active && Math.hypot(dx, dy) < 5) return;
    session.active = true;
    place(
      constrain({
        ...session.origin,
        x: session.origin.x + dx,
        y: session.origin.y + dy,
        moved: true,
      }),
    );
  }
  function key(event: KeyboardEvent<HTMLAnchorElement>) {
    const step = event.shiftKey ? 30 : 10;
    const delta = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }[event.key];
    if (!delta || !current.current) return;
    event.preventDefault();
    stopInertia();
    place(
      constrain({
        ...current.current,
        x: current.current.x + delta[0],
        y: current.current.y + delta[1],
        moved: true,
      }),
    );
  }

  const handlers = {
    onPointerDown: down,
    onPointerMove: move,
    onPointerUp: (event: PointerEvent<HTMLAnchorElement>) => {
      if (drag.current?.pointerId === event.pointerId) finish(false, true);
    },
    onPointerCancel: () => finish(true),
    onLostPointerCapture: () => finish(),
    onDragStart: (event: MouseEvent<HTMLAnchorElement>) =>
      event.preventDefault(),
    onKeyDown: key,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (suppressClick.current && event.detail !== 0) {
        event.preventDefault();
        suppressClick.current = false;
      }
    },
  };

  return { link, position, held, place, read, cancel, handlers };
}
