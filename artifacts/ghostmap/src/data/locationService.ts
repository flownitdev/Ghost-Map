import { nearbyLocations } from "@/lib/geo";
import { api } from "@/lib/apiClient";
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

export function rowToLocation(row: Record<string, unknown>): Location {
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
  try {
    const data = await api.getLocations();
    if (!data || data.length === 0) {
      return MOCK_LOCATIONS;
    }
    return data.map((row) => rowToLocation(row as unknown as Record<string, unknown>));
  } catch (err) {
    console.info("[GhostMap] Failed to fetch locations from API — using mock data", err);
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
    submittedBy: payload.submittedBy ?? null,
  });
  return rowToLocation(data as unknown as Record<string, unknown>);
}

export async function bulkAddLocations(payloads: Omit<Location, "id">[]): Promise<number> {
  let count = 0;
  for (const p of payloads) {
    await addLocation(p);
    count++;
  }
  return count;
}

export async function updateVerificationState(
  locationId: number | string,
  state: VerificationState
): Promise<void> {
  await fetch(`/api/locations/${locationId}/verification`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verificationState: state }),
  });
}

export async function deleteLocation(locationId: number | string): Promise<void> {
  const resp = await fetch(`/api/locations/${locationId}`, { method: "DELETE" });
  if (!resp.ok) throw new Error("Failed to delete location");
}

export async function fetchUserLocations(userId: string): Promise<{
  saved: Location[];
  explored: Location[];
  submitted: Location[];
}> {
  const data = await api.getUserLocations(userId);
  return {
    saved: data.saved.map((r) => rowToLocation(r as unknown as Record<string, unknown>)),
    explored: data.explored.map((r) => rowToLocation(r as unknown as Record<string, unknown>)),
    submitted: data.submitted.map((r) => rowToLocation(r as unknown as Record<string, unknown>)),
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
