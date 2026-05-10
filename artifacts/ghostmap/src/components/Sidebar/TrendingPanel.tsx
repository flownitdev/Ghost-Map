import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, AlertTriangle, ChevronUp, Sparkles } from "lucide-react";
import type { Location } from "@/types/location";
import { RISK_COLORS, CATEGORY_META, isFreshLocation } from "@/lib/mapUtils";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";
type TrendTab = "hottest" | "recent" | "critical";

interface TrendingPanelProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

export function TrendingPanel({ locations, onSelectLocation }: TrendingPanelProps) {
  const [activeTab, setActiveTab] = useState<TrendTab>("hottest");
  const [open, setOpen] = useState(false);

  const trending = useMemo(() => {
    const hottest = [...locations].sort((a, b) => b.abandonmentScore - a.abandonmentScore).slice(0, 5);
    const recent = [...locations].sort((a, b) => b.lastVisited.localeCompare(a.lastVisited)).slice(0, 5);
    const critical = locations
      .filter((l) => l.riskLevel === "extreme" || l.riskLevel === "high")
      .sort((a, b) => b.abandonmentScore - a.abandonmentScore)
      .slice(0, 5);
    return { hottest, recent, critical };
  }, [locations]);

  const tabs: { id: TrendTab; label: string; icon: React.ReactNode; data: Location[] }[] = [
    { id: "hottest",  label: "Hottest",  icon: <Flame className="w-3 h-3" />,        data: trending.hottest  },
    { id: "recent",   label: "Recent",   icon: <Clock className="w-3 h-3" />,         data: trending.recent   },
    { id: "critical", label: "Danger",   icon: <AlertTriangle className="w-3 h-3" />, data: trending.critical },
  ];

  const activeData = tabs.find((t) => t.id === activeTab)?.data ?? [];
  const freshCount = locations.filter((l) => isFreshLocation(l.createdAt)).length;

  if (locations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed z-[999] left-1/2 -translate-x-1/2"
      style={{ bottom: 84, width: "min(520px, calc(100vw - 56px))" }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(18,17,24,0.82)",
          backdropFilter: "blur(48px) saturate(1.6)",
          WebkitBackdropFilter: "blur(48px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.45), 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Compact header row */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className="font-sans font-semibold"
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontFamily: FONT, letterSpacing: "-0.01em" }}
          >
            Trending Zones
          </span>

          {freshCount > 0 && (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Sparkles className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.4)" }} />
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: FONT }}>{freshCount} new</span>
            </div>
          )}

          {/* Tab pills */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg ml-1"
            style={{ background: "rgba(255,255,255,0.05)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (!open) setOpen(true); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md transition-all duration-150"
                style={{
                  fontSize: "10.5px",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontFamily: FONT,
                  cursor: "pointer",
                  background: activeTab === tab.id ? "rgba(250,72,23,0.14)" : "transparent",
                  color: activeTab === tab.id ? "#FA4817" : "rgba(255,255,255,0.3)",
                  border: activeTab === tab.id ? "1px solid rgba(250,72,23,0.22)" : "1px solid transparent",
                  letterSpacing: "-0.01em",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
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

        {/* Expanded location list */}
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
                      key={loc.id}
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

function TrendingCard({ location, rank, tab, onClick }: { location: Location; rank: number; tab: TrendTab; onClick: () => void }) {
  const riskStyle = RISK_COLORS[location.riskLevel];
  const meta = CATEGORY_META[location.category];
  const isExtreme = location.riskLevel === "extreme";

  const score = location.abandonmentScore;
  const scoreColor = score >= 85 ? "#f43f5e" : score >= 70 ? "#FA4817" : score >= 55 ? "#f59e0b" : "#6b7280";

  const badge =
    tab === "recent" ? location.lastVisited
    : tab === "critical" ? riskStyle.label
    : `${score}`;

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 rounded-xl text-left relative overflow-hidden"
      style={{
        width: 140,
        background: isExtreme ? "rgba(244,63,94,0.04)" : "rgba(255,255,255,0.03)",
        border: isExtreme ? "1px solid rgba(244,63,94,0.15)" : "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
        fontFamily: FONT,
      }}
    >
      {/* Top color strip */}
      <div className="h-[1.5px] w-full" style={{ background: `linear-gradient(90deg, ${riskStyle.color}88 0%, transparent 100%)` }} />

      <div className="p-3">
        {/* Rank + score */}
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)", fontWeight: 600 }}>
            #{rank}
          </span>
          <span
            className="font-sans font-bold tabular-nums"
            style={{ fontSize: "16px", color: scoreColor, lineHeight: 1, fontFamily: DISPLAY_FONT }}
          >
            {badge}
          </span>
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

        {/* Risk pill */}
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
      </div>
    </motion.button>
  );
}
