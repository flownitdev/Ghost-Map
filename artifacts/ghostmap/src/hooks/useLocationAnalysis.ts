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

async function fetchFromCache(locationId: string): Promise<LocationAnalysis | null> {
  return api.getAnalysis(locationId);
}

async function saveToCache(analysis: LocationAnalysis): Promise<void> {
  await api.saveAnalysis(analysis);
}

async function generateAnalysis(location: Location): Promise<LocationAnalysis | null> {
  try {
    return await api.analyzeLocation({
      locationId: String(location.id),
      name: location.name,
      category: location.category,
      description: location.description,
      riskLevel: location.riskLevel,
      abandonmentScore: location.abandonmentScore,
      lastVisited: location.lastVisited,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  } catch {
    return null;
  }
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

    (async () => {
      const cached = await fetchFromCache(String(location.id));
      if (abortRef.current) return;

      if (cached) {
        setAnalysis(cached);
        setLoading(false);
        return;
      }

      const fresh = await generateAnalysis(location);
      if (abortRef.current) return;

      if (fresh) {
        setAnalysis(fresh);
        setLoading(false);
        saveToCache(fresh);
      } else {
        setError(true);
        setLoading(false);
      }
    })();

    return () => {
      abortRef.current = true;
    };
  }, [location?.id]);

  return { analysis, loading, error };
}
