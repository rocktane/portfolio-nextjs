"use client";

import Link from "next/link";
import { memo, useEffect, useRef, useState, useCallback } from "react";

function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [activeNav, setActiveNav] = useState(0);

  // Mesure les dimensions des éléments et met à jour les CSS custom properties
  const updateIndicatorDimensions = useCallback(() => {
    if (!navRef.current) return;

    const items = navRef.current.querySelectorAll(".nav-item");
    const navRect = navRef.current.getBoundingClientRect();

    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const left = rect.left - navRect.left;
      const width = rect.width;

      navRef.current?.style.setProperty(`--item-${index}-left`, `${left}px`);
      navRef.current?.style.setProperty(`--item-${index}-width`, `${width}px`);
    });
  }, []);

  // Mesure au montage et au resize
  useEffect(() => {
    updateIndicatorDimensions();

    window.addEventListener("resize", updateIndicatorDimensions);
    // Remesure après que les fonts soient chargées
    document.fonts.ready.then(updateIndicatorDimensions);

    return () => {
      window.removeEventListener("resize", updateIndicatorDimensions);
    };
  }, [updateIndicatorDimensions]);

  // Scroll spy
  useEffect(() => {
    const sections = ["projects", "contact"];
    const observers: IntersectionObserver[] = [];

    sections.forEach((sectionId, idx) => {
      const section = document.getElementById(sectionId);
      if (!section) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveNav(idx + 1);
            }
          });
        },
        { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
      );

      observer.observe(section);
      observers.push(observer);
    });

    const introObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(0);
          }
        });
      },
      { threshold: 0.5 }
    );

    const introSection = document.querySelector("section");
    if (introSection) {
      introObserver.observe(introSection);
    }

    return () => {
      observers.forEach((obs) => obs.disconnect());
      introObserver.disconnect();
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4">
      <nav
        ref={navRef}
        className="navbar-sliding flex items-center backdrop-blur-sm rounded-full px-2 py-2 shadow-sm"
        data-active={activeNav}
      >
        <Link href="/" className="nav-item flex items-center px-4 py-2 rounded-full">
          <span
            className="text-sm mr-1 px-1 rounded shadow-sm"
            style={{ lineHeight: "1.5em" }}
          >
            /
          </span>
          yohan
        </Link>
        <a href="#projects" className="nav-item px-4 py-2 rounded-full">
          projets
        </a>
        <a href="#contact" className="nav-item px-4 py-2 rounded-full">
          contact
        </a>
      </nav>
    </header>
  );
}

export default memo(Navbar);
