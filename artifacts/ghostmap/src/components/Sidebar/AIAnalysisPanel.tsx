import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Shield, Activity, Mountain, TreePine, Car, Home } from "lucide-react";
import type { LocationAnalysis } from "@/hooks/useLocationAnalysis";

interface AIAnalysisPanelProps {
  analysis: LocationAnalysis | null;
  loading: boolean;
  error: boolean;
}

function MetricBar({
  label,
  value,
  color,
  icon,
  delay,
  inverse = false,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  delay: number;
  inverse?: boolean;
}) {
  const displayColor = inverse
    ? value < 40 ? "#4ade80" : value < 70 ? "#f59e0b" : "#FA4817"
    : value > 60 ? color : value > 30 ? "#f59e0b" : "#4ade80";

  const finalColor = color !== "auto" ? color : displayColor;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span style={{ color: "rgba(255,255,255,0.3)" }} className="flex-shrink-0">
            {icon}
          </span>
          <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
            {label}
          </span>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="font-title font-bold tabular-nums"
          style={{ fontSize: "11px", color: finalColor }}
        >
          {value}
        </motion.span>
      </div>
      <div
        className="h-1 w-full rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.85, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${finalColor}55, ${finalColor})`,
            boxShadow: `0 0 6px ${finalColor}44`,
          }}
        />
      </div>
    </div>
  );
}

function SkeletonBar() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="h-2 w-24 rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="h-2 w-6 rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <motion.div
          className="h-full w-full rounded-full"
          style={{ background: "rgba(255,255,255,0.07)", transformOrigin: "left" }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function AISkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-3.5 h-3.5 rounded-full"
          style={{ background: "#354362" }}
        />
        <div className="h-2.5 w-32 rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="ml-auto h-2 w-16 rounded"
          style={{ background: "rgba(53,67,98,0.4)" }}
        />
      </div>

      <div className="rounded-xl p-4 space-y-1.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        {[0, 0.1, 0.2].map((d, i) => (
          <motion.div
            key={i}
            className="h-2 rounded"
            style={{ background: "rgba(255,255,255,0.06)", width: i === 2 ? "70%" : "100%" }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: d }}
          />
        ))}
      </div>

      <div className="space-y-3">
        {[0, 0.08, 0.16, 0.24].map((d, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: d }}
          >
            <SkeletonBar />
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
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl p-4"
          style={{
            background: "rgba(53,67,98,0.06)",
            border: "1px solid rgba(53,67,98,0.2)",
            backdropFilter: "blur(12px)",
          }}
        >
          <AISkeletonLoader />
        </motion.div>
      )}

      {!loading && error && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Brain className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
            AI analysis unavailable
          </p>
        </motion.div>
      )}

      {!loading && analysis && (
        <motion.div
          key="analysis"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(53,67,98,0.12) 0%, rgba(20,19,22,0.4) 100%)",
            border: "1px solid rgba(53,67,98,0.25)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 30px rgba(53,67,98,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(53,67,98,0.2)" }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  boxShadow: ["0 0 4px #354362aa", "0 0 10px #354362dd", "0 0 4px #354362aa"],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#354362" }}
              />
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                AI Intelligence
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-2.5 h-2.5" style={{ color: "#354362" }} />
              <span style={{ fontSize: "9px", color: "rgba(53,67,98,0.9)", letterSpacing: "0.08em" }}>
                {analysis.aiConfidence}% confidence
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="px-4 pt-3 pb-3">
            <p
              className="font-sans leading-relaxed"
              style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.55)", lineHeight: "1.75" }}
            >
              {analysis.summary}
            </p>
          </div>

          {/* Metrics grid */}
          <div className="px-4 pb-4 space-y-2.5">
            <div
              className="h-px w-full mb-3"
              style={{ background: "rgba(53,67,98,0.2)" }}
            />
            <MetricBar
              label="Decay Level"
              value={analysis.decayLevel}
              color="#FA4817"
              icon={<Mountain className="w-3 h-3" />}
              delay={0.05}
            />
            <MetricBar
              label="Structural Integrity"
              value={analysis.structuralIntegrity}
              color="#4ade80"
              icon={<Shield className="w-3 h-3" />}
              delay={0.12}
              inverse={false}
            />
            <MetricBar
              label="Roof Deterioration"
              value={analysis.roofDeterioration}
              color="#f59e0b"
              icon={<Home className="w-3 h-3" />}
              delay={0.18}
            />
            <MetricBar
              label="Vegetation Overgrowth"
              value={analysis.vegetationOvergrowth}
              color="#34d399"
              icon={<TreePine className="w-3 h-3" />}
              delay={0.24}
            />
            <MetricBar
              label="Parking Decay"
              value={analysis.parkingDecay}
              color="#8b5cf6"
              icon={<Car className="w-3 h-3" />}
              delay={0.3}
            />
            <MetricBar
              label="Activity Signals"
              value={analysis.activityLevel}
              color="#ef4444"
              icon={<Activity className="w-3 h-3" />}
              delay={0.36}
            />
            <MetricBar
              label="Exploration Difficulty"
              value={analysis.explorationDifficulty}
              color="#92a5d1"
              icon={<Zap className="w-3 h-3" />}
              delay={0.42}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
