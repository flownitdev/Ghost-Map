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

// ─── Row mapper ──────────────────────────────────────────────────────────────

function rowToLocation(row: Record<string, unknown>): Location {
  return {
    id: row.id as string | number,
    name: row.name as string,
    category: row.category as LocationCategory,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    description: row.description as string,
    abandonmentScore: row.abandonment_score as number,
    riskLevel: row.risk_level as RiskLevel,
    lastVisited: (row.last_visited as string | null) ?? (row.created_at as string).slice(0, 7),
    createdAt: row.created_at as string,
    submittedBy: (row.submitted_by as string | null) ?? undefined,
    closureDate: (row.closure_date as string | null) ?? undefined,
    buildingStatus: (row.building_status as BuildingStatus | null) ?? undefined,
    demolitionStatus: (row.demolition_status as DemolitionStatus | null) ?? undefined,
    verificationState: (row.verification_state as VerificationState | null) ?? "unverified",
    sourceType: (row.source_type as SourceType | null) ?? "user_submission",
    sourceAttribution: (row.source_attribution as string | null) ?? undefined,
  };
}

function rowToSubmission(row: Record<string, unknown>): Submission {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as LocationCategory,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    description: row.description as string,
    riskLevel: row.risk_level as RiskLevel,
    abandonmentScore: row.abandonment_score as number,
    closureDate: (row.closure_date as string | null) ?? undefined,
    buildingStatus: (row.building_status as BuildingStatus | null) ?? undefined,
    demolitionStatus: (row.demolition_status as DemolitionStatus | null) ?? undefined,
    sourceType: (row.source_type as SourceType | null) ?? "user_submission",
    sourceAttribution: (row.source_attribution as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    submittedBy: (row.submitted_by as string | null) ?? undefined,
    submittedAt: row.submitted_at as string,
    status: row.status as "pending" | "approved" | "rejected",
    reviewedBy: (row.reviewed_by as string | null) ?? undefined,
    reviewedAt: (row.reviewed_at as string | null) ?? undefined,
    reviewNote: (row.review_note as string | null) ?? undefined,
    duplicateOf: (row.duplicate_of as number | null) ?? undefined,
  };
}

// ─── Locations ───────────────────────────────────────────────────────────────

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
  const { data, error } = await (supabase as any)
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
      closure_date: payload.closureDate ?? null,
      building_status: payload.buildingStatus ?? "unknown",
      demolition_status: payload.demolitionStatus ?? "none",
      verification_state: payload.verificationState ?? "unverified",
      source_type: payload.sourceType ?? "user_submission",
      source_attribution: payload.sourceAttribution ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToLocation(data);
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
    closure_date: p.closureDate ?? null,
    building_status: p.buildingStatus ?? "unknown",
    demolition_status: p.demolitionStatus ?? "none",
    verification_state: p.verificationState ?? "unverified",
    source_type: p.sourceType ?? "osm",
    source_attribution: p.sourceAttribution ?? null,
  }));

  const { data, error } = await (supabase as any).from("locations").insert(rows).select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function updateVerificationState(
  locationId: number | string,
  state: VerificationState
): Promise<void> {
  const { error } = await (supabase as any)
    .from("locations")
    .update({ verification_state: state })
    .eq("id", locationId);
  if (error) throw error;
}

export async function deleteLocation(locationId: number | string): Promise<void> {
  const { error } = await supabase
    .from("locations")
    .delete()
    .eq("id", locationId);
  if (error) throw error;
}

export async function fetchUserLocations(userId: string): Promise<{
  saved: Location[];
  explored: Location[];
  submitted: Location[];
}> {
  const [savedRes, exploredRes, submittedRes] = await Promise.all([
    supabase.from("saved_locations").select("location_id, locations(*)").eq("user_id", userId),
    supabase.from("explored_locations").select("location_id, locations(*)").eq("user_id", userId),
    supabase.from("locations").select("*").eq("submitted_by", userId).order("created_at", { ascending: false }),
  ]);

  const toLoc = (row: unknown) => rowToLocation(row as Record<string, unknown>);

  const saved = ((savedRes.data ?? []) as Record<string, unknown>[])
    .map((r) => r.locations).filter(Boolean).map(toLoc);
  const explored = ((exploredRes.data ?? []) as Record<string, unknown>[])
    .map((r) => r.locations).filter(Boolean).map(toLoc);
  const submitted = ((submittedRes.data ?? []) as Record<string, unknown>[]).map(toLoc);

  return { saved, explored, submitted };
}

// ─── Submissions ─────────────────────────────────────────────────────────────

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
  const nearbyDuplicates = nearbyLocations(
    payload.latitude, payload.longitude, allLocations, 0.35
  );

  const { data, error } = await (supabase as any)
    .from("submissions")
    .insert({
      name: payload.name,
      category: payload.category,
      latitude: payload.latitude,
      longitude: payload.longitude,
      description: payload.description,
      risk_level: payload.riskLevel,
      abandonment_score: payload.abandonmentScore,
      closure_date: payload.closureDate ?? null,
      building_status: payload.buildingStatus ?? "unknown",
      demolition_status: payload.demolitionStatus ?? "none",
      source_type: payload.sourceType ?? "user_submission",
      source_attribution: payload.sourceAttribution ?? null,
      notes: payload.notes ?? null,
      submitted_by: payload.submittedBy ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return { submission: rowToSubmission(data), nearbyDuplicates };
}

export async function fetchSubmissions(
  status?: "pending" | "approved" | "rejected"
): Promise<Submission[]> {
  let q = supabase
    .from("submissions")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => rowToSubmission(r as Record<string, unknown>));
}

export async function approveSubmission(
  submissionId: string,
  reviewedBy: string
): Promise<Location> {
  const { data: sub, error: fetchErr } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .single();
  if (fetchErr) throw fetchErr;

  const s = rowToSubmission(sub as Record<string, unknown>);
  const location = await addLocation({
    name: s.name,
    category: s.category,
    latitude: s.latitude,
    longitude: s.longitude,
    description: s.description,
    riskLevel: s.riskLevel,
    abandonmentScore: s.abandonmentScore,
    lastVisited: new Date().toISOString().slice(0, 7),
    closureDate: s.closureDate,
    buildingStatus: s.buildingStatus,
    demolitionStatus: s.demolitionStatus,
    verificationState: "unverified",
    sourceType: s.sourceType,
    sourceAttribution: s.sourceAttribution,
    submittedBy: s.submittedBy,
  });

  const { error: updateErr } = await (supabase as any)
    .from("submissions")
    .update({
      status: "approved",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);
  if (updateErr) throw updateErr;

  return location;
}

export async function rejectSubmission(
  submissionId: string,
  reviewedBy: string,
  reviewNote: string
): Promise<void> {
  const { error } = await (supabase as any)
    .from("submissions")
    .update({
      status: "rejected",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote,
    })
    .eq("id", submissionId);
  if (error) throw error;
}

// ─── OSM ingestion ───────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

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
    `${BASE_URL}/api/admin/osm?south=${south}&west=${west}&north=${north}&east=${east}`
  );
  if (!resp.ok) throw new Error(await resp.text());
  const json = await resp.json() as { locations: OSMCandidate[] };
  return json.locations;
}

// ─── Sync helpers ─────────────────────────────────────────────────────────────

export function getLocations(): Location[] {
  return MOCK_LOCATIONS;
}

export function getLocationsByCategory(category: LocationCategory): Location[] {
  return MOCK_LOCATIONS.filter((loc) => loc.category === category);
}
