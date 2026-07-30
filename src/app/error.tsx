"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <main
      role="alert"
      className="flex min-h-screen flex-col justify-center px-[var(--gutter)] py-32"
    >
      <span className="label text-amber">Incident technique</span>
      <h1 className="display mt-6 text-[clamp(3rem,14vw,10rem)] leading-none">
        Erreur
      </h1>
      <p className="mt-8 max-w-md leading-relaxed text-white/65">
        Une erreur inattendue est survenue. Pas de panique, ça arrive aux
        meilleurs.
      </p>
      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
        <button
          type="button"
          onClick={reset}
          className="mono bg-amber px-6 py-4 text-ink transition-opacity hover:opacity-85"
        >
          Réessayer →
        </button>
        <Link
          href="/"
          className="mono self-center text-muted underline-sweep transition-colors hover:text-white"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
