import { motion, AnimatePresence } from "framer-motion";
import { Radar, ArrowRight } from "lucide-react";
import type { NearbyLocation } from "@/hooks/useNearby";
import { CATEGORY_META, RISK_COLORS } from "@/lib/mapUtils";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

interface NearbyPanelProps {
  nearby: NearbyLocation[];
  onSelect: (loc: NearbyLocation) => void;
}

export function NearbyPanel({ nearby, onSelect }: NearbyPanelProps) {
  return (
    <AnimatePresence>
      {nearby.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-5"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Radar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#A855F7" }} />
            <span
              className="font-sans font-semibold"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontFamily: FONT, letterSpacing: "-0.01em" }}
            >
              Nearby Forgotten Places
            </span>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2">
            {nearby.map((loc, i) => (
              <NearbyCard key={String(loc.id)} loc={loc} index={i} onSelect={() => onSelect(loc)} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NearbyCard({
  loc,
  index,
  onSelect,
}: {
  loc: NearbyLocation;
  index: number;
  onSelect: () => void;
}) {
  const meta = CATEGORY_META[loc.category];
  const risk = RISK_COLORS[loc.riskLevel];

  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        cursor: "pointer",
        fontFamily: FONT,
      }}
    >
      {/* Category emoji */}
      <span style={{ fontSize: "16px", flexShrink: 0 }}>{meta.emoji}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-sans font-medium text-white truncate"
          style={{ fontSize: "12px", letterSpacing: "-0.01em" }}
        >
          {loc.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span style={{ fontSize: "10px", color: meta.color }}>{meta.label}</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>·</span>
          <span
            style={{ fontSize: "10px", color: risk.color }}
            className="capitalize"
          >
            {loc.riskLevel} risk
          </span>
        </div>
      </div>

      {/* Distance + arrow */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className="font-sans font-semibold tabular-nums"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}
        >
          {loc.distanceKm < 1
            ? `${Math.round(loc.distanceKm * 1000)}m`
            : `${loc.distanceKm.toFixed(1)}km`}
        </span>
        <ArrowRight className="w-3 h-3" style={{ color: "rgba(255,255,255,0.2)" }} />
      </div>
    </motion.button>
  );
}
