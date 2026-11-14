import type { Metadata } from "next";
import CareerDatabase from "@/components/atelier/CareerDatabase";
export const metadata: Metadata = {
  title: "Parcours",
  description:
    "De la construction durable au développement fullstack et mobile : le parcours de Yohan Gouiran.",
  alternates: { canonical: "/parcours" },
};
export default function CareerPage() {
  return <CareerDatabase />;
}
