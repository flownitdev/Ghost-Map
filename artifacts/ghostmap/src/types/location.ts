export type RiskLevel = "low" | "medium" | "high";

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
}
