"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4">
      <nav
        className="flex items-center backdrop-blur-sm rounded-full px-2 py-2 shadow-sm"
        style={{
          color: "rgba(1, 56, 63, 0.8)",
          fontFamily: "Alexandria, sans-serif",
          fontSize: "clamp(1rem, 3vw, 1.4rem)",
        }}
      >
        <Link
          href="/"
          className={`flex items-center px-4 py-2 rounded-full transition-all ${
            pathname === "/"
              ? "bg-white/60 shadow-sm"
              : "hover:bg-white/30"
          }`}
        >
          <span
            className="text-sm mr-1 px-1 rounded shadow-sm"
            style={{ lineHeight: "1.5em" }}
          >
            /
          </span>
          yohan
        </Link>
        <a
          href="#projects"
          className="px-4 py-2 rounded-full hover:bg-white/30 transition-all"
        >
          projets
        </a>
        <a
          href="#contact"
          className="px-4 py-2 rounded-full hover:bg-white/30 transition-all"
        >
          contact
        </a>
      </nav>
    </header>
  );
}
