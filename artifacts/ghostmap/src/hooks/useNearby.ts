import { useMemo } from "react";
import type { Location } from "@/types/location";
import { haversineKm } from "@/lib/mapUtils";

export interface NearbyLocation extends Location {
  distanceKm: number;
}

export function useNearby(
  anchor: Location | null,
  allLocations: Location[],
  maxCount = 4,
  maxKm = 12
): NearbyLocation[] {
  return useMemo(() => {
    if (!anchor) return [];
    return allLocations
      .filter((l) => String(l.id) !== String(anchor.id))
      .map((l) => ({
        ...l,
        distanceKm: haversineKm(anchor.latitude, anchor.longitude, l.latitude, l.longitude),
      }))
      .filter((l) => l.distanceKm <= maxKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, maxCount);
  }, [anchor?.id, allLocations, maxCount, maxKm]);
}
