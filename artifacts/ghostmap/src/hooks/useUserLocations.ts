import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

interface UseUserLocationsResult {
  savedIds: Set<number>;
  exploredIds: Set<number>;
  toggleSave: (locationId: number) => Promise<void>;
  toggleExplore: (locationId: number) => Promise<void>;
  loading: boolean;
}

export function useUserLocations(): UseUserLocationsResult {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [exploredIds, setExploredIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      setExploredIds(new Set());
      return;
    }

    setLoading(true);
    api.getUserLocationIds(user.id)
      .then(({ savedIds, exploredIds }) => {
        setSavedIds(new Set(savedIds));
        setExploredIds(new Set(exploredIds));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const toggleSave = useCallback(
    async (locationId: number) => {
      if (!user) return;
      if (savedIds.has(locationId)) {
        await api.unsaveLocation(user.id, locationId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(locationId);
          return next;
        });
      } else {
        await api.saveLocation(user.id, locationId);
        setSavedIds((prev) => new Set([...prev, locationId]));
      }
    },
    [user, savedIds]
  );

  const toggleExplore = useCallback(
    async (locationId: number) => {
      if (!user) return;
      if (exploredIds.has(locationId)) {
        await api.unmarkExplored(user.id, locationId);
        setExploredIds((prev) => {
          const next = new Set(prev);
          next.delete(locationId);
          return next;
        });
      } else {
        await api.markExplored(user.id, locationId);
        setExploredIds((prev) => new Set([...prev, locationId]));
      }
    },
    [user, exploredIds]
  );

  return { savedIds, exploredIds, toggleSave, toggleExplore, loading };
}
