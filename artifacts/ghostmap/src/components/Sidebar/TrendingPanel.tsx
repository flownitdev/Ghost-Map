import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, AlertTriangle, ChevronDown, Sparkles } from "lucide-react";
import type { Location } from "@/types/location";
import { RISK_COLORS, CATEGORY_META, isFreshLocation } from "@/lib/mapUtils";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
type TrendTab = "hottest" | "recent" | "critical";

interface TrendingPanelProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

export function TrendingPanel({ locations, onSelectLocation }: TrendingPanelProps) {
  const [activeTab, setActiveTab] = useState<TrendTab>("hottest");
  const [collapsed, setCollapsed] = useState(false);

  const trending = useMemo(() => {
    const hottest = [...locations].sort((a, b) => b.abandonmentScore - a.abandonmentScore).slice(0, 6);
    const recent = [...locations].sort((a, b) => b.lastVisited.localeCompare(a.lastVisited)).slice(0, 6);
    const critical = locations.filter((l) => l.riskLevel === "extreme" || l.riskLevel === "high")
      .sort((a, b) => b.abandonmentScore - a.abandonmentScore).slice(0, 6);
    return { hottest, recent, critical };
  }, [locations]);

  const tabs: { id: TrendTab; label: string; icon: React.ReactNode; data: Location[] }[] = [
    { id: "hottest",  label: "Hottest",  icon: <Flame className="w-3 h-3" />,         data: trending.hottest  },
    { id: "recent",   label: "Recent",   icon: <Clock className="w-3 h-3" />,          data: trending.recent   },
    { id: "critical", label: "Danger",   icon: <AlertTriangle className="w-3 h-3" />,  data: trending.critical },
  ];

  const activeData = tabs.find((t) => t.id === activeTab)?.data ?? [];
  const freshCount = locations.filter((l) => isFreshLocation(l.createdAt)).length;

  if (locations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed z-[999] left-1/2 -translate-x-1/2"
      style={{ bottom: 88, width: "min(600px, calc(100vw - 56px))" }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(28,28,30,0.88)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 -2px 24px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none" onClick={() => setCollapsed((v) => !v)}>
          <span className="font-sans font-semibold" style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", fontFamily: FONT, letterSpacing: "-0.01em" }}>
            Trending Zones
          </span>

          {/* Fresh count badge */}
          {freshCount > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)" }}
            >
              <Sparkles className="w-2.5 h-2.5" style={{ color: "#4ade80" }} />
              <span style={{ fontSize: "10px", color: "#4ade80", fontFamily: FONT, fontWeight: 600 }}>{freshCount} new</span>
            </motion.div>
          )}

          {/* Segmented tabs */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg ml-1"
            style={{ background: "rgba(255,255,255,0.06)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (collapsed) setCollapsed(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-150"
                style={{
                  fontSize: "11px", fontWeight: activeTab === tab.id ? 600 : 400, fontFamily: FONT, cursor: "pointer",
                  background: activeTab === tab.id ? "rgba(168,85,247,0.18)" : "transparent",
                  color: activeTab === tab.id ? "#A855F7" : "rgba(255,255,255,0.35)",
                  border: activeTab === tab.id ? "1px solid rgba(168,85,247,0.25)" : "1px solid transparent",
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex-shrink-0">
            <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.22 }} style={{ color: "rgba(255,255,255,0.2)" }}>
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </div>
        </div>

        {/* Cards */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 px-4 pb-4 pt-0.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {activeData.length === 0 ? (
                  <p className="font-sans py-4" style={{ fontSize: "13px", color: "rgba(255,255,255,0.22)", fontFamily: FONT }}>
                    No locations in this category
                  </p>
                ) : (
                  activeData.map((loc, i) => (
                    <TrendingCard key={loc.id} location={loc} rank={i + 1} tab={activeTab} onClick={() => onSelectLocation(loc)} />
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

function TrendingCard({ location, rank, tab, onClick }: { location: Location; rank: number; tab: TrendTab; onClick: () => void }) {
  const riskStyle = RISK_COLORS[location.riskLevel];
  const meta = CATEGORY_META[location.category];
  const isFresh = isFreshLocation(location.createdAt);
  const isExtreme = location.riskLevel === "extreme";

  const scoreColor =
    location.abandonmentScore >= 85 ? "#f43f5e"
    : location.abandonmentScore >= 70 ? "#A855F7"
    : location.abandonmentScore >= 55 ? "#c084fc"
    : "#4ade80";

  const badgeMeta =
    tab === "recent" ? location.lastVisited
    : tab === "critical" ? riskStyle.label
    : `Score ${location.abandonmentScore}`;

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 rounded-2xl overflow-hidden text-left relative"
      style={{
        width: 150,
        background: isExtreme ? "rgba(244,63,94,0.04)" : "rgba(255,255,255,0.04)",
        border: isExtreme ? "1px solid rgba(244,63,94,0.2)" : "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        fontFamily: FONT,
      }}
    >
      {/* Risk strip */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${riskStyle.color} 0%, transparent 100%)` }} />

      {/* Fresh badge */}
      {isFresh && (
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)" }}
        >
          <Sparkles className="w-2 h-2" style={{ color: "#4ade80" }} />
          <span style={{ fontSize: "7.5px", color: "#4ade80", fontWeight: 600 }}>NEW</span>
        </motion.div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>#{rank}</span>
          <span className="font-sans font-bold tabular-nums" style={{ fontSize: "17px", color: scoreColor, lineHeight: 1 }}>
            {location.abandonmentScore}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-1">
          <span style={{ fontSize: "12px" }}>{meta.emoji}</span>
          <p className="font-sans font-medium text-white leading-snug truncate" style={{ fontSize: "11px", letterSpacing: "-0.01em" }}>
            {location.name}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full font-sans capitalize"
            style={{ fontSize: "9px", fontWeight: 600, background: riskStyle.bg, color: riskStyle.color, border: `1px solid ${riskStyle.border}44` }}>
            {riskStyle.label}
          </span>
          <span className="font-sans" style={{ fontSize: "9px", color: "rgba(255,255,255,0.22)" }}>{badgeMeta}</span>
        </div>
      </div>
    </motion.button>
  );
}
