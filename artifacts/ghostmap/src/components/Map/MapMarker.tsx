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

  // Extreme locations use red; otherwise use category color
  const color = isExtreme ? riskStyle.color : catMeta.color;
  const glowColor = isExtreme ? "rgba(244,63,94,0.5)" : catMeta.glowColor;

  const isSelected = state === "selected";
  const isHovered = state === "hovered";

  const dotSize = isSelected ? 14 : isHovered ? 12 : isExtreme ? 10 : 9;
  const dotOffset = (34 - dotSize) / 2;

  const glow = isSelected
    ? `0 0 0 2px ${glowColor.replace("0.45", "0.2")}, 0 0 16px 6px ${color}, 0 0 32px 12px ${glowColor}`
    : isHovered
    ? `0 0 10px 4px ${color}, 0 0 22px 8px ${glowColor}`
    : `0 0 6px 2px ${color}cc, 0 0 14px 4px ${glowColor.replace("0.5", "0.35")}`;

  const innerDot =
    isSelected || isHovered
      ? `<div style="position:absolute;width:4px;height:4px;background:rgba(255,255,255,0.9);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);"></div>`
      : "";

  const ripple = isSelected
    ? `<div style="position:absolute;width:${dotSize + 14}px;height:${dotSize + 14}px;top:${(34 - dotSize - 14) / 2}px;left:${(34 - dotSize - 14) / 2}px;border-radius:50%;border:1.5px solid ${color}80;animation:ghost-ripple 1.8s ease-out infinite;"></div>
       <div style="position:absolute;width:${dotSize + 26}px;height:${dotSize + 26}px;top:${(34 - dotSize - 26) / 2}px;left:${(34 - dotSize - 26) / 2}px;border-radius:50%;border:1px solid ${color}33;animation:ghost-ripple 1.8s ease-out 0.5s infinite;"></div>`
    : "";

  // Extreme: pulsing ring even at rest
  const extremeRing = isExtreme && !isSelected
    ? `<div style="position:absolute;width:${dotSize + 10}px;height:${dotSize + 10}px;top:${(34 - dotSize - 10) / 2}px;left:${(34 - dotSize - 10) / 2}px;border-radius:50%;border:1.5px solid ${color}66;animation:ghost-ripple 2.4s ease-out infinite;"></div>`
    : "";

  // Fresh badge — small green star
  const freshBadge = isFresh && !isSelected
    ? `<div style="position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:#4ade80;border-radius:50%;border:1.5px solid rgba(12,11,17,0.9);box-shadow:0 0 6px #4ade8099;animation:fresh-pulse 2s ease-in-out infinite;"></div>`
    : "";

  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:34px;height:34px;">
      ${ripple}
      ${extremeRing}
      <div style="position:absolute;top:${dotOffset}px;left:${dotOffset}px;width:${dotSize}px;height:${dotSize}px;background:${color};border-radius:50%;box-shadow:${glow};transition:all 0.18s ease;">${innerDot}</div>
      ${freshBadge}
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
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
