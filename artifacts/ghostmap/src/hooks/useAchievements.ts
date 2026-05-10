import { useState, useEffect, useRef } from "react";
import type { Location } from "@/types/location";
import type { Achievement } from "@/types/exploration";
import { ACHIEVEMENT_DEFS } from "@/types/exploration";

export interface AchievementInput {
  exploredLocations: Location[];
  hasLog: boolean;
  hasGPSVisit: boolean;
  hasTrail: boolean;
  rankTier: string;
}

function computeUnlocked(input: AchievementInput): Set<string> {
  const ids = new Set<string>();
  const { exploredLocations, hasLog, hasGPSVisit, hasTrail, rankTier } = input;
  const count       = exploredLocations.length;
  const extremeCount = exploredLocations.filter((l) => l.riskLevel === "extreme").length;
  const highCount    = exploredLocations.filter((l) => l.riskLevel === "high" || l.riskLevel === "extreme").length;

  if (count >= 1)                                                ids.add("first_ghost");
  if (count >= 5)                                                ids.add("urban_five");
  if (count >= 10)                                               ids.add("decade_explorer");
  if (count >= 100)                                              ids.add("century");
  if (highCount >= 1)                                            ids.add("risk_taker");
  if (extremeCount >= 1)                                         ids.add("extreme_seeker");
  if (extremeCount >= 5)                                         ids.add("five_extreme");
  if (hasLog)                                                    ids.add("photo_journalist");
  if (hasGPSVisit)                                               ids.add("gps_pioneer");
  if (hasTrail)                                                  ids.add("trail_blazer");
  if (["Ghost","Specter","Phantom","Admin"].includes(rankTier))  ids.add("ghost_rank");
  if (["Phantom","Admin"].includes(rankTier))                    ids.add("phantom_rank");
  return ids;
}

const STORAGE_KEY = "gm-achievements";

export interface UseAchievementsReturn {
  achievements: Achievement[];
  newlyUnlocked: Achievement[];
  dismissNew: () => void;
}

export function useAchievements(input: AchievementInput): UseAchievementsReturn {
  const [achievements,   setAchievements]   = useState<Achievement[]>([]);
  const [newlyUnlocked,  setNewlyUnlocked]  = useState<Achievement[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    try {
      const stored     = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, string>;
      const unlocked   = computeUnlocked(input);
      const now        = new Date().toISOString();
      const newIds     = [...unlocked].filter((id) => !stored[id]);

      if (newIds.length > 0) {
        const updated = { ...stored };
        newIds.forEach((id) => { updated[id] = now; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        if (initializedRef.current) {
          const newAchs = newIds
            .map((id) => ACHIEVEMENT_DEFS.find((d) => d.id === id))
            .filter(Boolean)
            .map((def) => ({ ...def!, unlockedAt: now }));
          if (newAchs.length > 0) setNewlyUnlocked(newAchs);
        }
      }

      initializedRef.current = true;

      const allStored = { ...stored };
      newIds.forEach((id) => { allStored[id] = now; });
      setAchievements(
        ACHIEVEMENT_DEFS.map((def) => ({ ...def, unlockedAt: allStored[def.id] as string | undefined }))
      );
    } catch {
      // ignore storage errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    input.exploredLocations.length,
    input.hasLog,
    input.hasGPSVisit,
    input.hasTrail,
    input.rankTier,
  ]);

  const dismissNew = () => setNewlyUnlocked([]);
  return { achievements, newlyUnlocked, dismissNew };
}
