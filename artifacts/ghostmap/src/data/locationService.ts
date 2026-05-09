import { supabase } from "@/lib/supabaseClient";
import type { Location, LocationCategory, RiskLevel } from "@/types/location";
import { LOCATIONS as MOCK_LOCATIONS } from "./locations";

function rowToLocation(row: {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string;
  abandonment_score: number;
  risk_level: string;
  last_visited: string | null;
  created_at: string;
}): Location {
  return {
    id: row.id as unknown as number,
    name: row.name,
    category: row.category as LocationCategory,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    abandonmentScore: row.abandonment_score,
    riskLevel: row.risk_level as RiskLevel,
    lastVisited: row.last_visited ?? row.created_at.slice(0, 7),
  };
}

export async function fetchLocations(): Promise<Location[]> {
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      console.info("[GhostMap] No locations in DB — using mock data");
      return MOCK_LOCATIONS;
    }

    return data.map(rowToLocation);
  } catch (err) {
    console.warn("[GhostMap] Supabase fetch failed — using mock data:", err);
    return MOCK_LOCATIONS;
  }
}

export async function addLocation(
  payload: Omit<Location, "id">
): Promise<Location> {
  const { data, error } = await supabase
    .from("locations")
    .insert({
      name: payload.name,
      category: payload.category,
      latitude: payload.latitude,
      longitude: payload.longitude,
      description: payload.description,
      abandonment_score: payload.abandonmentScore,
      risk_level: payload.riskLevel,
      last_visited: payload.lastVisited ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToLocation(data);
}

export function getLocations(): Location[] {
  return MOCK_LOCATIONS;
}

export function getLocationById(id: number): Location | undefined {
  return MOCK_LOCATIONS.find((loc) => loc.id === id);
}

export function getLocationsByCategory(category: LocationCategory): Location[] {
  return MOCK_LOCATIONS.filter((loc) => loc.category === category);
}

export function getLocationsByRisk(riskLevel: RiskLevel): Location[] {
  return MOCK_LOCATIONS.filter((loc) => loc.riskLevel === riskLevel);
}
