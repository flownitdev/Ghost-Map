import { useEffect, useState, useCallback } from "react";
import { X, Calendar, Navigation, ExternalLink, Gauge, Bookmark, Compass, Sparkles, Lock, Flag, Trash2, AlertOctagon, Shield } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Location } from "@/types/location";
import { RISK_COLORS, CATEGORY_META, isFreshLocation } from "@/lib/mapUtils";
import { PanelSkeleton } from "./PanelSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useUserLocations } from "@/hooks/useUserLocations";
import { useLocation } from "wouter";
import { useLocationAnalysis } from "@/hooks/useLocationAnalysis";
import { AIAnalysisPanel } from "./AIAnalysisPanel";
import { useNearby } from "@/hooks/useNearby";
import { NearbyPanel } from "@/components/Discovery/NearbyPanel";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

const RANKS_WITH_EXTREME = ["Ghost", "Specter", "Phantom", "Admin"];

interface LocationPanelProps {
  location: Location | null;
  onClose: () => void;
  onSelectLocation?: (location: Location) => void;
  allLocations: Location[];
  userRankTier?: string;
  isAdmin?: boolean;
}

const panelVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, damping: 32, stiffness: 260, mass: 0.85 },
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
  const color = score >= 85 ? "#f43f5e" : score >= 75 ? "#A855F7" : score >= 55 ? "#c084fc" : "#4ade80";
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.22)" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: FONT }}>
            Abandonment Score
          </span>
        </div>
        <span className="font-sans font-bold tabular-nums" style={{ fontSize: "15px", color, fontFamily: DISPLAY_FONT }}>
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

function ActionChip({ icon, label, active, activeColor, onClick }: { icon: React.ReactNode; label: string; active: boolean; activeColor: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-150"
      style={{
        fontSize: "12.5px", fontWeight: 500, fontFamily: FONT, cursor: "pointer", letterSpacing: "-0.01em",
        background: active ? `${activeColor}15` : "rgba(255,255,255,0.05)",
        border: active ? `1px solid ${activeColor}38` : "1px solid rgba(255,255,255,0.08)",
        color: active ? activeColor : "rgba(255,255,255,0.4)",
      }}
    >
      {icon} {label}
    </motion.button>
  );
}

function RankLockOverlay({ tier }: { tier: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center z-20 rounded-b-none"
      style={{ background: "rgba(12,11,17,0.92)", backdropFilter: "blur(20px)" }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-4 px-8 text-center"
      >
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center"
          style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)" }}
        >
          <Lock className="w-7 h-7" style={{ color: "#f43f5e" }} />
        </div>
        <div>
          <p className="font-sans font-bold text-white mb-1" style={{ fontSize: "17px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em" }}>
            Extreme Zone — Locked
          </p>
          <p className="font-sans" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", fontFamily: FONT, lineHeight: 1.6 }}>
            You need <strong style={{ color: "#c084fc" }}>Ghost rank</strong> or higher to access this location.
          </p>
          <p className="font-sans mt-2" style={{ fontSize: "12px", color: "rgba(255,255,255,0.22)", fontFamily: FONT }}>
            Your current rank: <span style={{ color: "#f43f5e" }}>{tier}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {["Scout", "Explorer", "Veteran", "Ghost 👻", "Specter", "Phantom"].map((r, i) => {
            const reached = ["Scout", "Explorer", "Veteran"].indexOf(tier) >= i || tier === r.replace(" 👻", "");
            return (
              <div key={r}
                className="w-2 h-2 rounded-full"
                style={{ background: reached ? (i >= 3 ? "#A855F7" : "#4ade80") : "rgba(255,255,255,0.1)" }}
              />
            );
          })}
        </div>
        <p className="font-sans text-xs" style={{ color: "rgba(255,255,255,0.18)", fontFamily: FONT }}>
          Explore more locations to level up
        </p>
      </motion.div>
    </motion.div>
  );
}

function AdminControls({ locationId, onFlagged, onRemoved }: { locationId: string; onFlagged: () => void; onRemoved: () => void }) {
  const [flagged, setFlagged] = useState(() => {
    const f = localStorage.getItem("gm-flagged") ?? "[]";
    return (JSON.parse(f) as string[]).includes(locationId);
  });
  const [removed, setRemoved] = useState(false);

  function handleFlag() {
    const key = "gm-flagged";
    const current: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!current.includes(locationId)) {
      localStorage.setItem(key, JSON.stringify([...current, locationId]));
    }
    setFlagged(true);
    onFlagged();
  }

  function handleRemove() {
    const key = "gm-removed";
    const current: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!current.includes(locationId)) {
      localStorage.setItem(key, JSON.stringify([...current, locationId]));
    }
    setRemoved(true);
    onRemoved();
  }

  if (removed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.18)" }}
    >
      <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ borderBottom: "1px solid rgba(245,158,11,0.1)" }}>
        <Shield className="w-3 h-3" style={{ color: "#f59e0b" }} />
        <span className="font-sans font-semibold" style={{ fontSize: "11px", color: "#f59e0b", fontFamily: FONT }}>
          Admin Controls
        </span>
      </div>
      <div className="flex gap-2 p-2.5">
        <button
          onClick={handleFlag}
          disabled={flagged}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
          style={{
            fontSize: "12px", fontFamily: FONT, fontWeight: 500, cursor: flagged ? "default" : "pointer",
            background: flagged ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
            border: flagged ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.08)",
            color: flagged ? "#f59e0b" : "rgba(255,255,255,0.5)",
          }}
        >
          <Flag className="w-3 h-3" />
          {flagged ? "Flagged" : "Flag"}
        </button>
        <button
          onClick={handleRemove}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
          style={{
            fontSize: "12px", fontFamily: FONT, fontWeight: 500, cursor: "pointer",
            background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e",
          }}
        >
          <Trash2 className="w-3 h-3" /> Remove
        </button>
      </div>
    </motion.div>
  );
}

export function LocationPanel({ location, onClose, onSelectLocation, allLocations, userRankTier = "Scout", isAdmin = false }: LocationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [displayedLocation, setDisplayedLocation] = useState<Location | null>(null);
  const [adminRemoved, setAdminRemoved] = useState(false);
  const { user } = useAuth();
  const { savedIds, exploredIds, toggleSave, toggleExplore } = useUserLocations();
  const [, navigate] = useLocation();
  const { analysis, loading: aiLoading, error: aiError } = useLocationAnalysis(displayedLocation);
  const nearby = useNearby(displayedLocation, allLocations, 3, 15);

  useEffect(() => {
    if (!location) { setDisplayedLocation(null); setAdminRemoved(false); return; }
    setIsLoading(true);
    setDisplayedLocation(null);
    setAdminRemoved(false);
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
  const isFresh = isFreshLocation(displayedLocation?.createdAt);
  const isExtreme = displayedLocation?.riskLevel === "extreme";
  const isLocked = isExtreme && !isAdmin && !RANKS_WITH_EXTREME.includes(userRankTier);

  const handleSave = useCallback(async () => {
    if (!user) { navigate("/login"); return; }
    await toggleSave(locId);
  }, [user, locId, toggleSave, navigate]);

  const handleExplore = useCallback(async () => {
    if (!user) { navigate("/login"); return; }
    await toggleExplore(locId);
  }, [user, locId, toggleExplore, navigate]);

  const handleNavigate = useCallback(() => {
    if (!displayedLocation) return;
    window.open(
      `https://maps.google.com/maps?q=${displayedLocation.latitude},${displayedLocation.longitude}`,
      "_blank"
    );
  }, [displayedLocation]);

  return (
    <AnimatePresence mode="wait">
      {location && !adminRemoved && (
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
                style={{ background: `linear-gradient(90deg, ${riskStyle.color} 0%, ${riskStyle.color}44 70%, transparent 100%)` }}
              />
            )}
          </AnimatePresence>

          {/* Close */}
          <div className="absolute top-5 right-5 z-30">
            <motion.button
              whileHover={{ scale: 1.06, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.94 }}
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
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
                className="flex flex-col flex-1 overflow-hidden relative"
              >
                {/* Rank-lock overlay */}
                {isLocked && <RankLockOverlay tier={userRankTier} />}

                {/* Hero section */}
                <div className="px-6 pt-6 pb-5 flex-shrink-0" style={{ filter: isLocked ? "blur(8px)" : "none", transition: "filter 0.3s" }}>
                  {/* Eyebrow */}
                  <motion.div variants={itemVariants} className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: categoryMeta.color }} />
                    <span className="font-sans" style={{ fontSize: "12px", color: categoryMeta.color, fontFamily: FONT, fontWeight: 500 }}>
                      {categoryMeta.emoji} {categoryMeta.label}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px" }}>·</span>
                    <span className="font-sans capitalize flex items-center gap-1" style={{ fontSize: "12px", color: riskStyle.color, fontFamily: FONT }}>
                      {isExtreme && <AlertOctagon className="w-3 h-3" />}
                      {displayedLocation.riskLevel} risk
                    </span>

                    {/* Freshly Abandoned badge */}
                    {isFresh && (
                      <motion.span
                        animate={{ opacity: [0.75, 1, 0.75] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", fontSize: "10px", color: "#4ade80", fontFamily: FONT, fontWeight: 600 }}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        Freshly Abandoned
                      </motion.span>
                    )}

                    {/* Admin flagged indicator */}
                    {(() => {
                      const flagged = (JSON.parse(localStorage.getItem("gm-flagged") ?? "[]") as string[]).includes(locId);
                      return flagged ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", fontSize: "10px", color: "#f59e0b", fontFamily: FONT }}>
                          <Flag className="w-2.5 h-2.5" /> Flagged
                        </span>
                      ) : null;
                    })()}
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    variants={itemVariants}
                    className="font-sans font-bold text-white leading-tight mb-5 pr-12"
                    style={{ fontSize: "clamp(1.15rem, 4vw, 1.45rem)", letterSpacing: "-0.02em", fontFamily: DISPLAY_FONT }}
                  >
                    {displayedLocation.name}
                  </motion.h2>

                  {/* Abandonment bar */}
                  <motion.div variants={itemVariants} className="mb-5">
                    <AbandonmentBar score={displayedLocation.abandonmentScore} />
                  </motion.div>

                  {/* Action chips */}
                  {!isLocked && (
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
                  )}
                </div>

                {/* Divider */}
                {!isLocked && <div className="mx-6 flex-shrink-0" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />}

                {/* Scrollable body */}
                {!isLocked && (
                  <motion.div
                    variants={itemVariants}
                    className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {/* Description */}
                    <p className="font-sans leading-relaxed" style={{ fontSize: "14px", color: "rgba(255,255,255,0.52)", fontFamily: FONT, lineHeight: "1.75" }}>
                      {displayedLocation.description}
                    </p>

                    {/* Admin Controls */}
                    {isAdmin && (
                      <AdminControls
                        locationId={locId}
                        onFlagged={() => {}}
                        onRemoved={() => setAdminRemoved(true)}
                      />
                    )}

                    {/* AI Analysis */}
                    <AIAnalysisPanel analysis={analysis} loading={aiLoading} error={aiError} />

                    {/* Nearby panel */}
                    <NearbyPanel nearby={nearby} onSelect={(loc) => { onSelectLocation?.(loc); }} />
                  </motion.div>
                )}

                {/* Footer */}
                {!isLocked && (
                  <div className="px-6 py-5 flex-shrink-0 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.22)" }} />
                        <span className="font-sans" style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", fontFamily: FONT }}>
                          Last scouted{" "}
                          <strong className="font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                            {displayedLocation.lastVisited}
                          </strong>
                        </span>
                      </div>
                      {displayedLocation.createdAt && (
                        <span className="font-sans" style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>
                          Added {new Date(displayedLocation.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.12 }}
                      onClick={handleNavigate}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl"
                      style={{
                        fontSize: "14px", fontWeight: 600, fontFamily: FONT, letterSpacing: "-0.01em",
                        background: isExtreme ? "rgba(244,63,94,0.1)" : "rgba(168,85,247,0.14)",
                        border: isExtreme ? "1px solid rgba(244,63,94,0.25)" : "1px solid rgba(168,85,247,0.28)",
                        color: isExtreme ? "#f43f5e" : "#A855F7", cursor: "pointer",
                      }}
                      data-testid="navigate-button"
                    >
                      <Navigation className="w-4 h-4" />
                      Navigate
                      <ExternalLink className="w-3 h-3 opacity-40" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
