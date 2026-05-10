import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, AlertOctagon, ChevronUp, Sparkles,
  TrendingUp, Clock, Zap, AlertTriangle,
} from "lucide-react";
import type { Location } from "@/types/location";
import { RISK_COLORS, CATEGORY_META } from "@/lib/mapUtils";
import {
  freshnessScore, trendingScore, freshnessTier, FRESHNESS_META,
  isDecayAlert, sortLocations,
} from "@/lib/freshness";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

type TrendTab = "fresh" | "trending" | "danger" | "decay" | "newest";

interface TrendingPanelProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

export function TrendingPanel({ locations, onSelectLocation }: TrendingPanelProps) {
  const [activeTab, setActiveTab] = useState<TrendTab>("fresh");
  const [open, setOpen] = useState(false);

  const lists = useMemo(() => {
    const fresh    = sortLocations(locations, "freshest").slice(0, 5);
    const trending = sortLocations(locations, "trending").slice(0, 5);
    const decay    = sortLocations(locations, "highest_decay").slice(0, 5);
    const newest   = sortLocations(locations, "newest_abandoned").slice(0, 5);
    const danger   = locations
      .filter((l) => l.riskLevel === "extreme" || l.riskLevel === "high")
      .sort((a, b) => b.abandonmentScore - a.abandonmentScore)
      .slice(0, 5);
    return { fresh, trending, danger, decay, newest };
  }, [locations]);

  const decayAlerts = useMemo(
    () => locations.filter(isDecayAlert),
    [locations]
  );

  const freshCount = useMemo(
    () => locations.filter((l) => {
      const t = freshnessTier(freshnessScore(l));
      return t === "just_dropped" || t === "fresh";
    }).length,
    [locations]
  );

  const tabs: { id: TrendTab; label: string; icon: React.ReactNode; data: Location[] }[] = [
    { id: "fresh",    label: "Fresh",    icon: <Sparkles className="w-3 h-3" />,      data: lists.fresh    },
    { id: "trending", label: "Surge",    icon: <TrendingUp className="w-3 h-3" />,    data: lists.trending },
    { id: "danger",   label: "Danger",   icon: <AlertOctagon className="w-3 h-3" />,  data: lists.danger   },
    { id: "decay",    label: "Decay",    icon: <Flame className="w-3 h-3" />,         data: lists.decay    },
    { id: "newest",   label: "Newest",   icon: <Clock className="w-3 h-3" />,         data: lists.newest   },
  ];

  const activeData = tabs.find((t) => t.id === activeTab)?.data ?? [];

  if (locations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed z-[999] left-1/2 -translate-x-1/2"
      style={{ bottom: 84, width: "min(560px, calc(100vw - 56px))" }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(18,17,24,0.84)",
          backdropFilter: "blur(48px) saturate(1.6)",
          WebkitBackdropFilter: "blur(48px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.45), 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Decay alert banner */}
        <AnimatePresence>
          {decayAlerts.length > 0 && (
            <motion.button
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full overflow-hidden"
              onClick={() => {
                setActiveTab("fresh");
                setOpen(true);
              }}
            >
              <motion.div
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="flex items-center gap-2 px-4 py-2"
                style={{
                  background: "rgba(244,63,94,0.06)",
                  borderBottom: "1px solid rgba(244,63,94,0.12)",
                }}
              >
                <Zap className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "#f43f5e" }} />
                <span style={{ fontSize: "10.5px", fontFamily: FONT, color: "#f43f5e", fontWeight: 600, letterSpacing: "0.01em" }}>
                  {decayAlerts.length} decay alert{decayAlerts.length > 1 ? "s" : ""} — critical sites recently closed
                </span>
                <AlertTriangle className="w-2.5 h-2.5 ml-auto flex-shrink-0" style={{ color: "rgba(244,63,94,0.5)" }} />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Header row */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className="font-sans font-semibold flex-shrink-0"
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", fontFamily: FONT, letterSpacing: "-0.01em" }}
          >
            Intelligence
          </span>

          {freshCount > 0 && (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "rgba(250,72,23,0.1)", border: "1px solid rgba(250,72,23,0.2)" }}
            >
              <Sparkles className="w-2.5 h-2.5" style={{ color: "rgba(250,72,23,0.7)" }} />
              <span style={{ fontSize: "9.5px", color: "rgba(250,72,23,0.8)", fontFamily: FONT, fontWeight: 600 }}>
                {freshCount} fresh
              </span>
            </div>
          )}

          {/* Tab pills */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if (!open) setOpen(true); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-150"
                  style={{
                    fontSize: "10px",
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: FONT,
                    cursor: "pointer",
                    background: isActive ? "rgba(250,72,23,0.14)" : "transparent",
                    color: isActive ? "#FA4817" : "rgba(255,255,255,0.28)",
                    border: isActive ? "1px solid rgba(250,72,23,0.22)" : "1px solid transparent",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex-shrink-0">
            <motion.div
              animate={{ rotate: open ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </motion.div>
          </div>
        </div>

        {/* Expanded cards */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div
                className="overflow-x-auto flex gap-2 px-4 pb-4 pt-1"
                style={{ scrollbarWidth: "none" }}
              >
                {activeData.length === 0 ? (
                  <p
                    className="font-sans py-3"
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}
                  >
                    No locations in this category
                  </p>
                ) : (
                  activeData.map((loc, i) => (
                    <TrendingCard
                      key={String(loc.id)}
                      location={loc}
                      rank={i + 1}
                      tab={activeTab}
                      onClick={() => { onSelectLocation(loc); setOpen(false); }}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TrendingCard({
  location,
  rank,
  tab,
  onClick,
}: {
  location: Location;
  rank: number;
  tab: TrendTab;
  onClick: () => void;
}) {
  const riskStyle = RISK_COLORS[location.riskLevel];
  const meta = CATEGORY_META[location.category];
  const isExtreme = location.riskLevel === "extreme";

  const fScore  = freshnessScore(location);
  const tScore  = trendingScore(location);
  const tier    = freshnessTier(fScore);
  const tierMeta = tier ? FRESHNESS_META[tier] : null;

  const displayScore =
    tab === "fresh"    ? Math.round(fScore) :
    tab === "trending" ? Math.round(tScore) :
    tab === "danger"   ? location.abandonmentScore :
    tab === "decay"    ? location.abandonmentScore :
    location.abandonmentScore;

  const scoreColor =
    displayScore >= 85 ? "#f43f5e" :
    displayScore >= 70 ? "#FA4817" :
    displayScore >= 55 ? "#f59e0b" :
    "#6b7280";

  const badge =
    tab === "newest" ? (location.closureDate ?? location.createdAt?.slice(0, 7) ?? "—") :
    tab === "danger" ? riskStyle.label :
    `${displayScore}`;

  const alert = isDecayAlert(location);

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 rounded-xl text-left relative overflow-hidden"
      style={{
        width: 144,
        background: alert
          ? "rgba(244,63,94,0.04)"
          : isExtreme
          ? "rgba(244,63,94,0.03)"
          : "rgba(255,255,255,0.03)",
        border: alert
          ? "1px solid rgba(244,63,94,0.18)"
          : isExtreme
          ? "1px solid rgba(244,63,94,0.12)"
          : "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
        fontFamily: FONT,
      }}
    >
      {/* Top color strip */}
      <div
        className="h-[1.5px] w-full"
        style={{
          background: tierMeta
            ? `linear-gradient(90deg, ${tierMeta.color}99 0%, transparent 100%)`
            : `linear-gradient(90deg, ${riskStyle.color}88 0%, transparent 100%)`,
        }}
      />

      <div className="p-3">
        {/* Rank + score */}
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)", fontWeight: 600 }}>
            #{rank}
          </span>
          {alert && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <AlertOctagon className="w-3 h-3" style={{ color: "#f43f5e" }} />
            </motion.div>
          )}
          {!alert && (
            <span
              className="font-sans font-bold tabular-nums"
              style={{ fontSize: "16px", color: scoreColor, lineHeight: 1, fontFamily: DISPLAY_FONT }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Name */}
        <div className="flex items-center gap-1 mb-2">
          <span style={{ fontSize: "11px" }}>{meta.emoji}</span>
          <p
            className="font-sans font-medium text-white leading-tight truncate"
            style={{ fontSize: "11px", letterSpacing: "-0.01em" }}
          >
            {location.name}
          </p>
        </div>

        {/* Freshness badge OR risk pill */}
        {tierMeta && (tab === "fresh" || tab === "trending") ? (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              fontSize: "9px",
              fontWeight: 600,
              background: tierMeta.bg,
              color: tierMeta.color,
              border: `1px solid ${tierMeta.border}`,
            }}
          >
            {tierMeta.shortLabel}
          </span>
        ) : (
          <span
            className="inline-block px-2 py-0.5 rounded-full capitalize"
            style={{
              fontSize: "9px",
              fontWeight: 600,
              background: riskStyle.bg,
              color: riskStyle.color,
              border: `1px solid ${riskStyle.border}33`,
            }}
          >
            {riskStyle.label}
          </span>
        )}
      </div>
    </motion.button>
  );
}
