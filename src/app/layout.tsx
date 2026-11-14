import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { THEME_INIT } from "@/lib/theme";
import Shell from "@/components/atelier/Shell";
import "./fonts.css";
import "./globals.css";
import "./floating-sidebar.css";
import "./themes.css";
import "./workspaces.css";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f7f4",
};
export const metadata: Metadata = {
  metadataBase: new URL("https://yohangouiran.com"),
  title: {
    default: "Yohan Gouiran — Développeur Fullstack / mobile",
    template: "%s — Yohan Gouiran",
  },
  description:
    "Développeur fullstack et mobile à Marseille. Projets web, applications macOS, parcours et contact.",
  authors: [{ name: "Yohan Gouiran" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Yohan Gouiran — Développeur Fullstack / mobile",
    description:
      "Projets, applications et parcours d’un développeur à Marseille.",
    type: "website",
    url: "https://yohangouiran.com",
    siteName: "Yohan Gouiran",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yohan Gouiran — Développeur Fullstack / mobile",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
    ],
    apple: "/apple-touch-icon.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <Shell>{children}</Shell>
        {process.env.VERCEL === "1" && <Analytics />}
      </body>
    </html>
  );
}
