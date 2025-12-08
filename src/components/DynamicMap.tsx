"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 rounded-3xl animate-pulse" />
  ),
});

export default function DynamicMap() {
  return <Map />;
}
