import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import type { Location } from "@/types/location";

interface HeatmapLayerProps {
  locations: Location[];
  intensity: number;
  radius: number;
  visible: boolean;
}

export function HeatmapLayer({ locations, intensity, radius, visible }: HeatmapLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    const L_any = L as typeof L & { heatLayer?: (...args: unknown[]) => L.HeatLayer };
    if (!L_any.heatLayer) return;

    if (layerRef.current) {
      try { map.removeLayer(layerRef.current); } catch { /* ignore */ }
      layerRef.current = null;
    }

    if (!visible || locations.length === 0) return;

    const points: L.HeatLatLngTuple[] = locations.map((loc) => [
      loc.latitude,
      loc.longitude,
      Math.min(1, (loc.abandonmentScore / 100) * intensity * 1.4),
    ]);

    layerRef.current = L.heatLayer(points, {
      radius,
      blur: Math.round(radius * 0.75),
      maxZoom: 18,
      max: 1.0,
      minOpacity: 0.18,
      gradient: {
        0.0:  "rgba(12,11,17,0)",
        0.18: "rgba(45,27,94,0.5)",
        0.40: "#7c3aed",
        0.60: "#A855F7",
        0.78: "#f97316",
        1.0:  "#ef4444",
      },
    });

    layerRef.current.addTo(map);

    return () => {
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current); } catch { /* ignore */ }
        layerRef.current = null;
      }
    };
  }, [map, locations, intensity, radius, visible]);

  return null;
}
