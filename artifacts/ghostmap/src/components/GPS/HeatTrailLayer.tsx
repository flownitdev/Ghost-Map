import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface HeatTrailLayerProps {
  trailPoints: [number, number][];
  visible:     boolean;
}

export function HeatTrailLayer({ trailPoints, visible }: HeatTrailLayerProps) {
  const map       = useMap();
  const linesRef  = useRef<L.Polyline[]>([]);
  const dotsRef   = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    linesRef.current.forEach((l) => { try { map.removeLayer(l); } catch { /* */ } });
    dotsRef.current.forEach((d)  => { try { map.removeLayer(d); } catch { /* */ } });
    linesRef.current = [];
    dotsRef.current  = [];

    if (!visible || trailPoints.length < 2) return;

    const line = L.polyline(trailPoints, {
      color:       "#f97316",
      weight:      2.5,
      opacity:     0.65,
      lineCap:     "round",
      lineJoin:    "round",
      dashArray:   "4 6",
    });
    line.addTo(map);
    linesRef.current.push(line);

    if (trailPoints.length > 0) {
      const last = trailPoints[trailPoints.length - 1];
      const dot = L.circleMarker(last, {
        radius:      4,
        color:       "#f97316",
        fillColor:   "#f97316",
        fillOpacity: 0.9,
        weight:      0,
      }).addTo(map);
      dotsRef.current.push(dot);
    }

    return () => {
      linesRef.current.forEach((l) => { try { map.removeLayer(l); } catch { /* */ } });
      dotsRef.current.forEach((d)  => { try { map.removeLayer(d); } catch { /* */ } });
      linesRef.current = [];
      dotsRef.current  = [];
    };
  }, [map, trailPoints, visible]);

  return null;
}
