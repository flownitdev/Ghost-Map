import { useState, useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import type { Location } from "@/types/location";
import { CATEGORY_META, RISK_COLORS, isFreshLocation } from "@/lib/mapUtils";

type MarkerState = "resting" | "hovered" | "selected";

function createMarkerIcon(location: Location, state: MarkerState, isFresh: boolean): L.DivIcon {
  const catMeta = CATEGORY_META[location.category];
  const riskStyle = RISK_COLORS[location.riskLevel];
  const isExtreme = location.riskLevel === "extreme";

  const color = isExtreme ? riskStyle.color : catMeta.color;
  const glowColor = isExtreme ? "rgba(244,63,94,0.35)" : catMeta.glowColor.replace("0.45", "0.28");

  const isSelected = state === "selected";
  const isHovered = state === "hovered";

  // Larger, more cinematic dots
  const dotSize = isSelected ? 18 : isHovered ? 14 : isExtreme ? 12 : 10;
  const container = 44;
  const dotOffset = (container - dotSize) / 2;

  // Softer, more cinematic glow
  const glow = isSelected
    ? `0 0 0 2.5px ${color}22, 0 0 12px 4px ${color}cc, 0 0 28px 10px ${glowColor}`
    : isHovered
    ? `0 0 8px 3px ${color}99, 0 0 18px 6px ${glowColor}`
    : `0 0 4px 1.5px ${color}88, 0 0 10px 3px ${glowColor}`;

  const innerDot =
    isSelected
      ? `<div style="position:absolute;width:5px;height:5px;background:rgba(255,255,255,0.95);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);box-shadow:0 0 4px rgba(255,255,255,0.6);"></div>`
      : isHovered
      ? `<div style="position:absolute;width:4px;height:4px;background:rgba(255,255,255,0.8);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);"></div>`
      : "";

  // Single smooth ripple for selected
  const ripple = isSelected
    ? `<div style="position:absolute;width:${dotSize + 16}px;height:${dotSize + 16}px;top:${(container - dotSize - 16) / 2}px;left:${(container - dotSize - 16) / 2}px;border-radius:50%;border:1px solid ${color}55;animation:ghost-ripple 2.2s ease-out infinite;"></div>
       <div style="position:absolute;width:${dotSize + 30}px;height:${dotSize + 30}px;top:${(container - dotSize - 30) / 2}px;left:${(container - dotSize - 30) / 2}px;border-radius:50%;border:1px solid ${color}22;animation:ghost-ripple 2.2s ease-out 0.6s infinite;"></div>`
    : "";

  // Extreme: single slow ring
  const extremeRing = isExtreme && !isSelected
    ? `<div style="position:absolute;width:${dotSize + 12}px;height:${dotSize + 12}px;top:${(container - dotSize - 12) / 2}px;left:${(container - dotSize - 12) / 2}px;border-radius:50%;border:1px solid ${color}44;animation:ghost-ripple 3s ease-out infinite;"></div>`
    : "";

  // Fresh indicator — clean white dot
  const freshBadge = isFresh && !isSelected
    ? `<div style="position:absolute;top:2px;right:2px;width:7px;height:7px;background:#fff;border-radius:50%;border:1.5px solid rgba(10,9,14,0.9);box-shadow:0 0 4px rgba(255,255,255,0.5);animation:fresh-pulse 2.5s ease-in-out infinite;"></div>`
    : "";

  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${container}px;height:${container}px;">
      ${ripple}
      ${extremeRing}
      <div style="position:absolute;top:${dotOffset}px;left:${dotOffset}px;width:${dotSize}px;height:${dotSize}px;background:${color};border-radius:50%;box-shadow:${glow};transition:all 0.22s cubic-bezier(0.25,0.46,0.45,0.94);">${innerDot}</div>
      ${freshBadge}
    </div>`,
    iconSize: [container, container],
    iconAnchor: [container / 2, container / 2],
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
  const fresh = useMemo(() => isFreshLocation(location.createdAt), [location.createdAt]);
  const icon = useMemo(() => createMarkerIcon(location, state, fresh), [location, state, fresh]);

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
