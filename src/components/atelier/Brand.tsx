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
      <span className="brand-monogram" aria-hidden="true">
        Y
      </span>
      <span className="brand-word">
        yohan<span className="brand-slash">/</span>
        <span className="brand-name">atelier</span>
      </span>
    </Link>
  );
}
