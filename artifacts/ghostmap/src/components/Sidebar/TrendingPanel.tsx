import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Flame, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
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
    const sorted = [...locations];
    const hottest = [...sorted]
      .sort((a, b) => b.abandonmentScore - a.abandonmentScore)
      .slice(0, 6);
    const recent = [...sorted]
      .sort((a, b) => b.lastVisited.localeCompare(a.lastVisited))
      .slice(0, 6);
    const critical = sorted
      .filter((l) => l.riskLevel === "high")
      .sort((a, b) => b.abandonmentScore - a.abandonmentScore)
      .slice(0, 6);
    return { hottest, recent, critical };
  }, [locations]);

  const tabs: { id: TrendTab; label: string; icon: React.ReactNode; data: Location[] }[] = [
    { id: "hottest", label: "Hottest", icon: <Flame className="w-2.5 h-2.5" />, data: trending.hottest },
    { id: "recent",  label: "Recent",  icon: <Clock className="w-2.5 h-2.5" />,     data: trending.recent  },
    { id: "critical",label: "Critical",icon: <AlertTriangle className="w-2.5 h-2.5" />, data: trending.critical },
  ];

  const activeData = tabs.find((t) => t.id === activeTab)?.data ?? [];

  if (locations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed z-[999] left-1/2 -translate-x-1/2"
      style={{
        bottom: 96,
        width: "min(620px, calc(100vw - 56px))",
      }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(16,15,22,0.94) 0%, rgba(12,11,17,0.92) 100%)",
          backdropFilter: "blur(32px) saturate(1.7)",
          WebkitBackdropFilter: "blur(32px) saturate(1.7)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Top accent line */}
        <div
          className="h-[1px] w-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.5) 50%, transparent 100%)",
          }}
        />

        {/* Header row */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none"
          onClick={() => setCollapsed((v) => !v)}
        >
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <TrendingUp className="w-3 h-3" style={{ color: "#A855F7" }} />
            </motion.div>
            <span
              className="font-sans font-semibold"
              style={{
                fontSize: "9.5px",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              TRENDING URBEX ZONES
            </span>
          </div>

          {/* Tab pills */}
          <div className="flex items-center gap-1 ml-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab(tab.id);
                  if (collapsed) setCollapsed(false);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-150"
                style={{
                  fontSize: "8.5px",
                  letterSpacing: "0.05em",
                  fontWeight: 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  background: activeTab === tab.id ? "rgba(168,85,247,0.16)" : "transparent",
                  border: activeTab === tab.id ? "1px solid rgba(168,85,247,0.32)" : "1px solid transparent",
                  color: activeTab === tab.id ? "#A855F7" : "rgba(255,255,255,0.3)",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex-shrink-0" style={{ color: "rgba(255,255,255,0.22)" }}>
            {collapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
        </div>

        {/* Cards strip */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className="flex gap-2.5 px-4 pb-3.5 pt-1 overflow-x-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {activeData.length === 0 ? (
                  <p
                    className="font-sans py-3"
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.22)" }}
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
    location.abandonmentScore >= 80
      ? "#A855F7"
      : location.abandonmentScore >= 55
      ? "#c084fc"
      : "#4ade80";

  const badgeLabel =
    tab === "recent"
      ? location.lastVisited
      : tab === "critical"
      ? "HIGH RISK"
      : `${location.abandonmentScore}%`;

  return (
    <motion.button
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.975 }}
      onClick={onClick}
      className="flex-shrink-0 rounded-xl overflow-hidden text-left"
      style={{
        width: 150,
        background: "rgba(255,255,255,0.028)",
        border: "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,85,247,0.28)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.06)";
      }}
    >
      {/* Risk colour strip */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, ${riskStyle.color} 0%, transparent 100%)`,
        }}
      />

      <div className="p-3">
        {/* Rank + score */}
        <div className="flex items-start justify-between mb-1.5">
          <span
            className="font-title font-bold"
            style={{ fontSize: "10px", color: "rgba(255,255,255,0.16)", lineHeight: 1 }}
          >
            #{rank}
          </span>
          <span
            className="font-title font-bold tabular-nums"
            style={{ fontSize: "14px", color: scoreColor, lineHeight: 1 }}
          >
            {location.abandonmentScore}
          </span>
        </div>

        {/* Name */}
        <p
          className="font-sans font-medium text-white leading-snug mb-2"
          style={{
            fontSize: "10.5px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {location.name}
        </p>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="px-1.5 py-0.5 rounded font-sans"
            style={{
              fontSize: "7.5px",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              background: riskStyle.bg,
              color: riskStyle.color,
              border: `1px solid ${riskStyle.border}44`,
            }}
          >
            {location.riskLevel}
          </span>
          <span
            className="font-sans tabular-nums"
            style={{ fontSize: "8px", color: "rgba(255,255,255,0.22)" }}
          >
            {badgeLabel}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
