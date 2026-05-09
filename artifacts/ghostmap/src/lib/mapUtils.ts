import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { RiskLevel } from "@/types/location";

export const MAP_CENTER: [number, number] = [48.8566, 2.3522];
export const MAP_DEFAULT_ZOOM = 12;

export const TILE_LAYERS = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
} as const;

export type TileLayerKey = keyof typeof TILE_LAYERS;

export const RISK_COLORS: Record<RiskLevel, { border: string; color: string; bg: string }> = {
  HIGH: {
    border: "#FA4817",
    color: "#FA4817",
    bg: "rgba(250,72,23,0.1)",
  },
  MEDIUM: {
    border: "#354362",
    color: "#92a5d1",
    bg: "rgba(53,67,98,0.3)",
  },
  LOW: {
    border: "#2a6e4f",
    color: "#4ade80",
    bg: "rgba(42,110,79,0.2)",
  },
};

export function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
  });
}

export function createGlowingMarker(): L.DivIcon {
  return L.divIcon({
    className: "bg-transparent border-none",
    html: `<div style="width:12px;height:12px;background:#FA4817;border-radius:50%;box-shadow:0 0 10px 2px #FA4817,0 0 20px 5px rgba(250,72,23,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}
