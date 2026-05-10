import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Shield, Activity, Mountain, TreePine, Car, Home } from "lucide-react";
import type { LocationAnalysis } from "@/hooks/useLocationAnalysis";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

interface AIAnalysisPanelProps {
  analysis: LocationAnalysis | null;
  loading: boolean;
  error: boolean;
}

function MetricRow({
  label,
  value,
  color,
  icon,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span style={{ color: "rgba(255,255,255,0.25)" }}>{icon}</span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontFamily: FONT }}>
            {label}
          </span>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
          style={{ fontSize: "12px", fontWeight: 600, color, fontFamily: FONT }}
        >
          {value}
        </motion.span>
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}55, ${color})` }}
        />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="h-2.5 w-28 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="h-2.5 w-6 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          className="h-full w-3/4 rounded-full"
          style={{ background: "rgba(255,255,255,0.1)" }}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{
        background: "rgba(168,85,247,0.04)",
        border: "1px solid rgba(168,85,247,0.1)",
      }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "rgba(168,85,247,0.35)" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <div className="h-2.5 w-24 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>
        <div className="h-2 w-20 rounded-full" style={{ background: "rgba(168,85,247,0.15)" }} />
      </div>

      {/* Summary skeleton */}
      <div className="space-y-1.5">
        {[100, 88, 64].map((w, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", width: `${w}%` }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>

      {/* Metric skeletons */}
      <div className="space-y-3">
        {[0, 0.07, 0.14, 0.21].map((d, i) => (
          <motion.div key={i} animate={{ opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: d }}>
            <SkeletonRow />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function AIAnalysisPanel({ analysis, loading, error }: AIAnalysisPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LoadingSkeleton />
        </motion.div>
      )}

      {!loading && error && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Brain className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.18)" }} />
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.28)", fontFamily: FONT }}>
            AI analysis unavailable
          </p>
        </motion.div>
      )}

      {!loading && analysis && (
        <motion.div
          key="analysis"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(168,85,247,0.05)",
            border: "1px solid rgba(168,85,247,0.14)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(168,85,247,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full"
                style={{ background: "#A855F7" }}
              />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", fontFamily: FONT, fontWeight: 500 }}>
                AI Intelligence
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" style={{ color: "rgba(168,85,247,0.7)" }} />
              <span style={{ fontSize: "11px", color: "rgba(168,85,247,0.8)", fontFamily: FONT }}>
                {analysis.aiConfidence}% confidence
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="px-4 pt-3.5 pb-3">
            <p
              className="font-sans leading-relaxed"
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.52)", lineHeight: "1.7", fontFamily: FONT }}
            >
              {analysis.summary}
            </p>
          </div>

          {/* Metrics */}
          <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid rgba(168,85,247,0.08)" }}>
            <div className="pt-3 space-y-3">
              <MetricRow label="Decay Level"           value={analysis.decayLevel}           color="#A855F7" icon={<Mountain className="w-3 h-3" />}  delay={0.05} />
              <MetricRow label="Structural Integrity"  value={analysis.structuralIntegrity}  color="#4ade80" icon={<Shield className="w-3 h-3" />}    delay={0.11} />
              <MetricRow label="Roof Deterioration"    value={analysis.roofDeterioration}    color="#f59e0b" icon={<Home className="w-3 h-3" />}      delay={0.17} />
              <MetricRow label="Vegetation Overgrowth" value={analysis.vegetationOvergrowth} color="#34d399" icon={<TreePine className="w-3 h-3" />}  delay={0.23} />
              <MetricRow label="Parking Decay"         value={analysis.parkingDecay}         color="#8b5cf6" icon={<Car className="w-3 h-3" />}       delay={0.29} />
              <MetricRow label="Activity Signals"      value={analysis.activityLevel}        color="#ef4444" icon={<Activity className="w-3 h-3" />}  delay={0.35} />
              <MetricRow label="Exploration Difficulty" value={analysis.explorationDifficulty} color="#c084fc" icon={<Zap className="w-3 h-3" />}    delay={0.41} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
