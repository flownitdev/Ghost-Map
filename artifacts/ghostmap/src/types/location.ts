export type RiskLevel = "low" | "medium" | "high" | "extreme";

export type LocationCategory =
  | "factory"
  | "hospital"
  | "mall"
  | "school"
  | "tunnel"
  | "industrial";

export type VerificationState = "unverified" | "community_verified" | "demolished" | "active_again" | "potentially_abandoned";
export type BuildingStatus = "standing" | "partial" | "demolished" | "unknown";
export type DemolitionStatus = "none" | "scheduled" | "in_progress" | "demolished";
export type SourceType = "user_submission" | "public_dataset" | "business_closure" | "osm";

export interface Location {
  id: string | number;
  name: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  description: string;
  riskLevel: RiskLevel;
  abandonmentScore: number;
  lastVisited: string;
  createdAt?: string;
  submittedBy?: string;
  closureDate?: string;
  buildingStatus?: BuildingStatus;
  demolitionStatus?: DemolitionStatus;
  verificationState?: VerificationState;
  sourceType?: SourceType;
  sourceAttribution?: string;
}

export interface Submission {
  id: string;
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
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  duplicateOf?: number;
}
