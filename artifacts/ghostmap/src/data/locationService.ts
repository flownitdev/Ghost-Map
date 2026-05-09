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

export function getLocationsByRisk(risk: RiskLevel): Location[] {
  return LOCATIONS.filter((loc) => loc.risk === risk);
}

export function getCategories(): LocationCategory[] {
  return [...new Set(LOCATIONS.map((loc) => loc.category))];
}
