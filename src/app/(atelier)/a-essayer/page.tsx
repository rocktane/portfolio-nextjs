import type { Metadata } from "next";
import TryTools from "@/components/atelier/TryTools";
export const metadata: Metadata = {
  title: "À essayer",
  alternates: { canonical: "/a-essayer" },
};
export default function TryPage() {
  return (
    <>
      <div className="page-heading">
        <h1>À essayer</h1>
      </div>
      <TryTools />
    </>
  );
}
