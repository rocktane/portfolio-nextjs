import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col justify-center px-[var(--gutter)] py-32">
      <span className="label text-amber">Erreur 404</span>
      <h1 className="display mt-6 text-[clamp(4rem,20vw,16rem)] leading-none">404</h1>
      <p className="display mt-2 text-[clamp(1.5rem,5vw,3.5rem)] text-white/70">
        Page introuvable
      </p>
      <p className="mt-8 max-w-md leading-relaxed text-white/65">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mono mt-10 inline-block self-start bg-amber px-6 py-4 text-ink transition-opacity hover:opacity-85"
      >
        Retour à l&apos;accueil →
      </Link>
    </main>
  );
}
