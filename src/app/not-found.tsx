import Link from "next/link";
export default function NotFound() {
  return (
    <section className="error-page">
      <span>404</span>
      <h1>Page introuvable.</h1>
      <Link className="solid-button" href="/">
        Revenir aux projets
      </Link>
    </section>
  );
}
