import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/apiClient";
import type { Location } from "@/types/location";

export interface LocationAnalysis {
  locationId: string;
  summary: string;
  abandonmentScore: number;
  decayLevel: number;
  structuralIntegrity: number;
  activityLevel: number;
  explorationDifficulty: number;
  aiConfidence: number;
  roofDeterioration: number;
  vegetationOvergrowth: number;
  parkingDecay: number;
  riskEstimate: string;
}

export function useLocationAnalysis(location: Location | null) {
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    if (!location) {
      setAnalysis(null);
      setLoading(false);
      setError(false);
      return;
    }

    abortRef.current = false;
    setAnalysis(null);
    setError(false);
    setLoading(true);

    const locationId = String(location.id);

    (async () => {
      const cached = await api.getAnalysis(locationId);
      if (abortRef.current) return;

      if (cached) {
        setAnalysis(cached);
        setLoading(false);
        return;
      }

      try {
        const fresh = await api.analyzeLocation({
          locationId,
          name: location.name,
          category: location.category,
          description: location.description,
          riskLevel: location.riskLevel,
          abandonmentScore: location.abandonmentScore,
          lastVisited: location.lastVisited,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        if (abortRef.current) return;

        if (fresh) {
          setAnalysis(fresh);
          setLoading(false);
          api.saveAnalysis(fresh).catch(() => {});
        } else {
          setError(true);
          setLoading(false);
        }
      } catch {
        if (!abortRef.current) {
          setError(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      abortRef.current = true;
    };
  }, [location?.id]);

  return { analysis, loading, error };
}
