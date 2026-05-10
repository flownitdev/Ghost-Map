import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

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

    Promise.all([
      supabase
        .from("saved_locations")
        .select("location_id")
        .eq("user_id", user.id),
      supabase
        .from("explored_locations")
        .select("location_id")
        .eq("user_id", user.id),
    ]).then(([savedRes, exploredRes]) => {
      setSavedIds(
        new Set((savedRes.data ?? []).map((r: { location_id: string | number }) => String(r.location_id)))
      );
      setExploredIds(
        new Set((exploredRes.data ?? []).map((r: { location_id: string | number }) => String(r.location_id)))
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const toggleSave = useCallback(
    async (locationId: string) => {
      if (!user) return;
      if (savedIds.has(locationId)) {
        await supabase
          .from("saved_locations")
          .delete()
          .eq("user_id", user.id)
          .eq("location_id", Number(locationId));
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(locationId);
          return next;
        });
      } else {
        await supabase
          .from("saved_locations")
          .insert({ user_id: user.id, location_id: locationId });
        setSavedIds((prev) => new Set([...prev, locationId]));
      }
    },
    [user, savedIds]
  );

  const toggleExplore = useCallback(
    async (locationId: string) => {
      if (!user) return;
      if (exploredIds.has(locationId)) {
        await supabase
          .from("explored_locations")
          .delete()
          .eq("user_id", user.id)
          .eq("location_id", Number(locationId));
        setExploredIds((prev) => {
          const next = new Set(prev);
          next.delete(locationId);
          return next;
        });
      } else {
        await supabase
          .from("explored_locations")
          .insert({ user_id: user.id, location_id: locationId });
        setExploredIds((prev) => new Set([...prev, locationId]));
      }
    },
    [user, exploredIds]
  );

  return { savedIds, exploredIds, toggleSave, toggleExplore, loading };
}
