import { useMemo } from "react";
import {
  calcDangerScore,
  calcPoints,
  getRankForPoints,
  ADMIN_EMAILS,
  ADMIN_RANK,
  type UserStats,
} from "@/types/rank";
import type { Location } from "@/types/location";

interface UseRankInput {
  user: { email?: string | null } | null;
  exploredLocations: Location[];
  savedIds: Set<string>;
  submittedLocations: Location[];
}

export function useRank({
  user,
  exploredLocations,
  savedIds,
  submittedLocations,
}: UseRankInput): UserStats {
  return useMemo(() => {
    const isAdmin = !!(user?.email && ADMIN_EMAILS.includes(user.email));

    const exploredCount = exploredLocations.length;
    const savedCount = savedIds.size;
    const submittedCount = submittedLocations.length;
    const dangerScore = calcDangerScore(exploredLocations);
    const totalPoints = calcPoints({
      exploredCount,
      savedCount,
      submittedCount,
      dangerScore,
    });

    const rank = isAdmin ? ADMIN_RANK : getRankForPoints(totalPoints);

    return {
      exploredCount,
      savedCount,
      submittedCount,
      dangerScore,
      totalPoints,
      rank,
      isAdmin,
    };
  }, [user, exploredLocations, savedIds, submittedLocations]);
}
