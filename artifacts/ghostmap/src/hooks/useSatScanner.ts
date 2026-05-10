import { useState, useCallback, useRef } from "react";

export interface ScanTileResult {
  tileX: number;
  tileY: number;
  zoom: number;
  lat: number;
  lng: number;
  latSE: number;
  lngSE: number;
  centerLat: number;
  centerLng: number;
  confidenceScore: number;
  decayLevel: number;
  indicators: string[];
  reasoning: string;
}

export interface ScanResponse {
  zoom: number;
  centerLat: number;
  centerLng: number;
  tilesScanned: number;
  results: ScanTileResult[];
  flagged: ScanTileResult[];
}

export type ScanState = "idle" | "scanning" | "results" | "error";

export interface MapViewState {
  lat: number;
  lng: number;
  zoom: number;
}

export function useSatScanner() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanResponse, setScanResponse] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapView, setMapView] = useState<MapViewState>({ lat: 48.8566, lng: 2.3522, zoom: 12 });
  const abortRef = useRef<AbortController | null>(null);

  const updateMapView = useCallback((lat: number, lng: number, zoom: number) => {
    setMapView({ lat, lng, zoom });
  }, []);

  const startScan = useCallback(async () => {
    if (scanState === "scanning") return;
    setScanState("scanning");
    setError(null);
    setScanResponse(null);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const resp = await fetch("/api/satellite/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: mapView.lat, lng: mapView.lng, zoom: mapView.zoom }),
        signal: ctrl.signal,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `HTTP ${resp.status}`);
      }

      const data = (await resp.json()) as ScanResponse;
      setScanResponse(data);
      setScanState("results");
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setScanState("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "Scan failed");
      setScanState("error");
    }
  }, [scanState, mapView]);

  const cancelScan = useCallback(() => {
    abortRef.current?.abort();
    setScanState("idle");
    setError(null);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setScanState("idle");
    setScanResponse(null);
    setError(null);
  }, []);

  return {
    scanState,
    scanResponse,
    error,
    mapView,
    updateMapView,
    startScan,
    cancelScan,
    reset,
  };
}
