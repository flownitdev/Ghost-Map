import { useState, useEffect, useCallback } from "react";
import type { Location } from "@/types/location";
import { fetchLocations, addLocation } from "@/data/locationService";

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface UseLocationsResult {
  locations: Location[];
  loadingState: LoadingState;
  error: string | null;
  refetch: () => Promise<void>;
  addLocation: (payload: Omit<Location, "id">) => Promise<Location>;
}

export function useLocations(): UseLocationsResult {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingState("loading");
    setError(null);
    try {
      const data = await fetchLocations();
      setLocations(data);
      setLoadingState("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setLoadingState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (payload: Omit<Location, "id">) => {
      const newLoc = await addLocation(payload);
      setLocations((prev) => [newLoc, ...prev]);
      return newLoc;
    },
    []
  );

  return {
    locations,
    loadingState,
    error,
    refetch: load,
    addLocation: add,
  };
}
