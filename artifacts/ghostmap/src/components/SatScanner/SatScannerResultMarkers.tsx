import { Circle } from "react-leaflet";
import { motion } from "framer-motion";
import type { ScanTileResult } from "@/hooks/useSatScanner";

function confidenceColor(score: number): string {
  if (score >= 75) return "#f43f5e";
  if (score >= 55) return "#f59e0b";
  if (score >= 35) return "#A855F7";
  return "#4ade80";
}

interface SatScannerResultMarkersProps {
  results: ScanTileResult[];
}

export function SatScannerResultMarkers({ results }: SatScannerResultMarkersProps) {
  const flagged = results.filter((r) => r.confidenceScore >= 25);

  return (
    <>
      {flagged.map((result, i) => {
        const color = confidenceColor(result.confidenceScore);
        const opacity = 0.08 + (result.confidenceScore / 100) * 0.18;

        return (
          <Circle
            key={i}
            center={[result.centerLat, result.centerLng]}
            radius={Math.max(100, 300 - result.confidenceScore * 1.5)}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: opacity,
              weight: result.confidenceScore >= 60 ? 1.5 : 1,
              opacity: result.confidenceScore >= 60 ? 0.7 : 0.4,
              dashArray: result.confidenceScore >= 70 ? undefined : "4 4",
            }}
          />
        );
      })}
    </>
  );
}
