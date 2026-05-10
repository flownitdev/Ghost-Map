import { api } from "@/lib/apiClient";
import type { Location, LocationCategory, RiskLevel } from "@/types/location";
import { LOCATIONS as MOCK_LOCATIONS } from "./locations";

function apiRowToLocation(row: {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string;
  abandonmentScore: number;
  riskLevel: string;
  lastVisited: string | null;
  createdAt: string;
  submittedBy?: string | null;
}): Location {
  return {
    id: String(row.id),
    name: row.name,
    category: row.category as LocationCategory,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    abandonmentScore: row.abandonmentScore,
    riskLevel: row.riskLevel as RiskLevel,
    lastVisited: row.lastVisited ?? row.createdAt.slice(0, 7),
    createdAt: row.createdAt,
    submittedBy: row.submittedBy ?? undefined,
  };
}

export async function fetchLocations(): Promise<Location[]> {
  try {
    const rows = await api.getLocations();
    if (!rows || rows.length === 0) {
      console.info("[GhostMap] No locations in DB — using mock data");
      return MOCK_LOCATIONS;
    }
    return rows.map(apiRowToLocation);
  } catch (err) {
    console.warn("[GhostMap] API fetch failed — using mock data:", err);
    return MOCK_LOCATIONS;
  }
}

export async function addLocation(payload: Omit<Location, "id">): Promise<Location> {
  const row = await api.addLocation({
    name: payload.name,
    category: payload.category,
    latitude: payload.latitude,
    longitude: payload.longitude,
    description: payload.description,
    abandonmentScore: payload.abandonmentScore,
    riskLevel: payload.riskLevel,
    lastVisited: payload.lastVisited ?? null,
    submittedBy: payload.submittedBy ?? null,
  });
  return apiRowToLocation(row);
}

export async function fetchUserLocations(userId: string): Promise<{
  saved: Location[];
  explored: Location[];
  submitted: Location[];
}> {
  const result = await api.getUserLocations(userId);
  return {
    saved: result.saved.map(apiRowToLocation),
    explored: result.explored.map(apiRowToLocation),
    submitted: result.submitted.map(apiRowToLocation),
  };
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
