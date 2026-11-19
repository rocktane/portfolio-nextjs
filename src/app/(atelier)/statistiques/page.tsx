import type { Metadata } from "next";
import VisitorsChart from "@/components/atelier/VisitorsChart";
export const metadata: Metadata = {
  title: "Statistiques",
  description:
    "Nombre de visiteurs des sites de Yohan Gouiran, mesuré sans cookies.",
  alternates: { canonical: "/statistiques" },
};
export default function StatsPage() {
  return (
    <>
      <div className="page-heading">
        <h1>Statistiques</h1>
      </div>
      <VisitorsChart />
    </>
  );
}
