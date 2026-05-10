import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
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
  const { data, error } = await supabase
    .from("location_analysis")
    .select("*")
    .eq("location_id", locationId)
    .single();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    locationId: row.location_id as string,
    summary: row.summary as string,
    abandonmentScore: row.abandonment_score as number,
    decayLevel: row.decay_level as number,
    structuralIntegrity: row.structural_integrity as number,
    activityLevel: row.activity_level as number,
    explorationDifficulty: row.exploration_difficulty as number,
    aiConfidence: row.ai_confidence as number,
    roofDeterioration: row.roof_deterioration as number,
    vegetationOvergrowth: row.vegetation_overgrowth as number,
    parkingDecay: row.parking_decay as number,
    riskEstimate: row.risk_estimate as string,
  };
}

async function saveToCache(analysis: LocationAnalysis): Promise<void> {
  await supabase.from("location_analysis").upsert({
    location_id: analysis.locationId,
    summary: analysis.summary,
    abandonment_score: analysis.abandonmentScore,
    decay_level: analysis.decayLevel,
    structural_integrity: analysis.structuralIntegrity,
    activity_level: analysis.activityLevel,
    exploration_difficulty: analysis.explorationDifficulty,
    ai_confidence: analysis.aiConfidence,
    roof_deterioration: analysis.roofDeterioration,
    vegetation_overgrowth: analysis.vegetationOvergrowth,
    parking_decay: analysis.parkingDecay,
    risk_estimate: analysis.riskEstimate,
  });
}

async function generateAnalysis(location: Location): Promise<LocationAnalysis | null> {
  try {
    const resp = await fetch("/api/ai/analyze", {
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
