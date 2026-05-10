import { useState, useEffect, useRef } from "react";
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

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

async function fetchFromCache(locationId: string): Promise<LocationAnalysis | null> {
  try {
    const resp = await fetch(`${BASE_URL}/api/analysis/${locationId}`);
    if (!resp.ok) return null;
    return (await resp.json()) as LocationAnalysis;
  } catch {
    return null;
  }
}

async function saveToCache(analysis: LocationAnalysis): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysis),
    });
  } catch {
    // silent — caching is best-effort
  }
}

async function generateAnalysis(location: Location): Promise<LocationAnalysis | null> {
  try {
    const resp = await fetch(`${BASE_URL}/api/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId: String(location.id),
        name: location.name,
        category: location.category,
        description: location.description,
        riskLevel: location.riskLevel,
        abandonmentScore: location.abandonmentScore,
        lastVisited: location.lastVisited,
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    });
    if (!resp.ok) return null;
    return (await resp.json()) as LocationAnalysis;
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

    const locationId = String(location.id);

    (async () => {
      const cached = await fetchFromCache(locationId);
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
