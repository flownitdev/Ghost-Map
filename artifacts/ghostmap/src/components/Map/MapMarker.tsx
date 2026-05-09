import { useState, useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import type { Location } from "@/types/location";

function createMarker(hovered: boolean): L.DivIcon {
  const size = hovered ? 18 : 11;
  const anchor = hovered ? 9 : 5.5;
  const color = "#FA4817";
  const glow = hovered
    ? `0 0 0 3px rgba(250,72,23,0.2), 0 0 14px 4px ${color}, 0 0 28px 8px rgba(250,72,23,0.4)`
    : `0 0 8px 2px ${color}, 0 0 18px 5px rgba(250,72,23,0.35)`;
  const inner = hovered
    ? `<div style="position:absolute;inset:3px;border-radius:50%;background:rgba(255,255,255,0.25);"></div>`
    : "";

  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;
      height:${size}px;
      background:${color};
      border-radius:50%;
      box-shadow:${glow};
      position:relative;
      transition:all 0.2s ease;
      ${hovered ? "transform:scale(1);" : ""}
    ">${inner}</div>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

interface MapMarkerProps {
  location: Location;
  isSelected: boolean;
  onSelect: (location: Location) => void;
}

export function MapMarker({ location, isSelected, onSelect }: MapMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const icon = useMemo(
    () => createMarker(hovered || isSelected),
    [hovered, isSelected]
  );

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(location),
        mouseover: () => setHovered(true),
        mouseout: () => setHovered(false),
      }}
    />
  );
}
