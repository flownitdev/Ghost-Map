import type { Location, LocationCategory, RiskLevel } from "@/types/location";
import { LOCATIONS } from "./locations";

export function getLocations(): Location[] {
  return LOCATIONS;
}

export function getLocationById(id: number): Location | undefined {
  return LOCATIONS.find((loc) => loc.id === id);
}

export function getLocationsByCategory(category: LocationCategory): Location[] {
  return LOCATIONS.filter((loc) => loc.category === category);
}

export function getLocationsByRisk(riskLevel: RiskLevel): Location[] {
  return LOCATIONS.filter((loc) => loc.riskLevel === riskLevel);
}

export function getCategories(): LocationCategory[] {
  return [...new Set(LOCATIONS.map((loc) => loc.category))];
}

export function searchLocations(query: string): Location[] {
  const q = query.toLowerCase().trim();
  if (!q) return LOCATIONS;
  return LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.category.toLowerCase().includes(q) ||
      loc.description.toLowerCase().includes(q)
  );
}
