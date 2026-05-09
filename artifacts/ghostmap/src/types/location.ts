export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export type LocationCategory =
  | "Hospital"
  | "Industrial"
  | "Theater"
  | "Transport"
  | "Residential"
  | "Military"
  | "Education"
  | "Religious";

export interface Location {
  id: number;
  name: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  description: string;
  risk: RiskLevel;
  lastVisited: string;
}
