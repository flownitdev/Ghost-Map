import { motion, AnimatePresence } from "framer-motion";
import { X, Satellite, AlertTriangle, ChevronRight } from "lucide-react";
import type { ScanResponse, ScanTileResult, ScanState } from "@/hooks/useSatScanner";
import { haversineKm } from "@/lib/mapUtils";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

function confidenceColor(score: number) {
  if (score >= 75) return "#f43f5e";
  if (score >= 55) return "#f59e0b";
  if (score >= 35) return "#A855F7";
  return "#4ade80";
}

function confidenceLabel(score: number) {
  if (score >= 75) return "HIGH";
  if (score >= 55) return "MED";
  if (score >= 35) return "LOW";
  return "TRACE";
}

function ConfidenceBar({ score }: { score: number }) {
  const color = confidenceColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      <span style={{ fontSize: "10px", color, fontFamily: FONT, fontWeight: 700, minWidth: 22, textAlign: "right", letterSpacing: "0.02em" }}>
        {score}%
      </span>
    </div>
  );
}

function TileCard({
  result,
  userLat,
  userLng,
}: {
  result: ScanTileResult;
  userLat: number;
  userLng: number;
}) {
  const dist = haversineKm(userLat, userLng, result.centerLat, result.centerLng);
  const color = confidenceColor(result.confidenceScore);
  const label = confidenceLabel(result.confidenceScore);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-shrink-0 w-56 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}22`,
      }}
    >
      <div className="h-[1.5px]" style={{ background: `linear-gradient(90deg, ${color} 0%, transparent 100%)` }} />
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span
            className="px-1.5 py-0.5 rounded-md font-sans font-bold"
            style={{ fontSize: "9px", color, background: `${color}15`, letterSpacing: "0.08em" }}
          >
            {label}
          </span>
          <span style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>
            {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
          </span>
        </div>

        <ConfidenceBar score={result.confidenceScore} />

        <p
          className="font-sans mt-2 mb-2 line-clamp-2"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontFamily: FONT, lineHeight: 1.6 }}
        >
          {result.reasoning}
        </p>

        {result.indicators.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {result.indicators.slice(0, 3).map((ind, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded-md"
                style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", fontFamily: FONT }}
              >
                {ind}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.18)", fontFamily: FONT }}>
            Decay {result.decayLevel}% · {result.centerLat.toFixed(4)}, {result.centerLng.toFixed(4)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface SatScannerResultsPanelProps {
  scanState: ScanState;
  scanResponse: ScanResponse | null;
  error: string | null;
  onClose: () => void;
}

export function SatScannerResultsPanel({
  scanState,
  scanResponse,
  error,
  onClose,
}: SatScannerResultsPanelProps) {
  const visible = scanState === "results" || scanState === "error";
  const flagged = scanResponse?.flagged ?? [];
  const allResults = scanResponse?.results ?? [];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="results-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 30, stiffness: 280 }}
          className="fixed z-[1000] left-4 right-4"
          style={{ bottom: "100px" }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(8,7,14,0.92)",
              border: "1px solid rgba(168,85,247,0.2)",
              backdropFilter: "blur(40px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.07)",
              maxWidth: 700,
              margin: "0 auto",
            }}
          >
            <div className="h-[1.5px]" style={{ background: "linear-gradient(90deg, #A855F7 0%, #A855F755 60%, transparent 100%)" }} />

            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Satellite className="w-3.5 h-3.5" style={{ color: "#A855F7" }} />
                  <p className="font-sans font-semibold text-white" style={{ fontSize: "13px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em" }}>
                    Satellite Scan Results
                  </p>
                  {scanState === "results" && (
                    <span
                      className="px-2 py-0.5 rounded-full font-sans"
                      style={{ fontSize: "10px", color: "#A855F7", background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)", fontFamily: FONT }}
                    >
                      {allResults.length} tiles · {flagged.length} flagged
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-6 h-6 flex items-center justify-center rounded-lg"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", cursor: "pointer" }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Error state */}
              {scanState === "error" && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl"
                  style={{ background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.18)" }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#f43f5e" }} />
                  <p className="font-sans" style={{ fontSize: "12px", color: "#f43f5e", fontFamily: FONT }}>
                    {error ?? "Scan failed. Check your connection and try again."}
                  </p>
                </div>
              )}

              {/* No flagged results */}
              {scanState === "results" && flagged.length === 0 && (
                <div className="text-center py-3">
                  <p className="font-sans" style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>
                    No significant abandonment signals detected in this area.
                  </p>
                  <p className="font-sans mt-1" style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", fontFamily: FONT }}>
                    Try scanning a different area or zoom in further.
                  </p>
                </div>
              )}

              {/* Results carousel */}
              {scanState === "results" && flagged.length > 0 && (
                <>
                  <p className="font-sans mb-2.5" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: FONT, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Suspicious zones · sorted by confidence
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {flagged.map((result, i) => (
                      <TileCard
                        key={i}
                        result={result}
                        userLat={scanResponse?.centerLat ?? result.centerLat}
                        userLng={scanResponse?.centerLng ?? result.centerLng}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
