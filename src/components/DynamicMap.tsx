"use client";

import dynamic from "next/dynamic";

// Leaflet touche au DOM au montage : il ne peut pas être rendu côté serveur.
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface" />,
});

export default function DynamicMap() {
  return <Map />;
}
