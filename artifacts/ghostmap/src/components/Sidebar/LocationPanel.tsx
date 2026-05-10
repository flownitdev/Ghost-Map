import { useEffect, useState, useCallback } from "react";
import { X, Calendar, Navigation, ExternalLink, Gauge, Bookmark, Compass, Sparkles, Lock, AlertOctagon, ShieldCheck, HelpCircle, Building2, RefreshCcw, Trash2, Link2 } from "lucide-react";
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
import { VerificationBadge } from "@/components/Location/VerificationBadge";
import { updateVerificationState, deleteLocation } from "@/data/locationService";
import type { VerificationState } from "@/types/location";

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
    transition: { type: "spring" as const, damping: 34, stiffness: 240, mass: 0.9 },
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
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
  exit: { opacity: 0, transition: { duration: 0.08 } },
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
  const color = score >= 85 ? "#f43f5e" : score >= 70 ? "#FA4817" : score >= 55 ? "#f59e0b" : "#6b7280";
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3 h-3" style={{ color: "rgba(255,255,255,0.18)" }} />
          <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.32)", fontFamily: FONT }}>
            Abandonment Index
          </span>
        </div>
        <span
          className="font-sans font-bold tabular-nums"
          style={{ fontSize: "18px", color, fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em" }}
        >
          {score}
        </span>
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
        />
      </div>
    </div>
  );
}

function ActionChip({ icon, label, active, activeColor, onClick }: { icon: React.ReactNode; label: string; active: boolean; activeColor: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-150"
      style={{
        fontSize: "12px",
        fontWeight: active ? 600 : 400,
        fontFamily: FONT,
        cursor: "pointer",
        letterSpacing: "-0.01em",
        background: active ? `${activeColor}12` : "rgba(255,255,255,0.04)",
        border: active ? `1px solid ${activeColor}30` : "1px solid rgba(255,255,255,0.06)",
        color: active ? activeColor : "rgba(255,255,255,0.35)",
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
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      style={{ background: "rgba(10,9,14,0.94)", backdropFilter: "blur(20px)" }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-5 px-10 text-center"
      >
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center"
          style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}
        >
          <Lock className="w-6 h-6" style={{ color: "#f43f5e" }} />
        </div>
        <div>
          <p className="font-sans font-bold text-white mb-2" style={{ fontSize: "18px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em" }}>
            Extreme Zone
          </p>
          <p className="font-sans" style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontFamily: FONT, lineHeight: 1.7 }}>
            Requires <strong style={{ color: "rgba(255,255,255,0.7)" }}>Ghost rank</strong> or higher
          </p>
          <p className="font-sans mt-1.5" style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>
            Current: {tier}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AdminControls({
  locationId,
  currentVerification,
  onRemoved,
  onVerificationChanged,
}: {
  locationId: string;
  currentVerification: VerificationState;
  onRemoved: () => void;
  onVerificationChanged: (state: VerificationState) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleVerify(state: VerificationState) {
    setBusy(true);
    try {
      await updateVerificationState(locationId, state);
      onVerificationChanged(state);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this location?")) return;
    setBusy(true);
    try {
      await deleteLocation(locationId);
      onRemoved();
    } finally {
      setBusy(false);
    }
  }

  const STATES: { state: VerificationState; label: string; icon: React.ReactNode; color: string }[] = [
    { state: "unverified", label: "Unverified", icon: <HelpCircle className="w-3 h-3" />, color: "#f59e0b" },
    { state: "community_verified", label: "Verified", icon: <ShieldCheck className="w-3 h-3" />, color: "#4ade80" },
    { state: "demolished", label: "Demolished", icon: <Building2 className="w-3 h-3" />, color: "#6b7280" },
    { state: "active_again", label: "Active", icon: <RefreshCcw className="w-3 h-3" />, color: "#60a5fa" },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)" }}
    >
      <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderBottom: "1px solid rgba(245,158,11,0.08)" }}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" style={{ color: "rgba(245,158,11,0.6)" }} />
          <span className="font-sans" style={{ fontSize: "10px", color: "rgba(245,158,11,0.6)", fontFamily: FONT, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Admin Controls
          </span>
        </div>
      </div>
      <div className="p-2.5 space-y-2">
        <p className="font-sans px-1" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>Set verification state</p>
        <div className="grid grid-cols-2 gap-1.5">
          {STATES.map(({ state, label, icon, color }) => {
            const isActive = currentVerification === state;
            return (
              <button
                key={state}
                onClick={() => !isActive && !busy && handleVerify(state)}
                disabled={busy}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg"
                style={{
                  fontSize: "11px", fontFamily: FONT, fontWeight: isActive ? 600 : 400, cursor: isActive || busy ? "default" : "pointer",
                  background: isActive ? `${color}14` : "rgba(255,255,255,0.03)",
                  border: isActive ? `1px solid ${color}30` : "1px solid rgba(255,255,255,0.06)",
                  color: isActive ? color : "rgba(255,255,255,0.4)",
                  opacity: busy ? 0.5 : 1,
                }}
              >
                {icon} {label}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg"
          style={{
            fontSize: "11.5px", fontFamily: FONT, fontWeight: 500, cursor: busy ? "not-allowed" : "pointer",
            background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.15)", color: "#f43f5e",
            opacity: busy ? 0.4 : 1,
          }}
        >
          <Trash2 className="w-3 h-3" /> Delete Location
        </button>
      </div>
    </div>
  );
}

export function LocationPanel({ location, onClose, onSelectLocation, allLocations, userRankTier = "Scout", isAdmin = false }: LocationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [displayedLocation, setDisplayedLocation] = useState<Location | null>(null);
  const [adminRemoved, setAdminRemoved] = useState(false);
  const [localVerification, setLocalVerification] = useState<VerificationState>("unverified");
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
      setLocalVerification(location.verificationState ?? "unverified");
      setIsLoading(false);
    }, 280);
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
    window.open(`https://maps.google.com/maps?q=${displayedLocation.latitude},${displayedLocation.longitude}`, "_blank");
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
          className="fixed right-0 top-0 h-[100dvh] w-full md:w-[420px] z-[1000] flex flex-col"
          style={{
            background: "rgba(14,13,20,0.94)",
            backdropFilter: "blur(56px) saturate(1.6)",
            WebkitBackdropFilter: "blur(56px) saturate(1.6)",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "-24px 0 72px rgba(0,0,0,0.65)",
          }}
          data-testid="location-panel"
        >
          {/* Risk accent line */}
          <AnimatePresence>
            {riskStyle && (
              <motion.div
                key="strip"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-[1.5px] w-full origin-left flex-shrink-0"
                style={{ background: `linear-gradient(90deg, ${riskStyle.color} 0%, ${riskStyle.color}33 70%, transparent 100%)` }}
              />
            )}
          </AnimatePresence>

          {/* Close button */}
          <div className="absolute top-5 right-5 z-30">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
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
                {isLocked && <RankLockOverlay tier={userRankTier} />}

                {/* Hero section */}
                <div
                  className="px-7 pt-8 pb-6 flex-shrink-0"
                  style={{ filter: isLocked ? "blur(8px)" : "none", transition: "filter 0.3s" }}
                >
                  {/* Eyebrow */}
                  <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3 flex-wrap">
                    <span
                      className="font-sans capitalize flex items-center gap-1.5"
                      style={{ fontSize: "12px", color: categoryMeta.color, fontFamily: FONT, fontWeight: 500 }}
                    >
                      {categoryMeta.emoji} {categoryMeta.label}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "12px" }}>·</span>
                    <span
                      className="font-sans capitalize flex items-center gap-1"
                      style={{ fontSize: "12px", color: riskStyle.color, fontFamily: FONT }}
                    >
                      {isExtreme && <AlertOctagon className="w-3 h-3" />}
                      {displayedLocation.riskLevel} risk
                    </span>
                    {isFresh && (
                      <motion.span
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.5)",
                          fontFamily: FONT,
                          fontWeight: 600,
                        }}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        New
                      </motion.span>
                    )}
                    <VerificationBadge state={localVerification} size="sm" />
                  </motion.div>

                  {/* Title — big */}
                  <motion.h2
                    variants={itemVariants}
                    className="font-sans font-bold text-white leading-tight mb-6 pr-10"
                    style={{ fontSize: "clamp(1.3rem, 5vw, 1.65rem)", letterSpacing: "-0.03em", fontFamily: DISPLAY_FONT, lineHeight: 1.15 }}
                  >
                    {displayedLocation.name}
                  </motion.h2>

                  {/* Abandonment bar */}
                  <motion.div variants={itemVariants} className="mb-6">
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
                {!isLocked && (
                  <div className="mx-7 flex-shrink-0" style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />
                )}

                {/* Scrollable body */}
                {!isLocked && (
                  <motion.div
                    variants={itemVariants}
                    className="flex-1 overflow-y-auto px-7 py-6 space-y-6"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {/* Description */}
                    <p
                      className="font-sans leading-relaxed"
                      style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", fontFamily: FONT, lineHeight: "1.8" }}
                    >
                      {displayedLocation.description}
                    </p>

                    {/* Location metadata */}
                    {(displayedLocation.closureDate || displayedLocation.buildingStatus || displayedLocation.sourceAttribution) && (
                      <div className="space-y-2.5 rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {displayedLocation.closureDate && (
                          <div>
                            <p className="font-sans" style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Closed</p>
                            <p className="font-sans" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>{displayedLocation.closureDate}</p>
                          </div>
                        )}
                        {displayedLocation.buildingStatus && displayedLocation.buildingStatus !== "unknown" && (
                          <div>
                            <p className="font-sans" style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Building</p>
                            <p className="font-sans capitalize" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>{displayedLocation.buildingStatus}</p>
                          </div>
                        )}
                        {displayedLocation.sourceAttribution && (
                          <div>
                            <p className="font-sans" style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Source</p>
                            <p className="font-sans flex items-center gap-1" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: FONT }}>
                              <Link2 className="w-2.5 h-2.5 flex-shrink-0" />
                              {displayedLocation.sourceAttribution}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Controls */}
                    {isAdmin && (
                      <AdminControls
                        locationId={locId}
                        currentVerification={localVerification}
                        onVerificationChanged={setLocalVerification}
                        onRemoved={() => setAdminRemoved(true)}
                      />
                    )}

                    {/* AI Analysis */}
                    <AIAnalysisPanel analysis={analysis} loading={aiLoading} error={aiError} />

                    {/* Nearby */}
                    <NearbyPanel nearby={nearby} onSelect={(loc) => { onSelectLocation?.(loc); }} />
                  </motion.div>
                )}

                {/* Footer */}
                {!isLocked && (
                  <div
                    className="px-7 py-5 flex-shrink-0 space-y-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.18)" }} />
                        <span className="font-sans" style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
                          Scouted{" "}
                          <strong className="font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                            {displayedLocation.lastVisited}
                          </strong>
                        </span>
                      </div>
                      {displayedLocation.createdAt && (
                        <span className="font-sans" style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)", fontFamily: FONT }}>
                          Added {new Date(displayedLocation.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.12 }}
                      onClick={handleNavigate}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl"
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        fontFamily: FONT,
                        letterSpacing: "-0.01em",
                        background: isExtreme ? "rgba(244,63,94,0.08)" : "rgba(250,72,23,0.1)",
                        border: isExtreme ? "1px solid rgba(244,63,94,0.2)" : "1px solid rgba(250,72,23,0.22)",
                        color: isExtreme ? "#f43f5e" : "#FA4817",
                        cursor: "pointer",
                      }}
                      data-testid="navigate-button"
                    >
                      <Navigation className="w-4 h-4" />
                      Navigate
                      <ExternalLink className="w-3 h-3 opacity-35" />
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
