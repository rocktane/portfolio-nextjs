"use client";
import Link from "next/link";
import { resetCollectionQuery } from "@/lib/collection-navigation";
export default function Brand() {
  return (
    <Link
      onClick={resetCollectionQuery}
      href="/"
      className="atelier-brand"
      aria-label="yohan/atelier — Projets"
    >
      <svg viewBox="0 0 34 34" aria-hidden="true" fill="none">
        <rect x="1" y="1" width="32" height="32" rx="10" fill="currentColor" />
        <path
          d="m10 10 7 8 7-8M17 18v7"
          stroke="#f5f7f4"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="26" cy="26" r="3" fill="#e6ab69" />
      </svg>
      <span className="brand-word">
        yohan<span className="brand-slash">/</span>
        <span className="brand-name">atelier</span>
      </span>
    </Link>
  );
}
