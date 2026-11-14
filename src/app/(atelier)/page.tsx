import Link from "next/link";
import HomeProjectBackground from "@/components/atelier/HomeProjectBackground";
import HomeCardArtwork from "@/components/atelier/HomeCardArtwork";

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
          <HomeProjectBackground />
          <span>Projets</span>
        </Link>
        <Link href="/parcours" className="home-path">
          <HomeCardArtwork composition="ribbon" />
          <span>Parcours</span>
        </Link>
        <Link href="/contact" className="home-path">
          <HomeCardArtwork composition="contact" />
          <span>Contact</span>
        </Link>
      </nav>
    </section>
  );
}
