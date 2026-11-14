"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

const tools = [
  {
    id: "claude",
    name: "Claude Code",
    href: "https://claude.com/product/claude-code",
  },
  {
    id: "codex",
    name: "Codex",
    href: "https://openai.com/codex/",
  },
  { id: "t3", name: "T3 Code", href: "https://t3.codes" },
  {
    id: "hermes",
    name: "Hermes Agent",
    href: "https://hermes-agent.nousresearch.com",
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    href: "https://openclaw.ai",
  },
  { id: "n8n", name: "n8n", href: "https://n8n.io" },
];

type Position = { x: number; y: number; size: number; moved: boolean };
type Drag = {
  pointerId: number;
  startX: number;
  startY: number;
  origin: Position;
  active: boolean;
  samples: { x: number; y: number; time: number }[];
};

// Reserve space for the rotated corners and the full levitation amplitude.
function constrain(position: Position): Position {
  const margin = 28;
  const width = document.documentElement.clientWidth;
  const height = Math.max(
    document.documentElement.scrollHeight,
    window.innerHeight,
  );
  return {
    ...position,
    x: Math.max(margin, Math.min(position.x, width - position.size - margin)),
    y: Math.max(margin, Math.min(position.y, height - position.size - margin)),
  };
}

function FloatingTool({ tool }: { tool: (typeof tools)[number] }) {
  const marker = useRef<HTMLSpanElement>(null);
  const link = useRef<HTMLAnchorElement>(null);
  const drag = useRef<Drag | null>(null);
  const inertiaFrame = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const current = useRef<Position | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [held, setHeld] = useState(false);

  function place(next: Position) {
    current.current = next;
    setPosition(next);
  }

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

  useLayoutEffect(() => {
    function measure() {
      const rect = marker.current?.getBoundingClientRect();
      if (!rect) return;
      // A resize cancels a gesture before remeasuring the responsive composition.
      cancel();
      const previous = current.current;
      const next = previous?.moved
        ? constrain({ ...previous, size: rect.width })
        : constrain({
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            size: rect.width,
            moved: false,
          });
      current.current = next;
      setPosition(next);
    }
    function cancel() {
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
    }
    function escape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") cancel();
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (marker.current?.parentElement)
      observer.observe(marker.current.parentElement);
    // Expanding the mobile sidebar moves the hero without resizing its markers.
    const sidebar = document.querySelector(".atelier-sidebar");
    if (sidebar) observer.observe(sidebar);
    window.addEventListener("resize", measure);
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", escape);
    return () => {
      if (inertiaFrame.current !== null)
        cancelAnimationFrame(inertiaFrame.current);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", escape);
    };
  }, []);

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
    drag.current = {
      pointerId: event.pointerId,
      startX: event.pageX,
      startY: event.pageY,
      origin: current.current,
      active: false,
      samples: [{ x: event.pageX, y: event.pageY, time: performance.now() }],
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(true);
  }
  function move(event: PointerEvent<HTMLAnchorElement>) {
    const session = drag.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const time = performance.now();
    session.samples.push({ x: event.pageX, y: event.pageY, time });
    session.samples = session.samples.filter(
      (sample) => time - sample.time <= 100,
    );
    const dx = event.pageX - session.startX,
      dy = event.pageY - session.startY;
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

  return (
    <>
      <span
        ref={marker}
        className={`floating-tool-marker floating-tool-${tool.id}`}
        aria-hidden="true"
      />
      {position &&
        createPortal(
          <a
            ref={link}
            className={`floating-tool floating-tool-${tool.id}${held ? " is-held" : ""}`}
            href={tool.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${tool.name} (nouvel onglet)`}
            aria-describedby="floating-tools-help"
            style={
              {
                left: position.x,
                top: position.y,
                width: position.size,
              } as CSSProperties
            }
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={(e) => {
              if (drag.current?.pointerId === e.pointerId) finish(false, true);
            }}
            onPointerCancel={() => finish(true)}
            onLostPointerCapture={() => finish()}
            onDragStart={(e) => e.preventDefault()}
            onKeyDown={key}
            onClick={(e) => {
              if (suppressClick.current && e.detail !== 0) {
                e.preventDefault();
                suppressClick.current = false;
              }
            }}
          >
            <span className="floating-tool-bob">
              <span className="floating-tool-tile">
                {/* Paired exports use the same vector geometry in both themes. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="floating-logo-white"
                  src={`/logos/${tool.id}-white.svg`}
                  alt=""
                  draggable={false}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="floating-logo-black"
                  src={`/logos/${tool.id}-black.svg`}
                  alt=""
                  draggable={false}
                />
              </span>
            </span>
          </a>,
          document.body,
        )}
    </>
  );
}

export default function FloatingTools() {
  return (
    <div
      className="floating-tools"
      role="group"
      aria-label="Mes outils IA et automatisation"
    >
      <span id="floating-tools-help" className="sr-only">
        Déplacez les logos avec la souris ou les flèches du clavier. Échap
        annule le déplacement en cours. Un clic ouvre le site dans un nouvel
        onglet.
      </span>
      {tools.map((tool) => (
        <FloatingTool key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
