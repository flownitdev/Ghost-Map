export type RiskLevel = "low" | "medium" | "high" | "extreme";

export type LocationCategory =
  | "factory"
  | "hospital"
  | "mall"
  | "school"
  | "tunnel"
  | "industrial";

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
  createdAt?: string;      // ISO string — used for "Freshly Abandoned" badge
  submittedBy?: string;    // user id of submitter
}
