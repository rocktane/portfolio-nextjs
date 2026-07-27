"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_CONFIG } from "@/constants/theme";

/** Icône "viseur" façon géolocalisation — markup statique, aucune donnée externe */
const RECENTER_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <circle cx="12" cy="12" r="9" />
  <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
  <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
</svg>`;

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map — pan, zoom and keyboard navigation are all enabled.
    // Wheel zoom starts off so the wheel keeps scrolling the page; it is armed
    // once the visitor actually clicks (or focuses) the map.
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      // Sur mobile, le drag capturerait le scroll vertical de la page :
      // on laisse le pinch-to-zoom et les boutons +/- faire le travail.
      dragging: !L.Browser.mobile,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
    }).setView(MAP_CONFIG.center, MAP_CONFIG.zoom);

    L.tileLayer(
      MAP_CONFIG.tileUrl + (L.Browser.retina ? "@2x.png" : ".png"),
      {
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        subdomains: MAP_CONFIG.subdomains,
      }
    ).addTo(map);

    // Bouton "recentrer" : ramène la vue sur le point de départ (Marseille)
    const RecenterControl = L.Control.extend({
      options: { position: "bottomright" as L.ControlPosition },
      onAdd() {
        // `leaflet-control` est requis : les coins du conteneur sont en
        // pointer-events:none, c'est cette classe qui réactive les clics.
        const button = L.DomUtil.create("button", "map-recenter leaflet-control");
        button.type = "button";
        button.title = "Revenir sur Marseille";
        button.setAttribute("aria-label", "Revenir sur Marseille");
        button.innerHTML = RECENTER_ICON;

        // Sinon le clic déclencherait aussi un pan/zoom de la carte
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, "click", (event) => {
          L.DomEvent.stop(event);
          map.flyTo(MAP_CONFIG.center, MAP_CONFIG.zoom, { duration: 0.8 });
        });

        return button;
      },
    });

    const recenterControl = new RecenterControl();
    recenterControl.addTo(map);

    const enableWheel = () => map.scrollWheelZoom.enable();
    const disableWheel = () => map.scrollWheelZoom.disable();

    map.on("click focus", enableWheel);
    map.on("mouseout blur", disableWheel);

    mapInstanceRef.current = map;

    return () => {
      map.off("click focus", enableWheel);
      map.off("mouseout blur", disableWheel);
      recenterControl.remove();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[200px]"
      role="application"
      aria-label="Carte interactive - Marseille, France"
    />
  );
}
