"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { subscribeSidebar } from "@/lib/sidebar";
import { useFloatingDrag, type FloatPosition } from "@/lib/use-floating-drag";

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

// Reserve space for the rotated corners and the full levitation amplitude.
function constrain(position: FloatPosition): FloatPosition {
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
  const { link, position, held, place, read, cancel, handlers } =
    useFloatingDrag(constrain);

  useLayoutEffect(() => {
    function measure() {
      const rect = marker.current?.getBoundingClientRect();
      if (!rect) return;
      // A resize cancels a gesture before remeasuring the responsive composition.
      cancel();
      const previous = read();
      const next = previous?.moved
        ? constrain({ ...previous, size: rect.width })
        : constrain({
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            size: rect.width,
            moved: false,
          });
      place(next);
    }
    function escape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") cancel();
    }
    // Folding the sidebar reflows the hero but must not drag the logos: they
    // stay exactly where the visitor sees them, detached from their marker.
    function detach() {
      if (!matchMedia("(min-width: 761px)").matches) return;
      const current = read();
      if (current) place({ ...current, moved: true });
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (marker.current?.parentElement)
      observer.observe(marker.current.parentElement);
    // Expanding the mobile sidebar moves the hero without resizing its markers.
    const sidebar = document.querySelector(".atelier-sidebar");
    if (sidebar) observer.observe(sidebar);
    const unwatchSidebar = subscribeSidebar(detach);
    window.addEventListener("resize", measure);
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", escape);
    return () => {
      cancel();
      unwatchSidebar();
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", escape);
    };
  }, [cancel, place, read]);

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
            {...handlers}
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
