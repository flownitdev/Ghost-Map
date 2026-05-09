import { useState, useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import type { Location } from "@/types/location";

type MarkerState = "resting" | "hovered" | "selected";

function createMarkerIcon(state: MarkerState): L.DivIcon {
  const isSelected = state === "selected";
  const isHovered = state === "hovered";

  const dotSize = isSelected ? 14 : isHovered ? 12 : 9;
  const dotOffset = (30 - dotSize) / 2;

  const glowSpread = isSelected
    ? "0 0 0 2px rgba(250,72,23,0.25), 0 0 16px 5px #FA4817, 0 0 32px 10px rgba(250,72,23,0.4)"
    : isHovered
    ? "0 0 10px 3px #FA4817, 0 0 22px 7px rgba(250,72,23,0.45)"
    : "0 0 6px 2px rgba(250,72,23,0.9), 0 0 14px 4px rgba(250,72,23,0.3)";

  const innerDot = isSelected || isHovered
    ? `<div style="position:absolute;width:4px;height:4px;background:rgba(255,255,255,0.9);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);"></div>`
    : "";

  const ripple = isSelected
    ? `<div style="
        position:absolute;
        width:${dotSize + 12}px;height:${dotSize + 12}px;
        top:${(30 - dotSize - 12) / 2}px;left:${(30 - dotSize - 12) / 2}px;
        border-radius:50%;
        border:1.5px solid rgba(250,72,23,0.5);
        animation:ghost-ripple 1.8s ease-out infinite;
      "></div>
      <div style="
        position:absolute;
        width:${dotSize + 22}px;height:${dotSize + 22}px;
        top:${(30 - dotSize - 22) / 2}px;left:${(30 - dotSize - 22) / 2}px;
        border-radius:50%;
        border:1px solid rgba(250,72,23,0.2);
        animation:ghost-ripple 1.8s ease-out 0.5s infinite;
      "></div>`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:30px;height:30px;">
        ${ripple}
        <div style="
          position:absolute;
          top:${dotOffset}px;left:${dotOffset}px;
          width:${dotSize}px;height:${dotSize}px;
          background:#FA4817;
          border-radius:50%;
          box-shadow:${glowSpread};
          transition:width 0.18s ease,height 0.18s ease,top 0.18s ease,left 0.18s ease,box-shadow 0.18s ease;
        ">${innerDot}</div>
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
  const icon = useMemo(() => createMarkerIcon(state), [state]);

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
