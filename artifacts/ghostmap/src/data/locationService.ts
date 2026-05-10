import type { Location, LocationCategory, RiskLevel } from "@/types/location";
import { LOCATIONS as MOCK_LOCATIONS } from "./locations";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function rowToLocation(row: {
  id: number | string;
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
    const resp = await fetch(`${BASE_URL}/api/locations`);
    if (!resp.ok) throw new Error("Failed to fetch");
    const data = await resp.json() as unknown[];
    if (!Array.isArray(data) || data.length === 0) {
      console.info("[GhostMap] No locations in DB — using mock data");
      return MOCK_LOCATIONS;
    }
    return data.map((row) => rowToLocation(row as Parameters<typeof rowToLocation>[0]));
  } catch (err) {
    console.warn("[GhostMap] API fetch failed — using mock data:", err);
    return MOCK_LOCATIONS;
  }
}

export async function addLocation(payload: Omit<Location, "id">): Promise<Location> {
  const resp = await fetch(`${BASE_URL}/api/locations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      category: payload.category,
      latitude: payload.latitude,
      longitude: payload.longitude,
      description: payload.description,
      abandonmentScore: payload.abandonmentScore,
      riskLevel: payload.riskLevel,
      lastVisited: payload.lastVisited ?? null,
      submittedBy: payload.submittedBy ?? null,
    }),
  });
  if (!resp.ok) throw new Error("Failed to add location");
  const data = await resp.json() as Parameters<typeof rowToLocation>[0];
  return rowToLocation(data);
}

export async function fetchUserLocations(userId: string): Promise<{
  saved: Location[];
  explored: Location[];
  submitted: Location[];
}> {
  const resp = await fetch(`${BASE_URL}/api/users/${userId}/locations`);
  if (!resp.ok) throw new Error("Failed to fetch user locations");
  const data = await resp.json() as { saved: unknown[]; explored: unknown[]; submitted: unknown[] };
  return {
    saved: data.saved.map((r) => rowToLocation(r as Parameters<typeof rowToLocation>[0])),
    explored: data.explored.map((r) => rowToLocation(r as Parameters<typeof rowToLocation>[0])),
    submitted: data.submitted.map((r) => rowToLocation(r as Parameters<typeof rowToLocation>[0])),
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
