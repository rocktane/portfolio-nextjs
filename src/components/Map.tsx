"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_CONFIG } from "@/constants/theme";

/**
 * La carte n'est plus un objet à manipuler : elle situe, point. Toutes les
 * interactions sont coupées, les tuiles sont sombres et désaturées par CSS,
 * et le repère est un simple point ambre.
 */
export default function Map() {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!container.current || instance.current) return;

    const map = L.map(container.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      dragging: false,
      keyboard: false,
      boxZoom: false,
    }).setView(MAP_CONFIG.marker, MAP_CONFIG.zoom);

    L.tileLayer(MAP_CONFIG.tileUrl + (L.Browser.retina ? "@2x.png" : ".png"), {
      subdomains: MAP_CONFIG.subdomains,
    }).addTo(map);

    L.circleMarker(MAP_CONFIG.marker, {
      radius: 5,
      color: "#f5a623",
      fillColor: "#f5a623",
      fillOpacity: 1,
      weight: 8,
      opacity: 0.25,
    }).addTo(map);

    instance.current = map;

    return () => {
      map.remove();
      instance.current = null;
    };
  }, []);

  return <div ref={container} className="h-full w-full" aria-hidden="true" />;
}
