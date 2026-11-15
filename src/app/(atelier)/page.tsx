import Link from "next/link";
import CvQrCode from "@/components/atelier/CvQrCode";
import FloatingTools from "@/components/atelier/FloatingTools";
import HomeProjectBackground from "@/components/atelier/HomeProjectBackground";
import HomeCardArtwork from "@/components/atelier/HomeCardArtwork";
import RotatingWords from "@/components/atelier/RotatingWords";

const SPECIALTIES = ["web", "mobile", "automatisation", "agents IA"];

export default function HomePage() {
  return (
    <section className="home-page" aria-labelledby="home-title">
      <div className="home-hero">
        <h1 id="home-title">
          Développeur fullstack.
          <br />
          <RotatingWords words={SPECIALTIES} />
        </h1>
        <FloatingTools />
        <CvQrCode />
      </div>
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
