"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { CatalogApp } from "@/types";

type Props = {
  app: CatalogApp;
  apps: CatalogApp[];
  copied: string | null;
  onCopy: (app: CatalogApp, command: string) => void;
  onSelect: (id: string) => void;
  onClose: () => void;
  message: string;
};
/** L'icône de l'app, ou son initiale sur sa couleur. */
export function AppIcon({
  app,
  size,
  className,
}: {
  app: CatalogApp;
  size: number;
  className: string;
}) {
  return app.icon ? (
    <Image
      className={className}
      src={app.icon}
      alt=""
      width={size}
      height={size}
    />
  ) : (
    <span
      className={`${className} favorite-monogram`}
      style={{ "--app-accent": app.accent } as CSSProperties}
      aria-hidden="true"
    >
      {app.name.charAt(0)}
    </span>
  );
}

export default function AppModal({
  app,
  apps,
  copied,
  onCopy,
  onSelect,
  onClose,
  message,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    const gutter = root.style.scrollbarGutter;
    const scroll = { x: window.scrollX, y: window.scrollY };
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      root.style.overflow = overflow;
      root.style.scrollbarGutter = gutter;
      window.scrollTo({ left: scroll.x, top: scroll.y, behavior: "instant" });
      opener?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    const dialog = ref.current!;
    let initialized = false;
    let animation: Animation | undefined;
    const resize = () => {
      const style = getComputedStyle(dialog);
      const target = Math.min(
        content.current!.offsetHeight +
          parseFloat(style.borderTopWidth) +
          parseFloat(style.borderBottomWidth),
        parseFloat(style.maxHeight),
      );
      const previous = parseFloat(style.height);
      if (initialized && Math.abs(target - previous) < 0.5) return;
      animation?.cancel();
      dialog.style.height = `${target}px`;
      if (
        initialized &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        animation = dialog.animate(
          { height: [`${previous}px`, `${target}px`] },
          { duration: 220, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
      }
      initialized = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(content.current!);
    addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      removeEventListener("resize", resize);
      animation?.cancel();
    };
  }, []);
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(
      () => close.current(),
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180,
    );
    return () => clearTimeout(timer);
  }, [closing]);
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [app.id]);
  const requestClose = () => setClosing(true);
  const site =
    app.site ?? (app.url?.includes("github.com") ? undefined : app.url);
  const github =
    app.github ?? (app.url?.includes("github.com") ? app.url : undefined);
  const hostId = app.module ?? app.id;
  const host = apps.find((a) => a.id === hostId);
  const modules = apps.filter((a) => a.module === hostId);
  const family = host && modules.length ? modules : [];
  const headingApp = app.module && host ? host : app;
  return (
    <dialog
      ref={ref}
      className="app-modal"
      aria-label={`Détails de ${app.name}`}
      data-closing={closing || undefined}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          requestClose();
      }}
    >
      <div className="app-detail-inner" ref={content}>
        <button
          type="button"
          className="app-detail-close"
          onClick={requestClose}
          aria-label="Fermer les détails"
        >
          ×
        </button>

        <div className="app-detail-content">
          <header className="app-detail-hero">
            <AppIcon
              app={headingApp}
              size={84}
              className="app-detail-hero-icon"
            />
            <div className="app-detail-hero-text">
              <h2>{headingApp.name}</h2>
              <p>{headingApp.description}</p>
            </div>
          </header>
          {family.length > 0 && (
            <nav className="app-detail-family" aria-label={host!.name}>
              {family.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-current={item.id === app.id ? "page" : undefined}
                  onClick={() =>
                    onSelect(item.id === app.id ? host!.id : item.id)
                  }
                >
                  <AppIcon
                    app={item}
                    size={20}
                    className="app-detail-family-icon"
                  />
                  {item.name}
                </button>
              ))}
            </nav>
          )}
          <div className="app-detail-actions">
            {app.command && (
              <button
                type="button"
                className="app-detail-button app-detail-button-primary"
                onClick={() => onCopy(app, app.command!)}
              >
                {copied === app.id ? "Commande copiée" : "Copier la commande"}
              </button>
            )}
            {site && (
              <a
                className={`app-detail-button ${app.command ? "" : "app-detail-button-primary"}`}
                href={site}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir le site
              </a>
            )}
            {app.download && (
              <a className="app-detail-button" href={app.download}>
                Télécharger
              </a>
            )}
            {github && (
              <a
                className={`app-detail-button ${app.command || site || app.download ? "" : "app-detail-button-primary"}`}
                href={github}
                target="_blank"
                rel="noopener noreferrer"
              >
                {app.module ? "Documentation" : "GitHub"}
              </a>
            )}
            {!app.command && !site && !github && !app.download && (
              <span className="app-detail-button" aria-disabled="true">
                Bientôt disponible
              </span>
            )}
          </div>

          <p className="app-detail-feedback" role="status">
            {message}
          </p>
          <div className="app-detail-body">
            <div className="app-detail-description">
              {app.module && (
                <h3 className="app-detail-module-title">{app.name}</h3>
              )}
              <p className="app-detail-summary">
                {app.summary ?? app.description}
              </p>
              {app.command && (
                <code
                  className="app-detail-command"
                  title="Commande d’installation"
                >
                  {app.command}
                </code>
              )}
              <dl className="app-detail-group">
                {site && (
                  <div>
                    <dt>Site</dt>
                    <dd>
                      <a href={site} target="_blank" rel="noopener noreferrer">
                        {site.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    </dd>
                  </div>
                )}
                {github && (
                  <div>
                    <dt>{app.module ? "Documentation" : "GitHub"}</dt>
                    <dd>
                      <a
                        href={github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {github.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                )}

                {app.platform && (
                  <div>
                    <dt>Plateforme</dt>
                    <dd>{app.platform}</dd>
                  </div>
                )}
                {app.stack?.length ? (
                  <div>
                    <dt>Technologies</dt>
                    <dd>{app.stack.join(", ")}</dd>
                  </div>
                ) : null}
                {app.year && (
                  <div>
                    <dt>Année</dt>
                    <dd>{app.year}</dd>
                  </div>
                )}
                <div>
                  <dt>Catégorie</dt>
                  <dd>{app.category}</dd>
                </div>
              </dl>
            </div>
            {app.shot && (
              <figure className="app-detail-media">
                <Image
                  className="app-detail-shot"
                  src={app.shot}
                  alt={`Capture d’écran de ${app.name}`}
                  width={1440}
                  height={900}
                  sizes="(max-width: 760px) 90vw, 624px"
                />
              </figure>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
