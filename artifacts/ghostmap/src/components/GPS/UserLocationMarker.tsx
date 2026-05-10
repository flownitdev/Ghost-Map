import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoPosition } from "@/hooks/useGeolocation";

interface UserLocationMarkerProps {
  position: GeoPosition | null;
  visible:  boolean;
}

export function UserLocationMarker({ position, visible }: UserLocationMarkerProps) {
  const map        = useMap();
  const markerRef  = useRef<L.Marker | null>(null);
  const circleRef  = useRef<L.Circle | null>(null);
  const hasPannedRef = useRef(false);

  useEffect(() => {
    if (markerRef.current)  { map.removeLayer(markerRef.current);  markerRef.current  = null; }
    if (circleRef.current)  { map.removeLayer(circleRef.current);  circleRef.current  = null; }

    if (!visible || !position) return;

    const pulseIcon = L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:32px;height:32px;">
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(74,222,128,0.15);border:1.5px solid rgba(74,222,128,0.5);animation:ghost-ripple 2s ease-out infinite;"></div>
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);animation:ghost-ripple 2s ease-out 0.7s infinite;"></div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;background:#4ade80;border-radius:50%;box-shadow:0 0 0 2.5px rgba(10,9,14,0.9),0 0 12px rgba(74,222,128,0.8);"></div>
        </div>
      `,
      iconSize:   [32, 32],
      iconAnchor: [16, 16],
    });

    markerRef.current = L.marker([position.lat, position.lng], { icon: pulseIcon, zIndexOffset: 1000 }).addTo(map);

    if (position.accuracy < 300) {
      circleRef.current = L.circle([position.lat, position.lng], {
        radius:      position.accuracy,
        color:       "#4ade80",
        fillColor:   "#4ade80",
        fillOpacity: 0.04,
        weight:      1,
        opacity:     0.25,
      }).addTo(map);
    }

    if (!hasPannedRef.current) {
      map.panTo([position.lat, position.lng], { animate: true, duration: 0.8 });
      hasPannedRef.current = true;
    }

    return () => {
      if (markerRef.current)  { try { map.removeLayer(markerRef.current);  } catch { /* */ } markerRef.current  = null; }
      if (circleRef.current)  { try { map.removeLayer(circleRef.current);  } catch { /* */ } circleRef.current  = null; }
    };
  }, [map, position, visible]);

  useEffect(() => {
    if (!visible) hasPannedRef.current = false;
  }, [visible]);

  return null;
}
