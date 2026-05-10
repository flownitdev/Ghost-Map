export type RankTier =
  | "Scout"
  | "Explorer"
  | "Veteran"
  | "Ghost"
  | "Specter"
  | "Phantom"
  | "Admin";

export interface RankDefinition {
  tier: RankTier;
  label: string;
  minPoints: number;
  color: string;
  glowColor: string;
  emoji: string;
  unlockedRiskLevels: string[]; // which riskLevels this rank can view
  description: string;
}

export const RANKS: RankDefinition[] = [
  {
    tier: "Scout",
    label: "Scout",
    minPoints: 0,
    color: "#6b7280",
    glowColor: "rgba(107,114,128,0.4)",
    emoji: "🔍",
    unlockedRiskLevels: ["low", "medium"],
    description: "Just starting out. Stick to safer spots.",
  },
  {
    tier: "Explorer",
    label: "Explorer",
    minPoints: 15,
    color: "#4ade80",
    glowColor: "rgba(74,222,128,0.4)",
    emoji: "🧭",
    unlockedRiskLevels: ["low", "medium", "high"],
    description: "Proven your worth in the field.",
  },
  {
    tier: "Veteran",
    label: "Veteran",
    minPoints: 50,
    color: "#60a5fa",
    glowColor: "rgba(96,165,250,0.4)",
    emoji: "🏴",
    unlockedRiskLevels: ["low", "medium", "high"],
    description: "Seasoned urbexer with serious credentials.",
  },
  {
    tier: "Ghost",
    label: "Ghost",
    minPoints: 120,
    color: "#c084fc",
    glowColor: "rgba(192,132,252,0.4)",
    emoji: "👻",
    unlockedRiskLevels: ["low", "medium", "high", "extreme"],
    description: "You disappear into the ruins without a trace.",
  },
  {
    tier: "Specter",
    label: "Specter",
    minPoints: 260,
    color: "#A855F7",
    glowColor: "rgba(168,85,247,0.4)",
    emoji: "🌑",
    unlockedRiskLevels: ["low", "medium", "high", "extreme"],
    description: "Elite. The ruins know your name.",
  },
  {
    tier: "Phantom",
    label: "Phantom",
    minPoints: 500,
    color: "#f43f5e",
    glowColor: "rgba(244,63,94,0.4)",
    emoji: "💀",
    unlockedRiskLevels: ["low", "medium", "high", "extreme"],
    description: "Legendary. You exist between worlds.",
  },
];

export const ADMIN_RANK: RankDefinition = {
  tier: "Admin",
  label: "Admin",
  minPoints: 0,
  color: "#f59e0b",
  glowColor: "rgba(245,158,11,0.4)",
  emoji: "⚡",
  unlockedRiskLevels: ["low", "medium", "high", "extreme"],
  description: "GhostMap administrator. Manages the network.",
};

// Admin emails — change to real admin email(s) as needed
export const ADMIN_EMAILS: string[] = [
  "flownityt@gmail.com",
];

export interface UserStats {
  exploredCount: number;
  savedCount: number;
  submittedCount: number;
  dangerScore: number;  // weighted sum
  totalPoints: number;
  rank: RankDefinition;
  isAdmin: boolean;
}

export function calcDangerScore(
  exploredLocations: { riskLevel: string }[]
): number {
  const weights: Record<string, number> = {
    extreme: 10,
    high: 5,
    medium: 2,
    low: 1,
  };
  return exploredLocations.reduce(
    (sum, loc) => sum + (weights[loc.riskLevel] ?? 1),
    0
  );
}

export function calcPoints(stats: {
  exploredCount: number;
  savedCount: number;
  submittedCount: number;
  dangerScore: number;
}): number {
  return (
    stats.exploredCount * 5 +
    stats.submittedCount * 8 +
    Math.floor(stats.savedCount * 0.5) +
    stats.dangerScore
  );
}

export function getRankForPoints(points: number): RankDefinition {
  const sorted = [...RANKS].sort((a, b) => b.minPoints - a.minPoints);
  return sorted.find((r) => points >= r.minPoints) ?? RANKS[0];
}
