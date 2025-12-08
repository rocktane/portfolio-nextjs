"use client";

import { useEffect } from "react";
import Link from "next/link";
import { COLORS } from "@/constants/theme";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8">
      <h1
        className="text-4xl md:text-6xl font-bright mb-4"
        style={{ color: COLORS.primary }}
      >
        Oups !
      </h1>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Une erreur est survenue. Pas de panique, ca arrive aux meilleurs.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-yellow rounded-full font-medium hover:opacity-80 transition-opacity"
        >
          Reessayer
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-current rounded-full font-medium hover:bg-gray-100 transition-colors"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
