import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import ProjectModal from "@/components/ProjectModal";

/**
 * Polices servies par Bunny Fonts (miroir de Google Fonts sans cookies).
 * Anton pour les titres, JetBrains Mono pour la métadonnée, Inter pour le texte.
 */
const FONTS_HREF =
  "https://fonts.bunny.net/css2?family=Anton&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://yohangouiran.com"),
  title: "Yohan Gouiran — Développeur Full Stack",
  description:
    "Développeur full stack à Marseille. React, Next.js, NestJS, React Native, SwiftUI. Disponible pour missions.",
  keywords: [
    "développeur web",
    "full stack",
    "marseille",
    "react",
    "next.js",
    "react native",
    "freelance",
  ],
  authors: [{ name: "Yohan Gouiran" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: "Yohan Gouiran — Développeur Full Stack",
    description:
      "Développeur full stack à Marseille. Disponible pour missions.",
    type: "website",
    url: "https://yohangouiran.com",
    siteName: "Yohan Gouiran",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yohan Gouiran — Développeur Full Stack",
    description:
      "Développeur full stack à Marseille. Disponible pour missions.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `no-js` est retiré par le script ci-dessous avant l'hydratation :
    // l'écart avec le HTML serveur est voulu, pas une incohérence.
    <html lang="fr" className="no-js" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.bunny.net" crossOrigin="" />
        <link rel="stylesheet" href={FONTS_HREF} />
        {/*
          Retire `no-js` avant le premier rendu, pour que les animations
          partent de leur état initial sans clignotement. Le minuteur le
          remet si l'hydratation n'aboutit pas : mieux vaut un site sans
          animation qu'une page noire. Providers l'annule une fois monté.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.remove('no-js');" +
              "window.__revealFallback=setTimeout(function(){d.classList.add('no-js')},4000)})()",
          }}
        />
      </head>
      <body className="min-h-screen bg-ink text-paper antialiased">
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>

        <Providers>
          <Nav />
          <main id="main-content">{children}</main>
          <Footer />
          <ProjectModal />
        </Providers>

        <div className="grain" aria-hidden="true" />

        <Script
          src="https://embed.typeform.com/next/embed.js"
          strategy="lazyOnload"
        />

        <Analytics />
      </body>
    </html>
  );
}
