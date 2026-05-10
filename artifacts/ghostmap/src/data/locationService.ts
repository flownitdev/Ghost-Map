import { supabase } from "@/lib/supabaseClient";
import { nearbyLocations } from "@/lib/geo";
import type {
  Location,
  LocationCategory,
  RiskLevel,
  Submission,
  VerificationState,
  BuildingStatus,
  DemolitionStatus,
  SourceType,
} from "@/types/location";
import { LOCATIONS as MOCK_LOCATIONS } from "./locations";

function rowToLocation(row: Record<string, unknown>): Location {
  return {
    id: row.id as string | number,
    name: row.name as string,
    category: row.category as LocationCategory,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    description: row.description as string,
    abandonmentScore: (row.abandonment_score ?? row.abandonmentScore) as number,
    riskLevel: (row.risk_level ?? row.riskLevel) as RiskLevel,
    lastVisited: ((row.last_visited ?? row.lastVisited) as string | null) ?? ((row.created_at ?? row.createdAt) as string)?.slice(0, 7) ?? "",
    createdAt: (row.created_at ?? row.createdAt) as string | undefined,
    submittedBy: (row.submitted_by ?? row.submittedBy) as string | undefined,
    closureDate: (row.closure_date ?? row.closureDate) as string | undefined,
    buildingStatus: (row.building_status ?? row.buildingStatus) as BuildingStatus | undefined,
    demolitionStatus: (row.demolition_status ?? row.demolitionStatus) as DemolitionStatus | undefined,
    verificationState: ((row.verification_state ?? row.verificationState) as VerificationState | undefined) ?? "unverified",
    sourceType: ((row.source_type ?? row.sourceType) as SourceType | undefined) ?? "user_submission",
    sourceAttribution: (row.source_attribution ?? row.sourceAttribution) as string | undefined,
  };
}

export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) {
    console.info("[GhostMap] No locations in Supabase — using mock data", error?.message);
    return MOCK_LOCATIONS;
  }

  return (data as Record<string, unknown>[]).map(rowToLocation);
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
      submitted_by: payload.submittedBy ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToLocation(data as Record<string, unknown>);
}

export async function bulkAddLocations(payloads: Omit<Location, "id">[]): Promise<number> {
  const rows = payloads.map((p) => ({
    name: p.name,
    category: p.category,
    latitude: p.latitude,
    longitude: p.longitude,
    description: p.description,
    abandonment_score: p.abandonmentScore,
    risk_level: p.riskLevel,
    last_visited: p.lastVisited ?? null,
    submitted_by: p.submittedBy ?? null,
  }));

  const { data, error } = await supabase.from("locations").insert(rows).select();
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

export async function updateVerificationState(
  locationId: number | string,
  state: VerificationState
): Promise<void> {
  const { error } = await supabase
    .from("locations")
    .update({ verification_state: state })
    .eq("id", Number(locationId));
  if (error) throw new Error(error.message);
}

export async function deleteLocation(locationId: number | string): Promise<void> {
  const { error } = await supabase
    .from("locations")
    .delete()
    .eq("id", Number(locationId));
  if (error) throw new Error(error.message);
}

export async function fetchUserLocations(userId: string): Promise<{
  saved: Location[];
  explored: Location[];
  submitted: Location[];
}> {
  const [savedRes, exploredRes, submittedRes] = await Promise.all([
    supabase
      .from("saved_locations")
      .select("locations(*)")
      .eq("user_id", userId),
    supabase
      .from("explored_locations")
      .select("locations(*)")
      .eq("user_id", userId),
    supabase
      .from("locations")
      .select("*")
      .eq("submitted_by", userId),
  ]);

  const saved = (savedRes.data ?? [])
    .map((r) => (r as { locations: Record<string, unknown> }).locations)
    .filter(Boolean)
    .map(rowToLocation);

  const explored = (exploredRes.data ?? [])
    .map((r) => (r as { locations: Record<string, unknown> }).locations)
    .filter(Boolean)
    .map(rowToLocation);

  const submitted = ((submittedRes.data ?? []) as Record<string, unknown>[]).map(rowToLocation);

  return { saved, explored, submitted };
}

export interface SubmitPayload {
  name: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  description: string;
  riskLevel: RiskLevel;
  abandonmentScore: number;
  closureDate?: string;
  buildingStatus?: BuildingStatus;
  demolitionStatus?: DemolitionStatus;
  sourceType?: SourceType;
  sourceAttribution?: string;
  notes?: string;
  submittedBy?: string;
}

export async function submitLocation(
  payload: SubmitPayload
): Promise<{ submission: Submission; nearbyDuplicates: Location[] }> {
  const allLocations = await fetchLocations();
  const nearbyDuplicates = nearbyLocations(payload.latitude, payload.longitude, allLocations, 0.35);

  const submission: Submission = {
    id: crypto.randomUUID(),
    name: payload.name,
    category: payload.category,
    latitude: payload.latitude,
    longitude: payload.longitude,
    description: payload.description,
    riskLevel: payload.riskLevel,
    abandonmentScore: payload.abandonmentScore,
    closureDate: payload.closureDate,
    buildingStatus: payload.buildingStatus,
    demolitionStatus: payload.demolitionStatus,
    sourceType: payload.sourceType ?? "user_submission",
    sourceAttribution: payload.sourceAttribution,
    notes: payload.notes,
    submittedBy: payload.submittedBy,
    submittedAt: new Date().toISOString(),
    status: "pending",
  };

  try {
    await addLocation({
      name: payload.name,
      category: payload.category,
      latitude: payload.latitude,
      longitude: payload.longitude,
      description: payload.description,
      riskLevel: payload.riskLevel,
      abandonmentScore: payload.abandonmentScore,
      lastVisited: new Date().toISOString().slice(0, 7),
      submittedBy: payload.submittedBy,
    });
  } catch {
    // best-effort
  }

  return { submission, nearbyDuplicates };
}

export async function fetchSubmissions(
  _status?: "pending" | "approved" | "rejected"
): Promise<Submission[]> {
  return [];
}

export async function approveSubmission(
  _submissionId: string,
  _reviewedBy: string
): Promise<Location> {
  throw new Error("Not supported in this version");
}

export async function rejectSubmission(
  _submissionId: string,
  _reviewedBy: string,
  _reviewNote: string
): Promise<void> {
  throw new Error("Not supported in this version");
}

export interface OSMCandidate {
  osmId: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string;
  riskLevel: string;
  abandonmentScore: number;
  closureDate?: string;
  buildingStatus?: string;
  sourceType: string;
  sourceAttribution: string;
  verificationState: string;
}

export async function fetchOSMCandidates(
  south: number, west: number, north: number, east: number
): Promise<OSMCandidate[]> {
  const resp = await fetch(
    `/api/admin/osm?south=${south}&west=${west}&north=${north}&east=${east}`
  );
  if (!resp.ok) throw new Error(await resp.text());
  const json = await resp.json() as { locations: OSMCandidate[] };
  return json.locations;
}

export function getLocations(): Location[] {
  return MOCK_LOCATIONS;
}

export function getLocationsByCategory(category: LocationCategory): Location[] {
  return MOCK_LOCATIONS.filter((loc) => loc.category === category);
}
