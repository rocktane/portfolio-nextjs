"use client";
import Link from "next/link";
import { resetCollectionQuery } from "@/lib/collection-navigation";
export default function Brand() {
  return (
    <Link
      onClick={resetCollectionQuery}
      href="/"
      className="atelier-brand"
      aria-label="yohan/portfolio — Accueil"
    >
      <span className="brand-word">
        yohan<span className="brand-slash">/</span>
        <span className="brand-name">portfolio</span>
      </span>
    </Link>
  );
}
