"use client";
import { useEffect, useRef, type ReactNode } from "react";

export default function WorkspaceDialog({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const rootOverflow = root.style.overflow;
    const bodyStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    root.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    dialog.showModal();
    return () => {
      dialog.close();
      root.style.overflow = rootOverflow;
      Object.assign(body.style, bodyStyles);
      window.scrollTo({ top: scrollY, behavior: "instant" });
      opener?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`workspace-dialog ${className}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        close.current();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            close.current();
        }
      }}
    >
      <header className="dialog-heading">
        <h2>{title}</h2>
        <button type="button" onClick={onClose} aria-label="Fermer">
          ×
        </button>
      </header>
      {children}
    </dialog>
  );
}
