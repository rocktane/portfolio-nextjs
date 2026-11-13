"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { projects } from "@/data/projects";
import { collectionNames, collectionPaths } from "@/lib/atelier";
import { resetCollectionQuery } from "@/lib/collection-navigation";
import Brand from "./Brand";
import GuestIdentity from "./GuestIdentity";
import Icon, { type IconName } from "./Icon";
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
  { href: "/parcours", label: "Parcours", icon: "route" },
  { href: "/archives", label: "Archives", icon: "archive" },
  { href: "/contact", label: "Contact", icon: "mail" },
];
export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const project = pathname.startsWith("/projets/")
    ? projects.find((p) => p.id === pathname.split("/")[2])
    : null;
  const active = project ? collectionPaths[project.section] : pathname;
  const label = project
    ? collectionNames[project.section]
    : (navigation.find((n) => n.href === pathname)?.label ?? "Atelier");
  return (
    <WeatherProvider>
      <div className="atelier-layout">
        <a className="skip-link" href="#main-content">
          Aller au contenu principal
        </a>
        <aside className="atelier-sidebar">
          <Brand />
          <GuestIdentity />
          <nav className="sidebar-nav" aria-label="Navigation principale">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={resetCollectionQuery}
                aria-current={active === item.href ? "page" : undefined}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="nav-count">{item.count}</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <SocialLinks />
            <Link className="outline-button sidebar-contact" href="/contact">
              Se connecter
              <Icon name="arrow" />
            </Link>
            <div className="sidebar-weather">
              <MarseilleWeather />
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
              <SocialLinks compact />
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
