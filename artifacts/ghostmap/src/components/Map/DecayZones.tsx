import { useMemo } from "react";
import { Circle } from "react-leaflet";
import type { Location } from "@/types/location";

interface Cluster {
  center: [number, number];
  intensity: number;
  baseRadius: number;
}

function buildDecayClusters(locations: Location[]): Cluster[] {
  const hotspots = locations.filter((l) => l.abandonmentScore >= 62);
  const clusters: Cluster[] = [];
  const usedIds = new Set<string | number>();

  for (const loc of hotspots) {
    if (usedIds.has(loc.id)) continue;

    const nearby = hotspots.filter((other) => {
      if (other.id === loc.id || usedIds.has(other.id)) return false;
      const dlat = other.latitude - loc.latitude;
      const dlng = other.longitude - loc.longitude;
      return Math.sqrt(dlat * dlat + dlng * dlng) < 0.022;
    });

    [loc, ...nearby].forEach((n) => usedIds.add(n.id));

    const group = [loc, ...nearby];
    const avgLat = group.reduce((s, l) => s + l.latitude, 0) / group.length;
    const avgLng = group.reduce((s, l) => s + l.longitude, 0) / group.length;
    const maxScore = Math.max(...group.map((l) => l.abandonmentScore));

    clusters.push({
      center: [avgLat, avgLng],
      intensity: maxScore / 100,
      baseRadius: 320 + group.length * 180,
    });
  }

  return clusters;
}

interface DecayZonesProps {
  locations: Location[];
  visible: boolean;
}

export function DecayZones({ locations, visible }: DecayZonesProps) {
  const clusters = useMemo(() => buildDecayClusters(locations), [locations]);

  if (!visible || clusters.length === 0) return null;

  const outerCircles = clusters.map((cluster, i) => (
    <Circle
      key={`outer-${i}`}
      center={cluster.center}
      radius={cluster.baseRadius * 3.2}
      pathOptions={{
        color: "#f97316",
        fillColor: "#f97316",
        fillOpacity: 0.018 * cluster.intensity,
        opacity: 0,
        weight: 0,
        interactive: false,
      }}
    />
  ));

  const midCircles = clusters.map((cluster, i) => (
    <Circle
      key={`mid-${i}`}
      center={cluster.center}
      radius={cluster.baseRadius * 1.9}
      pathOptions={{
        color: "#f97316",
        fillColor: "#f97316",
        fillOpacity: 0.035 * cluster.intensity,
        opacity: 0.06 * cluster.intensity,
        weight: 0.8,
        dashArray: "3 6",
        interactive: false,
      }}
    />
  ));

  const innerCircles = clusters.map((cluster, i) => (
    <Circle
      key={`inner-${i}`}
      center={cluster.center}
      radius={cluster.baseRadius}
      pathOptions={{
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.055 * cluster.intensity,
        opacity: 0.18 * cluster.intensity,
        weight: 1,
        interactive: false,
      }}
    />
  ));

  return (
    <>
      {outerCircles}
      {midCircles}
      {innerCircles}
    </>
  );
}
