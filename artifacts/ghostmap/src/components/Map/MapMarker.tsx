import { useMemo } from "react";
import { Marker } from "react-leaflet";
import type { Location } from "@/types/location";
import { createGlowingMarker } from "@/lib/mapUtils";

interface MapMarkerProps {
  location: Location;
  onSelect: (location: Location) => void;
}

export function MapMarker({ location, onSelect }: MapMarkerProps) {
  const icon = useMemo(() => createGlowingMarker(), []);

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(location) }}
      data-testid={`marker-location-${location.id}`}
    />
  );
}
