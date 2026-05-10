import { useEffect, useState } from "react";
import { X, Calendar, Navigation, ExternalLink, Gauge, Bookmark, Compass } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Location } from "@/types/location";
import { RISK_COLORS, CATEGORY_META } from "@/lib/mapUtils";
import { PanelSkeleton } from "./PanelSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useUserLocations } from "@/hooks/useUserLocations";
import { useLocation } from "wouter";
import { useLocationAnalysis } from "@/hooks/useLocationAnalysis";
import { AIAnalysisPanel } from "./AIAnalysisPanel";

interface LocationPanelProps {
  location: Location | null;
  onClose: () => void;
}

const panelVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 30, stiffness: 240, mass: 0.9 },
  },
  exit: {
    x: "105%",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as const },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function AbandonmentBar({ score }: { score: number }) {
  const color = score >= 80 ? "#A855F7" : score >= 55 ? "#c084fc" : "#4ade80";
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
            ABANDONMENT SCORE
          </span>
        </div>
        <span className="font-title font-bold tabular-nums" style={{ fontSize: "13px", color }}>
          {score}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 8px ${color}66` }}
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  active,
  activeColor,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  activeColor: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all duration-150"
      style={{
        fontSize: "10px",
        letterSpacing: "0.1em",
        fontWeight: 600,
        textTransform: "uppercase",
        fontFamily: "inherit",
        cursor: "pointer",
        background: active ? `${activeColor}18` : "rgba(255,255,255,0.04)",
        border: active ? `1px solid ${activeColor}44` : "1px solid rgba(255,255,255,0.07)",
        color: active ? activeColor : "rgba(255,255,255,0.35)",
        boxShadow: active ? `0 0 12px ${activeColor}22` : "none",
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}

export function LocationPanel({ location, onClose }: LocationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [displayedLocation, setDisplayedLocation] = useState<Location | null>(null);
  const { user } = useAuth();
  const { savedIds, exploredIds, toggleSave, toggleExplore } = useUserLocations();
  const [, navigate] = useLocation();
  const { analysis, loading: aiLoading, error: aiError } = useLocationAnalysis(displayedLocation);

  useEffect(() => {
    if (!location) { setDisplayedLocation(null); return; }
    setIsLoading(true);
    setDisplayedLocation(null);
    const timer = setTimeout(() => {
      setDisplayedLocation(location);
      setIsLoading(false);
    }, 360);
    return () => clearTimeout(timer);
  }, [location?.id]);

  const riskStyle = displayedLocation ? RISK_COLORS[displayedLocation.riskLevel] : null;
  const categoryMeta = displayedLocation ? CATEGORY_META[displayedLocation.category] : null;
  const locId = displayedLocation ? String(displayedLocation.id) : "";
  const isSaved = savedIds.has(locId);
  const isExplored = exploredIds.has(locId);

  async function handleSave() {
    if (!user) { navigate("/login"); return; }
    await toggleSave(locId);
  }

  async function handleExplore() {
    if (!user) { navigate("/login"); return; }
    await toggleExplore(locId);
  }

  return (
    <AnimatePresence mode="wait">
      {location && (
        <motion.aside
          key="panel"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed right-0 top-0 h-[100dvh] w-full md:w-[400px] z-[1000] flex flex-col"
          style={{
            background: "linear-gradient(160deg, rgba(14,13,20,0.93) 0%, rgba(11,10,16,0.89) 100%)",
            backdropFilter: "blur(28px) saturate(1.6) brightness(0.95)",
            WebkitBackdropFilter: "blur(28px) saturate(1.6) brightness(0.95)",
            borderLeft: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "-24px 0 80px rgba(0,0,0,0.7), inset 1px 0 0 rgba(255,255,255,0.04)",
          }}
          data-testid="location-panel"
        >
          {/* Risk color strip */}
          <AnimatePresence>
            {riskStyle && (
              <motion.div
                key="strip"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-[2px] w-full origin-left flex-shrink-0"
                style={{
                  background: `linear-gradient(90deg, ${riskStyle.color} 0%, ${riskStyle.color}55 60%, transparent 100%)`,
                  boxShadow: `0 0 10px ${riskStyle.color}80`,
                }}
              />
            )}
          </AnimatePresence>

          {/* Close button */}
          <div className="absolute top-6 right-6 z-10">
            <motion.button
              whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-white transition-colors duration-150"
              data-testid="close-panel"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <PanelSkeleton key="skeleton" />
            ) : displayedLocation && riskStyle && categoryMeta ? (
              <motion.div
                key={`content-${displayedLocation.id}`}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col flex-1 overflow-hidden pt-5 px-7 pb-7"
              >
                {/* Label */}
                <motion.p
                  variants={itemVariants}
                  className="font-sans font-medium mb-2"
                  style={{ fontSize: "9px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}
                >
                  Location Intel
                </motion.p>

                {/* Title */}
                <motion.h2
                  variants={itemVariants}
                  className="font-title font-bold text-white leading-tight mb-5 pr-10"
                  style={{ fontSize: "clamp(1.1rem, 4vw, 1.4rem)" }}
                >
                  {displayedLocation.name}
                </motion.h2>

                {/* Badges */}
                <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-5">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: `${categoryMeta.color}18`, border: `1px solid ${categoryMeta.color}44`, color: categoryMeta.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: categoryMeta.color }} />
                    {categoryMeta.label}
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ border: `1px solid ${riskStyle.border}55`, color: riskStyle.color, background: riskStyle.bg }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: riskStyle.color, boxShadow: `0 0 6px ${riskStyle.color}`, animation: "pulse 2s ease-in-out infinite" }}
                    />
                    {displayedLocation.riskLevel.toUpperCase()} RISK
                  </div>
                </motion.div>

                {/* Abandonment score */}
                <motion.div variants={itemVariants} className="mb-5">
                  <AbandonmentBar score={displayedLocation.abandonmentScore} />
                </motion.div>

                {/* Save / Explore buttons */}
                <motion.div variants={itemVariants} className="flex gap-2 mb-5">
                  <ActionButton
                    icon={<Bookmark className="w-3 h-3" style={{ fill: isSaved ? "#60A5FA" : "none" }} />}
                    label={isSaved ? "Saved" : "Save"}
                    active={isSaved}
                    activeColor="#60A5FA"
                    onClick={handleSave}
                  />
                  <ActionButton
                    icon={<Compass className="w-3 h-3" style={{ fill: isExplored ? "#4ade80" : "none" }} />}
                    label={isExplored ? "Explored" : "Mark Explored"}
                    active={isExplored}
                    activeColor="#4ade80"
                    onClick={handleExplore}
                  />
                </motion.div>

                {/* Divider */}
                <motion.div variants={itemVariants} className="h-px mb-5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

                {/* Description */}
                <motion.div variants={itemVariants} className="flex-1 overflow-y-auto scrollbar-thin -mr-1 pr-1 space-y-5">
                  <p className="text-sm font-sans leading-[1.85]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {displayedLocation.description}
                  </p>

                  {/* AI Analysis */}
                  <AIAnalysisPanel
                    analysis={analysis}
                    loading={aiLoading}
                    error={aiError}
                  />
                </motion.div>

                {/* Footer */}
                <motion.div
                  variants={itemVariants}
                  className="mt-6 pt-5 flex-shrink-0"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
                    <span className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                      Last scouted{" "}
                      <strong className="font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {displayedLocation.lastVisited}
                      </strong>
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.015, boxShadow: "0 0 20px rgba(168,85,247,0.25)", backgroundColor: "rgba(168,85,247,0.18)" }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ duration: 0.15 }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.12em",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontFamily: "inherit",
                      background: "rgba(168,85,247,0.1)",
                      border: "1px solid rgba(168,85,247,0.28)",
                      color: "#A855F7",
                      cursor: "pointer",
                    }}
                    data-testid="navigate-button"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Navigate to Location
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
