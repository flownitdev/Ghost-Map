import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, AlertTriangle, ChevronDown } from "lucide-react";
import type { Location } from "@/types/location";
import { RISK_COLORS } from "@/lib/mapUtils";

type TrendTab = "hottest" | "recent" | "critical";

interface TrendingPanelProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

export function TrendingPanel({ locations, onSelectLocation }: TrendingPanelProps) {
  const [activeTab, setActiveTab] = useState<TrendTab>("hottest");
  const [collapsed, setCollapsed] = useState(false);

  const trending = useMemo(() => {
    const hottest = [...locations]
      .sort((a, b) => b.abandonmentScore - a.abandonmentScore)
      .slice(0, 6);
    const recent = [...locations]
      .sort((a, b) => b.lastVisited.localeCompare(a.lastVisited))
      .slice(0, 6);
    const critical = locations
      .filter((l) => l.riskLevel === "high")
      .sort((a, b) => b.abandonmentScore - a.abandonmentScore)
      .slice(0, 6);
    return { hottest, recent, critical };
  }, [locations]);

  const tabs: { id: TrendTab; label: string; icon: React.ReactNode; data: Location[] }[] = [
    { id: "hottest",  label: "Hottest",  icon: <Flame className="w-3 h-3" />,         data: trending.hottest  },
    { id: "recent",   label: "Recent",   icon: <Clock className="w-3 h-3" />,          data: trending.recent   },
    { id: "critical", label: "Critical", icon: <AlertTriangle className="w-3 h-3" />,  data: trending.critical },
  ];

  const activeData = tabs.find((t) => t.id === activeTab)?.data ?? [];

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
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
          onClick={() => setCollapsed((v) => !v)}
        >
          {/* Title */}
          <span
            className="font-sans font-semibold"
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.75)",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            Trending Zones
          </span>

          {/* Segmented tabs */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg ml-1"
            style={{ background: "rgba(255,255,255,0.06)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (collapsed) setCollapsed(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-150"
                style={{
                  fontSize: "11px",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                  cursor: "pointer",
                  background: activeTab === tab.id ? "rgba(168,85,247,0.18)" : "transparent",
                  color: activeTab === tab.id ? "#A855F7" : "rgba(255,255,255,0.35)",
                  border: activeTab === tab.id ? "1px solid rgba(168,85,247,0.25)" : "1px solid transparent",
                  letterSpacing: "-0.01em",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex-shrink-0">
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.22 }}
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
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
              <div
                className="flex gap-2 px-4 pb-4 pt-0.5 overflow-x-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {activeData.length === 0 ? (
                  <p
                    className="font-sans py-4"
                    style={{ fontSize: "13px", color: "rgba(255,255,255,0.22)" }}
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
                      onClick={() => onSelectLocation(loc)}
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
  const scoreColor =
    location.abandonmentScore >= 80 ? "#A855F7"
    : location.abandonmentScore >= 55 ? "#c084fc"
    : "#4ade80";

  const meta =
    tab === "recent" ? location.lastVisited
    : tab === "critical" ? "High risk"
    : `Score ${location.abandonmentScore}`;

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 rounded-2xl overflow-hidden text-left"
      style={{
        width: 148,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
      }}
    >
      {/* Risk strip */}
      <div
        className="h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${riskStyle.color} 0%, transparent 100%)` }}
      />

      <div className="p-3">
        {/* Rank + score */}
        <div className="flex items-start justify-between mb-2">
          <span
            className="font-sans tabular-nums"
            style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", fontWeight: 600 }}
          >
            #{rank}
          </span>
          <span
            className="font-sans font-bold tabular-nums"
            style={{ fontSize: "16px", color: scoreColor, lineHeight: 1 }}
          >
            {location.abandonmentScore}
          </span>
        </div>

        {/* Name */}
        <p
          className="font-sans font-medium text-white leading-snug mb-2"
          style={{
            fontSize: "11.5px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            letterSpacing: "-0.01em",
          }}
        >
          {location.name}
        </p>

        {/* Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className="px-2 py-0.5 rounded-full font-sans text-xs"
            style={{
              fontSize: "10px",
              fontWeight: 500,
              background: riskStyle.bg,
              color: riskStyle.color,
              border: `1px solid ${riskStyle.border}44`,
              textTransform: "capitalize",
            }}
          >
            {location.riskLevel}
          </span>
          <span className="font-sans" style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
            {meta}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
