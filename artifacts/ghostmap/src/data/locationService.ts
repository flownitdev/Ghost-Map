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

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function rowToLocation(row: Record<string, unknown>): Location {
  return {
    id: row.id as string | number,
    name: row.name as string,
    category: row.category as LocationCategory,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    description: row.description as string,
    abandonmentScore: (row.abandonmentScore ?? row.abandonment_score) as number,
    riskLevel: (row.riskLevel ?? row.risk_level) as RiskLevel,
    lastVisited: ((row.lastVisited ?? row.last_visited) as string | null) ?? ((row.createdAt ?? row.created_at) as string)?.slice(0, 7),
    createdAt: (row.createdAt ?? row.created_at) as string,
    submittedBy: ((row.submittedBy ?? row.submitted_by) as string | null) ?? undefined,
    closureDate: ((row.closureDate ?? row.closure_date) as string | null) ?? undefined,
    buildingStatus: ((row.buildingStatus ?? row.building_status) as BuildingStatus | null) ?? undefined,
    demolitionStatus: ((row.demolitionStatus ?? row.demolition_status) as DemolitionStatus | null) ?? undefined,
    verificationState: ((row.verificationState ?? row.verification_state) as VerificationState | null) ?? "unverified",
    sourceType: ((row.sourceType ?? row.source_type) as SourceType | null) ?? "user_submission",
    sourceAttribution: ((row.sourceAttribution ?? row.source_attribution) as string | null) ?? undefined,
  };
}

export async function fetchLocations(): Promise<Location[]> {
  try {
    const resp = await fetch(`${BASE_URL}/api/locations`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json() as Record<string, unknown>[];
    if (!data || data.length === 0) {
      console.info("[GhostMap] No locations in DB — using mock data");
      return MOCK_LOCATIONS;
    }
    return data.map(rowToLocation);
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
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json() as Record<string, unknown>;
  return rowToLocation(data);
}

export async function bulkAddLocations(payloads: Omit<Location, "id">[]): Promise<number> {
  let count = 0;
  for (const p of payloads) {
    try {
      await addLocation(p);
      count++;
    } catch {
      // continue on error
    }
  }
  return count;
}

export async function updateVerificationState(
  locationId: number | string,
  state: VerificationState
): Promise<void> {
  const resp = await fetch(`${BASE_URL}/api/locations/${locationId}/verification`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verificationState: state }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
}

export async function deleteLocation(locationId: number | string): Promise<void> {
  const resp = await fetch(`${BASE_URL}/api/locations/${locationId}`, {
    method: "DELETE",
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
}

export async function fetchUserLocations(userId: string): Promise<{
  saved: Location[];
  explored: Location[];
  submitted: Location[];
}> {
  const resp = await fetch(`${BASE_URL}/api/users/${userId}/locations`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json() as { saved: Record<string, unknown>[]; explored: Record<string, unknown>[]; submitted: Record<string, unknown>[] };
  return {
    saved: data.saved.map(rowToLocation),
    explored: data.explored.map(rowToLocation),
    submitted: data.submitted.map(rowToLocation),
  };
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
  const nearbyDuplicates = nearbyLocations(
    payload.latitude, payload.longitude, allLocations, 0.35
  );

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
    `${BASE_URL}/api/admin/osm?south=${south}&west=${west}&north=${north}&east=${east}`
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
