import Link from "next/link";
import { COLORS } from "@/constants/theme";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8">
      <h1
        className="text-6xl md:text-8xl font-bright mb-4"
        style={{ color: COLORS.primary }}
      >
        404
      </h1>
      <h2
        className="text-2xl md:text-3xl font-bright mb-4"
        style={{ color: COLORS.primary }}
      >
        Page non trouvée
      </h2>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Désolé, la page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-yellow rounded-full font-medium hover:opacity-80 transition-opacity"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
