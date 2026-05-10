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

export const RISK_COLORS: Record<RiskLevel, { border: string; color: string; bg: string }> = {
  high: {
    border: "#A855F7",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.1)",
  },
  medium: {
    border: "#2d1b5e",
    color: "#c084fc",
    bg: "rgba(45,27,94,0.3)",
  },
  low: {
    border: "#2a6e4f",
    color: "#4ade80",
    bg: "rgba(42,110,79,0.2)",
  },
};

export interface CategoryMeta {
  label: string;
  color: string;        // marker dot color
  glowColor: string;    // rgba glow
  emoji: string;
}

export const CATEGORY_META: Record<LocationCategory, CategoryMeta> = {
  factory: {
    label: "Factory",
    color: "#A855F7",
    glowColor: "rgba(168,85,247,0.45)",
    emoji: "🏭",
  },
  hospital: {
    label: "Hospital",
    color: "#A855F7",
    glowColor: "rgba(168,85,247,0.45)",
    emoji: "🏥",
  },
  mall: {
    label: "Mall",
    color: "#A855F7",
    glowColor: "rgba(168,85,247,0.45)",
    emoji: "🏛",
  },
  school: {
    label: "School",
    color: "#A855F7",
    glowColor: "rgba(168,85,247,0.45)",
    emoji: "🏫",
  },
  tunnel: {
    label: "Tunnel",
    color: "#A855F7",
    glowColor: "rgba(168,85,247,0.45)",
    emoji: "🚇",
  },
  industrial: {
    label: "Industrial",
    color: "#A855F7",
    glowColor: "rgba(168,85,247,0.45)",
    emoji: "⚙️",
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
