import type { Metadata } from "next";
import AppCatalog from "@/components/atelier/AppCatalog";
import { tryTools } from "@/data/try-tools";
export const metadata: Metadata = {
  title: "À essayer",
  description: "Les applications développées par Yohan Gouiran, à essayer.",
  alternates: { canonical: "/a-essayer" },
};
export default function TryPage() {
  return (
    <AppCatalog
      title="À essayer"
      apps={tryTools}
      noun="outil"
      emptyTitle="Aucune application trouvée."
    />
  );
}
