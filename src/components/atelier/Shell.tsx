"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { projects } from "@/data/projects";
import { collectionNames, collectionPaths } from "@/lib/atelier";
import { resetCollectionQuery } from "@/lib/collection-navigation";
import Brand from "./Brand";
import CommandPalette from "./CommandPalette";
import GuestIdentity from "./GuestIdentity";
import Icon, { type IconName } from "./Icon";
import SidebarToggle, { useSidebar } from "./SidebarToggle";
import ThemePicker from "./ThemePicker";
import SocialLinks from "./SocialLinks";
import { MarseilleWeather, WeatherProvider } from "./Weather";
const navigation: {
  href: string;
  label: string;
  icon: IconName;
  count?: number;
}[] = [
  { href: "/", label: "Accueil", icon: "home" },
  {
    href: "/projets",
    label: "Projets",
    icon: "grid",
    count: projects.filter((p) => p.section === "projets").length,
  },
  {
    href: "/labo",
    label: "Le labo",
    icon: "flask",
    count: projects.filter((p) => p.section === "labo").length,
  },
  { href: "/a-essayer", label: "À essayer", icon: "play" },
  { href: "/favoris", label: "Favoris", icon: "heart" },
  { href: "/parcours", label: "Parcours", icon: "route" },
  { href: "/archives", label: "Archives", icon: "archive" },
  { href: "/contact", label: "Contact", icon: "mail" },
];
export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const { hidden: sidebarHidden } = useSidebar();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuOpen = openPath === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);
  const project = pathname.startsWith("/projets/")
    ? projects.find((p) => p.id === pathname.split("/")[2])
    : null;
  const active = project ? collectionPaths[project.section] : pathname;
  const label = project
    ? collectionNames[project.section]
    : (navigation.find((n) => n.href === pathname)?.label ?? "Portfolio");
  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const update = () => {
      const link = nav.querySelector<HTMLElement>('a[aria-current="page"]');
      // Garder la dernière position sur les pages hors navigation.
      if (!link) return;
      indicator.style.transform = `translate(${link.offsetLeft}px, ${link.offsetTop}px)`;
      indicator.style.width = `${link.offsetWidth}px`;
      indicator.style.height = `${link.offsetHeight}px`;
      if (!nav.hasAttribute("data-indicator-ready")) {
        // Poser l'indicateur avant d'activer les transitions au premier rendu.
        indicator.getBoundingClientRect();
        nav.setAttribute("data-indicator-ready", "");
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    nav
      .querySelectorAll(":scope > a")
      .forEach((link) => observer.observe(link));
    return () => observer.disconnect();
  }, [active]);

  return (
    <WeatherProvider>
      <div className="atelier-layout">
        <a className="skip-link" href="#main-content">
          Aller au contenu principal
        </a>
        <aside
          className="atelier-sidebar"
          data-menu-open={menuOpen}
          onKeyDown={(event) => {
            if (event.key === "Escape" && menuOpen) {
              setOpenPath(null);
              menuButton.current?.focus();
            }
          }}
        >
          <div className="sidebar-brand-row">
            <Brand />
            <SidebarToggle />
          </div>
          <button
            ref={menuButton}
            className="mobile-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="portfolio-navigation"
            onClick={() => setOpenPath(menuOpen ? null : pathname)}
          >
            {menuOpen ? "Fermer" : "Menu"}
            <span className="mobile-menu-glyph" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
          <div
            id="sidebar-panel"
            className="sidebar-panel"
            inert={sidebarHidden}
          >
            <GuestIdentity />
            <nav
              ref={navRef}
              id="portfolio-navigation"
              className="sidebar-nav"
              aria-label="Navigation principale"
            >
              <span
                ref={indicatorRef}
                className="sidebar-active-indicator"
                aria-hidden="true"
              />
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) => {
                    resetCollectionQuery(event);
                    setOpenPath(null);
                  }}
                  aria-current={active === item.href ? "page" : undefined}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span className="nav-count">{item.count}</span>
                  )}
                </Link>
              ))}
              <SocialLinks compact embedded />
            </nav>
            <div className="sidebar-bottom">
              <SocialLinks />

              <div className="sidebar-weather">
                <MarseilleWeather />
              </div>
            </div>
          </div>
        </aside>
        <div className="workspace-shell">
          <header className="workspace-header">
            <nav className="breadcrumbs" aria-label="Fil d’Ariane">
              <Link href="/" onClick={resetCollectionQuery}>
                Portfolio
              </Link>
              <span aria-hidden="true">/</span>
              {project ? (
                <>
                  <Link
                    href={collectionPaths[project.section]}
                    onClick={resetCollectionQuery}
                  >
                    {label}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">{project.title}</span>
                </>
              ) : (
                <span aria-current="page">{label}</span>
              )}
            </nav>
            <div className="header-weather">
              <MarseilleWeather />
            </div>
            <div className="header-actions">
              <ThemePicker />
              <CommandPalette />
              <Link
                href="/contact"
                className={`outline-button header-contact${pathname === "/contact" ? " header-contact-hidden" : ""}`}
                tabIndex={pathname === "/contact" ? -1 : undefined}
                aria-hidden={pathname === "/contact" ? true : undefined}
              >
                Se connecter
                <Icon name="arrow" />
              </Link>
            </div>
          </header>
          <main id="main-content" tabIndex={-1} className="workspace-main">
            {children}
          </main>
          <footer className="workspace-footer">
            <span>© 2026 Yohan Gouiran</span>
          </footer>
        </div>
      </div>
    </WeatherProvider>
  );
}
