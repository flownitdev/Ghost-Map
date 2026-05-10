import { useState, useCallback } from "react";

export interface HeatmapSettings {
  visible: boolean;
  intensity: number;
  radius: number;
}

export interface UseHeatmapResult {
  settings: HeatmapSettings;
  toggle: () => void;
  setIntensity: (v: number) => void;
  setRadius: (v: number) => void;
}

export function useHeatmap(): UseHeatmapResult {
  const [settings, setSettings] = useState<HeatmapSettings>({
    visible: true,
    intensity: 0.72,
    radius: 38,
  });

  const toggle = useCallback(() => {
    setSettings((s) => ({ ...s, visible: !s.visible }));
  }, []);

  const setIntensity = useCallback((intensity: number) => {
    setSettings((s) => ({ ...s, intensity }));
  }, []);

  const setRadius = useCallback((radius: number) => {
    setSettings((s) => ({ ...s, radius }));
  }, []);

  return { settings, toggle, setIntensity, setRadius };
}
