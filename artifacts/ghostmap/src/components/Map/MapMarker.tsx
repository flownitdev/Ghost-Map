import { useState, useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import type { Location } from "@/types/location";
import { CATEGORY_META } from "@/lib/mapUtils";

type MarkerState = "resting" | "hovered" | "selected";

function createMarkerIcon(location: Location, state: MarkerState): L.DivIcon {
  const { glowColor } = CATEGORY_META[location.category];
  const color = "#A855F7";
  const isSelected = state === "selected";
  const isHovered = state === "hovered";

  const dotSize = isSelected ? 14 : isHovered ? 12 : 9;
  const dotOffset = (30 - dotSize) / 2;

  const glow = isSelected
    ? `0 0 0 2px ${glowColor.replace("0.45", "0.2")}, 0 0 16px 5px ${color}, 0 0 32px 10px ${glowColor}`
    : isHovered
    ? `0 0 10px 3px ${color}, 0 0 22px 7px ${glowColor}`
    : `0 0 6px 2px ${color}cc, 0 0 14px 4px ${glowColor.replace("0.45", "0.3")}`;

  const innerDot =
    isSelected || isHovered
      ? `<div style="position:absolute;width:4px;height:4px;background:rgba(255,255,255,0.9);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);"></div>`
      : "";

  const ripple = isSelected
    ? `<div style="position:absolute;width:${dotSize + 12}px;height:${dotSize + 12}px;top:${(30 - dotSize - 12) / 2}px;left:${(30 - dotSize - 12) / 2}px;border-radius:50%;border:1.5px solid ${color}80;animation:ghost-ripple 1.8s ease-out infinite;"></div>
       <div style="position:absolute;width:${dotSize + 22}px;height:${dotSize + 22}px;top:${(30 - dotSize - 22) / 2}px;left:${(30 - dotSize - 22) / 2}px;border-radius:50%;border:1px solid ${color}33;animation:ghost-ripple 1.8s ease-out 0.5s infinite;"></div>`
    : "";

  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:30px;height:30px;">
      ${ripple}
      <div style="position:absolute;top:${dotOffset}px;left:${dotOffset}px;width:${dotSize}px;height:${dotSize}px;background:${color};border-radius:50%;box-shadow:${glow};transition:width 0.18s ease,height 0.18s ease,top 0.18s ease,left 0.18s ease,box-shadow 0.18s ease;">${innerDot}</div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

interface MapMarkerProps {
  location: Location;
  isSelected: boolean;
  onSelect: (location: Location) => void;
}

export function MapMarker({ location, isSelected, onSelect }: MapMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const state: MarkerState = isSelected ? "selected" : hovered ? "hovered" : "resting";
  const icon = useMemo(() => createMarkerIcon(location, state), [location, state]);

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
