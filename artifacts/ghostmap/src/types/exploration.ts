export type ExplorationRarity = "common" | "rare" | "epic" | "legendary";

export const RARITY_META: Record<ExplorationRarity, { label: string; color: string; glow: string }> = {
  common:    { label: "Common",    color: "#6b7280", glow: "rgba(107,114,128,0.3)" },
  rare:      { label: "Rare",      color: "#3b82f6", glow: "rgba(59,130,246,0.3)"  },
  epic:      { label: "Epic",      color: "#A855F7", glow: "rgba(168,85,247,0.3)"  },
  legendary: { label: "Legendary", color: "#f59e0b", glow: "rgba(245,158,11,0.3)"  },
};

export function getLocationRarity(riskLevel: string, abandonmentScore: number): ExplorationRarity {
  if (riskLevel === "extreme" || abandonmentScore >= 90) return "legendary";
  if (riskLevel === "high"    || abandonmentScore >= 75) return "epic";
  if (riskLevel === "medium"  || abandonmentScore >= 60) return "rare";
  return "common";
}

export interface ExplorationLog {
  id: string;
  locationId: string;
  userId: string;
  notes: string;
  visitedAt: string;
  photoUrl?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: ExplorationRarity;
  unlockedAt?: string;
}

export const ACHIEVEMENT_DEFS: Omit<Achievement, "unlockedAt">[] = [
  { id: "first_ghost",      name: "First Ghost",      description: "Explore your first abandoned location.",       icon: "👻", rarity: "common"    },
  { id: "urban_five",       name: "Urban Decay",       description: "Explore 5 locations.",                        icon: "🏚️", rarity: "common"    },
  { id: "decade_explorer",  name: "Decade Explorer",   description: "Explore 10 locations.",                       icon: "🧭", rarity: "rare"      },
  { id: "risk_taker",       name: "Risk Taker",        description: "Explore a high-risk location.",               icon: "⚠️", rarity: "rare"      },
  { id: "extreme_seeker",   name: "Extreme Seeker",    description: "Explore an extreme-risk location.",           icon: "💀", rarity: "epic"      },
  { id: "photo_journalist", name: "Photo Journalist",  description: "Add an exploration log with notes.",          icon: "📷", rarity: "rare"      },
  { id: "gps_pioneer",      name: "GPS Pioneer",       description: "Visit a location while GPS mode is active.",  icon: "📡", rarity: "rare"      },
  { id: "trail_blazer",     name: "Trail Blazer",      description: "Record your first GPS exploration trail.",    icon: "🔥", rarity: "epic"      },
  { id: "century",          name: "Century",           description: "Explore 100 locations.",                      icon: "💯", rarity: "legendary" },
  { id: "five_extreme",     name: "Danger Protocol",   description: "Explore 5 extreme-risk locations.",           icon: "☢️", rarity: "legendary" },
  { id: "ghost_rank",       name: "Urban Legend",      description: "Reach Ghost rank.",                           icon: "🌑", rarity: "epic"      },
  { id: "phantom_rank",     name: "Phantom Protocol",  description: "Reach Phantom rank.",                         icon: "👁️", rarity: "legendary" },
];
