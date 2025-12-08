import type { Metadata, Viewport } from "next";
import { Alexandria, Alata } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["latin"],
});

const alata = Alata({
  weight: "400",
  variable: "--font-alata",
  subsets: ["latin"],
});

const bright = localFont({
  src: "../../public/fonts/bright.otf",
  variable: "--font-bright",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://yohangouiran.com"),
  title: "Yohan Gouiran - Développeur Web",
  description: "Développeur Full Stack à Marseille. Ruby on Rails, JavaScript, React, Next.js.",
  keywords: ["développeur web", "full stack", "marseille", "ruby on rails", "react", "next.js"],
  authors: [{ name: "Yohan Gouiran" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "Yohan Gouiran - Développeur Web",
    description: "Développeur Full Stack à Marseille. Ruby on Rails, JavaScript, React, Next.js.",
    type: "website",
    url: "https://yohangouiran.com",
    siteName: "Yohan Gouiran",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yohan Gouiran - Développeur Web",
    description: "Développeur Full Stack à Marseille. Ruby on Rails, JavaScript, React, Next.js.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${alexandria.variable} ${alata.variable} ${bright.variable} antialiased bg-background text-foreground font-sans min-h-screen m-0 p-0`}>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
