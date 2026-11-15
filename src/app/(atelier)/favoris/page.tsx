import type { Metadata } from "next";
import AppCatalog from "@/components/atelier/AppCatalog";
import { favorites } from "@/data/favorites";
export const metadata: Metadata = {
  title: "Favoris",
  description: "Les applications et outils préférés de Yohan Gouiran.",
  alternates: { canonical: "/favoris" },
};
export default function FavoritesPage() {
  return (
    <AppCatalog
      title="Favoris"
      apps={favorites}
      noun="favori"
      emptyTitle="Aucun favori trouvé."
    />
  );
}
