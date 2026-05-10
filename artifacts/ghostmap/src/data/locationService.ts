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
  submitted_by?: string | null;
}): Location {
  return {
    id: row.id,
    name: row.name,
    category: row.category as LocationCategory,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    abandonmentScore: row.abandonment_score,
    riskLevel: row.risk_level as RiskLevel,
    lastVisited: row.last_visited ?? row.created_at.slice(0, 7),
    createdAt: row.created_at,
    submittedBy: row.submitted_by ?? undefined,
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

export async function addLocation(payload: Omit<Location, "id">): Promise<Location> {
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

export async function fetchUserLocations(userId: string): Promise<{
  saved: Location[];
  explored: Location[];
  submitted: Location[];
}> {
  const [savedRes, exploredRes, submittedRes] = await Promise.all([
    supabase
      .from("saved_locations")
      .select("location_id, locations(*)")
      .eq("user_id", userId),
    supabase
      .from("explored_locations")
      .select("location_id, locations(*)")
      .eq("user_id", userId),
    supabase
      .from("locations")
      .select("*")
      .eq("submitted_by", userId)
      .order("created_at", { ascending: false }),
  ]);

  const toLoc = (row: Record<string, unknown>) =>
    rowToLocation(row as Parameters<typeof rowToLocation>[0]);

  const saved = (savedRes.data ?? [])
    .map((r) => r.locations)
    .filter(Boolean)
    .map(toLoc);

  const explored = (exploredRes.data ?? [])
    .map((r) => r.locations)
    .filter(Boolean)
    .map(toLoc);

  const submitted = (submittedRes.data ?? []).map(toLoc);

  return { saved, explored, submitted };
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
