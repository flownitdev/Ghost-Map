import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { RiskLevel, LocationCategory } from "@/types/location";

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

export const RISK_COLORS: Record<RiskLevel, { border: string; color: string; bg: string; label: string }> = {
  extreme: {
    border: "#f43f5e",
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.12)",
    label: "Extreme",
  },
  high: {
    border: "#A855F7",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.1)",
    label: "High",
  },
  medium: {
    border: "#f59e0b",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    label: "Medium",
  },
  low: {
    border: "#2a6e4f",
    color: "#4ade80",
    bg: "rgba(42,110,79,0.2)",
    label: "Low",
  },
};

export const RISK_ORDER: RiskLevel[] = ["low", "medium", "high", "extreme"];

export interface CategoryMeta {
  label: string;
  color: string;
  glowColor: string;
  emoji: string;
}

export const CATEGORY_META: Record<LocationCategory, CategoryMeta> = {
  factory: {
    label: "Factory",
    color: "#f59e0b",
    glowColor: "rgba(245,158,11,0.45)",
    emoji: "🏭",
  },
  hospital: {
    label: "Hospital",
    color: "#60a5fa",
    glowColor: "rgba(96,165,250,0.45)",
    emoji: "🏥",
  },
  mall: {
    label: "Mall",
    color: "#c084fc",
    glowColor: "rgba(192,132,252,0.45)",
    emoji: "🏛",
  },
  school: {
    label: "School",
    color: "#4ade80",
    glowColor: "rgba(74,222,128,0.45)",
    emoji: "🏫",
  },
  tunnel: {
    label: "Tunnel",
    color: "#94a3b8",
    glowColor: "rgba(148,163,184,0.45)",
    emoji: "🚇",
  },
  industrial: {
    label: "Industrial",
    color: "#f87171",
    glowColor: "rgba(248,113,113,0.45)",
    emoji: "⚙️",
  },
};

// How many days old a location must be to NOT be "fresh"
export const FRESH_DAYS_THRESHOLD = 30;

export function isFreshLocation(createdAt?: string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= FRESH_DAYS_THRESHOLD;
}

// Haversine distance in km
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
  });
}
