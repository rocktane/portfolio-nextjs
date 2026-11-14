import type { Metadata } from "next";
import Favorites from "@/components/atelier/Favorites";
export const metadata: Metadata = {
  title: "Favoris",
  description: "Les applications et outils préférés de Yohan Gouiran.",
  alternates: { canonical: "/favoris" },
};
export default function FavoritesPage() {
  return <Favorites />;
}
