import Link from "next/link";
import Icon from "@/components/atelier/Icon";

export default function HomePage() {
  return (
    <section className="home-page" aria-labelledby="home-title">
      <h1 id="home-title">
        Développeur
        <br />
        fullstack &amp; mobile.
      </h1>
      <nav className="home-paths" aria-label="Explorer le portfolio">
        <Link href="/projets" className="home-path home-path-primary">
          <span>Projets</span>
          <Icon name="arrow" />
        </Link>
        <Link href="/parcours" className="home-path">
          <span>Parcours</span>
          <Icon name="arrow" />
        </Link>
        <Link href="/contact" className="home-path">
          <span>Contact</span>
          <Icon name="arrow" />
        </Link>
      </nav>
    </section>
  );
}
