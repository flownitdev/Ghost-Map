export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface Location {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  risk: RiskLevel;
  lastVisited: string;
}
