import type { Location, RiskLevel } from "@/types/location";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function daysSince(dateStr: string): number {
  const d = new Date(dateStr).getTime();
  if (isNaN(d)) return Infinity;
  return (Date.now() - d) / (1000 * 60 * 60 * 24);
}

function parseClosureDays(closureDate: string | undefined): number | null {
  if (!closureDate) return null;
  const padded =
    closureDate.length === 4
      ? `${closureDate}-07-01`
      : closureDate.length === 7
      ? `${closureDate}-15`
      : closureDate;
  const days = daysSince(padded);
  return isFinite(days) ? days : null;
}

const RISK_FRESH_BONUS: Record<RiskLevel, number> = {
  low: 0, medium: 3, high: 7, extreme: 12,
};
const RISK_TREND_MULT: Record<RiskLevel, number> = {
  low: 1.0, medium: 1.15, high: 1.3, extreme: 1.5,
};

// ─── Core scores ───────────────────────────────────────────────────────────────

/** 0–100 composite freshness score for a location */
export function freshnessScore(loc: Location): number {
  let score = 0;

  // 1. Recency of map entry
  if (loc.createdAt) {
    const d = daysSince(loc.createdAt);
    if (d <= 2)        score += 40;
    else if (d <= 7)   score += 30;
    else if (d <= 14)  score += 22;
    else if (d <= 30)  score += 12;
    else if (d <= 90)  score += 4;
  }

  // 2. Recency of actual closure
  const closureDays = parseClosureDays(loc.closureDate);
  if (closureDays !== null) {
    if (closureDays <= 60)       score += 30;
    else if (closureDays <= 180) score += 22;
    else if (closureDays <= 365) score += 14;
    else if (closureDays <= 730) score += 7;
  }

  // 3. Abandonment depth (up to 12 pts)
  score += loc.abandonmentScore * 0.12;

  // 4. Risk bonus
  score += RISK_FRESH_BONUS[loc.riskLevel];

  // 5. State modifiers
  if (loc.verificationState === "active_again") score -= 30;
  if (loc.demolitionStatus === "scheduled")    score += 10;
  if (loc.demolitionStatus === "in_progress")  score += 5;
  if (loc.demolitionStatus === "demolished")   score -= 15;

  return Math.min(100, Math.max(0, score));
}

/** Trending = freshness amplified by risk severity and decay depth */
export function trendingScore(loc: Location): number {
  const f = freshnessScore(loc);
  const riskMult = RISK_TREND_MULT[loc.riskLevel];
  const decayMult = 1 + loc.abandonmentScore / 200;
  return Math.min(100, f * riskMult * decayMult);
}

// ─── Tier system ───────────────────────────────────────────────────────────────

export type FreshnessTier = "just_dropped" | "fresh" | "trending" | "cooling" | null;

export function freshnessTier(score: number): FreshnessTier {
  if (score >= 65) return "just_dropped";
  if (score >= 45) return "fresh";
  if (score >= 30) return "trending";
  if (score >= 15) return "cooling";
  return null;
}

export const FRESHNESS_META: Record<NonNullable<FreshnessTier>, {
  label: string;
  shortLabel: string;
  color: string;
  bg: string;
  border: string;
}> = {
  just_dropped: {
    label: "Just Dropped",
    shortLabel: "Just Dropped",
    color: "#FA4817",
    bg: "rgba(250,72,23,0.1)",
    border: "rgba(250,72,23,0.25)",
  },
  fresh: {
    label: "Freshly Abandoned",
    shortLabel: "Fresh",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
  },
  trending: {
    label: "Trending",
    shortLabel: "Trending",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.25)",
  },
  cooling: {
    label: "Going Cold",
    shortLabel: "Cooling",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.2)",
  },
};

// ─── Decay alerts ──────────────────────────────────────────────────────────────

/** Highly decayed location that was recently discovered or recently closed */
export function isDecayAlert(loc: Location): boolean {
  if (loc.abandonmentScore < 78) return false;
  if (loc.createdAt && daysSince(loc.createdAt) <= 14) return true;
  const closureDays = parseClosureDays(loc.closureDate);
  return closureDays !== null && closureDays <= 180;
}

// ─── Sort engine ───────────────────────────────────────────────────────────────

export type SortMode =
  | "freshest"
  | "newest_abandoned"
  | "most_dangerous"
  | "highest_decay"
  | "trending";

const RISK_NUM: Record<RiskLevel, number> = {
  low: 0, medium: 1, high: 2, extreme: 3,
};

export function sortLocations(locs: Location[], mode: SortMode): Location[] {
  const arr = [...locs];
  switch (mode) {
    case "freshest":
      return arr.sort((a, b) => freshnessScore(b) - freshnessScore(a));

    case "newest_abandoned":
      return arr.sort((a, b) => {
        const dA = parseClosureDays(a.closureDate) ?? daysSince(a.createdAt ?? "2000-01-01");
        const dB = parseClosureDays(b.closureDate) ?? daysSince(b.createdAt ?? "2000-01-01");
        return dA - dB;
      });

    case "most_dangerous":
      return arr.sort(
        (a, b) =>
          RISK_NUM[b.riskLevel] - RISK_NUM[a.riskLevel] ||
          b.abandonmentScore - a.abandonmentScore
      );

    case "highest_decay":
      return arr.sort((a, b) => b.abandonmentScore - a.abandonmentScore);

    case "trending":
      return arr.sort((a, b) => trendingScore(b) - trendingScore(a));

    default:
      return arr;
  }
}
