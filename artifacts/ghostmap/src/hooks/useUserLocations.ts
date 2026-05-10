import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface UseUserLocationsResult {
  savedIds: Set<string>;
  exploredIds: Set<string>;
  toggleSave: (locationId: string) => Promise<void>;
  toggleExplore: (locationId: string) => Promise<void>;
  loading: boolean;
}

export function useUserLocations(): UseUserLocationsResult {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [exploredIds, setExploredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      setExploredIds(new Set());
      return;
    }

    setLoading(true);
    fetch(`${BASE_URL}/api/users/${user.id}/saved-ids`)
      .then((r) => r.json())
      .then((data: { savedIds: number[]; exploredIds: number[] }) => {
        setSavedIds(new Set(data.savedIds.map(String)));
        setExploredIds(new Set(data.exploredIds.map(String)));
      })
      .catch(() => {
        setSavedIds(new Set());
        setExploredIds(new Set());
      })
      .finally(() => setLoading(false));
  }, [user]);

  const toggleSave = useCallback(
    async (locationId: string) => {
      if (!user) return;
      if (savedIds.has(locationId)) {
        await fetch(`${BASE_URL}/api/users/${user.id}/saved/${locationId}`, { method: "DELETE" });
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(locationId);
          return next;
        });
      } else {
        await fetch(`${BASE_URL}/api/users/${user.id}/saved`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locationId: Number(locationId) }),
        });
        setSavedIds((prev) => new Set([...prev, locationId]));
      }
    },
    [user, savedIds]
  );

  const toggleExplore = useCallback(
    async (locationId: string) => {
      if (!user) return;
      if (exploredIds.has(locationId)) {
        await fetch(`${BASE_URL}/api/users/${user.id}/explored/${locationId}`, { method: "DELETE" });
        setExploredIds((prev) => {
          const next = new Set(prev);
          next.delete(locationId);
          return next;
        });
      } else {
        await fetch(`${BASE_URL}/api/users/${user.id}/explored`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locationId: Number(locationId) }),
        });
        setExploredIds((prev) => new Set([...prev, locationId]));
      }
    },
    [user, exploredIds]
  );

  return { savedIds, exploredIds, toggleSave, toggleExplore, loading };
}
