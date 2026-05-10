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
    transition: { type: "spring", damping: 32, stiffness: 260, mass: 0.85 },
  },
  exit: {
    x: "105%",
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
  exit: { opacity: 0, transition: { duration: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function AbandonmentBar({ score }: { score: number }) {
  const color = score >= 80 ? "#A855F7" : score >= 55 ? "#c084fc" : "#4ade80";
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.22)" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}>
            Abandonment Score
          </span>
        </div>
        <span className="font-sans font-bold tabular-nums" style={{ fontSize: "15px", color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}>
          {score}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.75, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}77, ${color})` }}
        />
      </div>
    </div>
  );
}

function ActionChip({
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
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-150"
      style={{
        fontSize: "12.5px",
        fontWeight: 500,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
        cursor: "pointer",
        background: active ? `${activeColor}15` : "rgba(255,255,255,0.05)",
        border: active ? `1px solid ${activeColor}38` : "1px solid rgba(255,255,255,0.08)",
        color: active ? activeColor : "rgba(255,255,255,0.4)",
        letterSpacing: "-0.01em",
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
    }, 320);
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
            background: "rgba(20,20,22,0.92)",
            backdropFilter: "blur(48px) saturate(1.8)",
            WebkitBackdropFilter: "blur(48px) saturate(1.8)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
          }}
          data-testid="location-panel"
        >
          {/* Risk colour accent */}
          <AnimatePresence>
            {riskStyle && (
              <motion.div
                key="strip"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-[1.5px] w-full origin-left flex-shrink-0"
                style={{
                  background: `linear-gradient(90deg, ${riskStyle.color} 0%, ${riskStyle.color}44 70%, transparent 100%)`,
                }}
              />
            )}
          </AnimatePresence>

          {/* Close */}
          <div className="absolute top-5 right-5 z-10">
            <motion.button
              whileHover={{ scale: 1.06, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.94 }}
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
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
                className="flex flex-col flex-1 overflow-hidden"
              >
                {/* Hero section */}
                <div className="px-6 pt-6 pb-5 flex-shrink-0">
                  {/* Eyebrow */}
                  <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: categoryMeta.color }}
                    />
                    <span
                      className="font-sans"
                      style={{
                        fontSize: "12px",
                        color: categoryMeta.color,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {categoryMeta.label}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px" }}>·</span>
                    <span
                      className="font-sans capitalize"
                      style={{
                        fontSize: "12px",
                        color: riskStyle.color,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                      }}
                    >
                      {displayedLocation.riskLevel} risk
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    variants={itemVariants}
                    className="font-sans font-bold text-white leading-tight mb-5 pr-12"
                    style={{
                      fontSize: "clamp(1.15rem, 4vw, 1.45rem)",
                      letterSpacing: "-0.02em",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
                    }}
                  >
                    {displayedLocation.name}
                  </motion.h2>

                  {/* Abandonment bar */}
                  <motion.div variants={itemVariants} className="mb-5">
                    <AbandonmentBar score={displayedLocation.abandonmentScore} />
                  </motion.div>

                  {/* Action chips */}
                  <motion.div variants={itemVariants} className="flex gap-2">
                    <ActionChip
                      icon={<Bookmark className="w-3.5 h-3.5" style={{ fill: isSaved ? "#60A5FA" : "none" }} />}
                      label={isSaved ? "Saved" : "Save"}
                      active={isSaved}
                      activeColor="#60A5FA"
                      onClick={handleSave}
                    />
                    <ActionChip
                      icon={<Compass className="w-3.5 h-3.5" style={{ fill: isExplored ? "#4ade80" : "none" }} />}
                      label={isExplored ? "Explored" : "Mark Explored"}
                      active={isExplored}
                      activeColor="#4ade80"
                      onClick={handleExplore}
                    />
                  </motion.div>
                </div>

                {/* Divider */}
                <div className="mx-6 flex-shrink-0" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

                {/* Scrollable body */}
                <motion.div
                  variants={itemVariants}
                  className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
                  style={{ scrollbarWidth: "none" }}
                >
                  {/* Description */}
                  <p
                    className="font-sans leading-relaxed"
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.52)",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                      lineHeight: "1.75",
                    }}
                  >
                    {displayedLocation.description}
                  </p>

                  {/* AI Analysis */}
                  <AIAnalysisPanel analysis={analysis} loading={aiLoading} error={aiError} />
                </motion.div>

                {/* Footer */}
                <div
                  className="px-6 py-5 flex-shrink-0 space-y-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.22)" }} />
                    <span
                      className="font-sans"
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.38)",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                      }}
                    >
                      Last scouted{" "}
                      <strong className="font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {displayedLocation.lastVisited}
                      </strong>
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.12 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                      letterSpacing: "-0.01em",
                      background: "rgba(168,85,247,0.14)",
                      border: "1px solid rgba(168,85,247,0.28)",
                      color: "#A855F7",
                      cursor: "pointer",
                    }}
                    data-testid="navigate-button"
                  >
                    <Navigation className="w-4 h-4" />
                    Navigate
                    <ExternalLink className="w-3 h-3 opacity-40" />
                  </motion.button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
