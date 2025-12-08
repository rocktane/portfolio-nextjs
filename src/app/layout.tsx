import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Yohan Gouiran - Developpeur Web",
  description: "Developpeur Full Stack a Marseille. Ruby on Rails, JavaScript, React, Next.js.",
  keywords: ["developpeur web", "full stack", "marseille", "ruby on rails", "react", "next.js"],
  authors: [{ name: "Yohan Gouiran" }],
  openGraph: {
    title: "Yohan Gouiran - Developpeur Web",
    description: "Developpeur Full Stack a Marseille",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${alexandria.variable} ${alata.variable} ${bright.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
