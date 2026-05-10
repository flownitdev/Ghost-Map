import { api, type ApiLocation } from "@/lib/apiClient";
import type { Location, LocationCategory, RiskLevel } from "@/types/location";
import { LOCATIONS as MOCK_LOCATIONS } from "./locations";

function apiToLocation(row: ApiLocation): Location {
  return {
    id: row.id,
    name: row.name,
    category: row.category as LocationCategory,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    abandonmentScore: row.abandonmentScore,
    riskLevel: row.riskLevel as RiskLevel,
    lastVisited: row.lastVisited ?? row.createdAt.slice(0, 7),
  };
}

export async function fetchLocations(): Promise<Location[]> {
  try {
    const data = await api.getLocations();
    if (!data || data.length === 0) {
      console.info("[GhostMap] No locations in DB — using mock data");
      return MOCK_LOCATIONS;
    }
    return data.map(apiToLocation);
  } catch (err) {
    console.warn("[GhostMap] API fetch failed — using mock data:", err);
    return MOCK_LOCATIONS;
  }
}

export async function addLocation(payload: Omit<Location, "id">): Promise<Location> {
  const data = await api.addLocation({
    name: payload.name,
    category: payload.category,
    latitude: payload.latitude,
    longitude: payload.longitude,
    description: payload.description,
    abandonmentScore: payload.abandonmentScore,
    riskLevel: payload.riskLevel,
    lastVisited: payload.lastVisited ?? null,
    submittedBy: null,
  });
  return apiToLocation(data);
}

export async function fetchUserLocations(userId: string): Promise<{
  saved: Location[];
  explored: Location[];
  submitted: Location[];
}> {
  try {
    const data = await api.getUserLocations(userId);
    return {
      saved: data.saved.map(apiToLocation),
      explored: data.explored.map(apiToLocation),
      submitted: data.submitted.map(apiToLocation),
    };
  } catch {
    return { saved: [], explored: [], submitted: [] };
  }
}

export function getLocations(): Location[] {
  return MOCK_LOCATIONS;
}

export function getLocationsByCategory(category: LocationCategory): Location[] {
  return MOCK_LOCATIONS.filter((loc) => loc.category === category);
}

export function getLocationsByRisk(riskLevel: RiskLevel): Location[] {
  return MOCK_LOCATIONS.filter((loc) => loc.riskLevel === riskLevel);
}
