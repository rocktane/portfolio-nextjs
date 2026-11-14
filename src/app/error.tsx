"use client";
import Link from "next/link";
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="error-page" role="alert">
      <h1>Impossible d’afficher cette page.</h1>
      <div className="contact-actions">
        <button className="solid-button" type="button" onClick={reset}>
          Réessayer
        </button>
        <Link className="outline-button" href="/">
          Revenir aux projets
        </Link>
      </div>
    </section>
  );
}
