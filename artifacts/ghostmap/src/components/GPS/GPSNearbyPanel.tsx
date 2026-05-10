import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, ArrowRight, Radar } from "lucide-react";
import type { GeoPosition } from "@/hooks/useGeolocation";
import type { Location } from "@/types/location";
import { haversineKm, CATEGORY_META, RISK_COLORS } from "@/lib/mapUtils";
import { getLocationRarity, RARITY_META } from "@/types/exploration";

const FONT         = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const MAX_COUNT    = 4;
const MAX_RADIUS_KM = 5;

interface GPSNearbyPanelProps {
  position:         GeoPosition | null;
  isTracking:       boolean;
  allLocations:     Location[];
  exploredIds:      Set<string>;
  onSelectLocation: (l: Location) => void;
}

export function GPSNearbyPanel({
  position, isTracking, allLocations, exploredIds, onSelectLocation,
}: GPSNearbyPanelProps) {
  const nearby = useMemo(() => {
    if (!position) return [];
    return allLocations
      .map((l) => ({ ...l, distanceKm: haversineKm(position.lat, position.lng, l.latitude, l.longitude) }))
      .filter((l) => l.distanceKm <= MAX_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, MAX_COUNT);
  }, [position, allLocations]);

  return (
    <AnimatePresence>
      {isTracking && nearby.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed z-[900] flex flex-col gap-2"
          style={{
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "220px",
          }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background:     "rgba(14,13,20,0.88)",
              border:         "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(40px)",
              boxShadow:      "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Radar className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
              </motion.div>
              <span
                className="font-sans font-semibold"
                style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontFamily: FONT, letterSpacing: "-0.01em" }}
              >
                Nearby Forgotten Places
              </span>
            </div>

            <div className="p-2 flex flex-col gap-1">
              {nearby.map((loc, i) => {
                const meta     = CATEGORY_META[loc.category];
                const risk     = RISK_COLORS[loc.riskLevel];
                const rarity   = getLocationRarity(loc.riskLevel, loc.abandonmentScore);
                const rarMeta  = RARITY_META[rarity];
                const explored = exploredIds.has(String(loc.id));

                return (
                  <motion.button
                    key={String(loc.id)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelectLocation(loc)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left"
                    style={{
                      background: explored ? "rgba(74,222,128,0.04)" : "rgba(255,255,255,0.03)",
                      border:     explored ? "1px solid rgba(74,222,128,0.12)" : "1px solid rgba(255,255,255,0.05)",
                      cursor:     "pointer",
                      fontFamily: FONT,
                    }}
                  >
                    <span style={{ fontSize: "14px", flexShrink: 0 }}>{meta.emoji}</span>

                    <div className="flex-1 min-w-0">
                      <p
                        className="font-sans font-medium text-white truncate"
                        style={{ fontSize: "11px", letterSpacing: "-0.01em" }}
                      >
                        {loc.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span style={{ fontSize: "9px", color: rarMeta.color, fontWeight: 600 }}>
                          {rarMeta.label}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "9px" }}>·</span>
                        <span style={{ fontSize: "9px", color: risk.color }} className="capitalize">
                          {loc.riskLevel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span
                        className="font-sans font-semibold tabular-nums"
                        style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}
                      >
                        {loc.distanceKm < 1
                          ? `${Math.round(loc.distanceKm * 1000)}m`
                          : `${loc.distanceKm.toFixed(1)}km`}
                      </span>
                      <ArrowRight className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.2)" }} />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div
              className="flex items-center gap-1.5 px-4 py-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
            >
              <Navigation className="w-2.5 h-2.5" style={{ color: "rgba(74,222,128,0.5)" }} />
              <span className="font-sans" style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>
                Within {MAX_RADIUS_KM}km of your location
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
