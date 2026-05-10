import { useState, useEffect, useRef, useCallback } from "react";
import type { Location } from "@/types/location";
import { haversineKm } from "@/lib/mapUtils";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  isTracking: boolean;
  isSupported: boolean;
  trailPoints: [number, number][];
  nearbyLocation: Location | null;
  startTracking: () => void;
  stopTracking: () => void;
  clearTrail: () => void;
}

const PROXIMITY_METERS = 150;

export function useGeolocation(allLocations: Location[]): UseGeolocationReturn {
  const [position, setPosition]           = useState<GeoPosition | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [isTracking, setIsTracking]       = useState(false);
  const [trailPoints, setTrailPoints]     = useState<[number, number][]>([]);
  const [nearbyLocation, setNearbyLocation] = useState<Location | null>(null);
  const watchIdRef                        = useRef<number | null>(null);
  const isSupported                       = typeof navigator !== "undefined" && "geolocation" in navigator;

  const checkProximity = useCallback((lat: number, lng: number) => {
    const found = allLocations.find(
      (loc) => haversineKm(lat, lng, loc.latitude, loc.longitude) * 1000 <= PROXIMITY_METERS
    );
    setNearbyLocation(found ?? null);
  }, [allLocations]);

  const startTracking = useCallback(() => {
    if (!isSupported) { setError("Geolocation not supported by your browser."); return; }
    setError(null);
    setIsTracking(true);
    setTrailPoints([]);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p: GeoPosition = {
          lat:       pos.coords.latitude,
          lng:       pos.coords.longitude,
          accuracy:  pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        setPosition(p);
        setTrailPoints((prev) => [...prev, [p.lat, p.lng]]);
        checkProximity(p.lat, p.lng);
      },
      (err) => { setError(err.message); setIsTracking(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }, [isSupported, checkProximity]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setNearbyLocation(null);
  }, []);

  const clearTrail = useCallback(() => setTrailPoints([]), []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position, error, isTracking, isSupported,
    trailPoints, nearbyLocation,
    startTracking, stopTracking, clearTrail,
  };
}
