"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MAP_CONFIG } from "@/constants/theme";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    }).setView(MAP_CONFIG.center, MAP_CONFIG.zoom);

    L.tileLayer(
      MAP_CONFIG.tileUrl + (L.Browser.retina ? "@2x.png" : ".png"),
      {
        minZoom: MAP_CONFIG.zoom,
        maxZoom: MAP_CONFIG.zoom,
        subdomains: MAP_CONFIG.subdomains,
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className="w-full h-full min-h-[200px]" />;
}
