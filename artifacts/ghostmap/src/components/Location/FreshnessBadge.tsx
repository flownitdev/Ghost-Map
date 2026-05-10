import { motion } from "framer-motion";
import { Flame, Sparkles, TrendingUp, Wind } from "lucide-react";
import { freshnessScore, freshnessTier, FRESHNESS_META } from "@/lib/freshness";
import type { Location } from "@/types/location";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

const TIER_ICONS: Record<string, React.ReactNode> = {
  just_dropped: <Flame className="w-2.5 h-2.5" />,
  fresh:        <Sparkles className="w-2.5 h-2.5" />,
  trending:     <TrendingUp className="w-2.5 h-2.5" />,
  cooling:      <Wind className="w-2.5 h-2.5" />,
};

interface FreshnessBadgeProps {
  location: Location;
  size?: "sm" | "md";
}

export function FreshnessBadge({ location, size = "sm" }: FreshnessBadgeProps) {
  const score = freshnessScore(location);
  const tier = freshnessTier(score);
  if (!tier) return null;

  const meta = FRESHNESS_META[tier];
  const icon = TIER_ICONS[tier];
  const fontSize = size === "sm" ? "10px" : "11px";

  const baseStyle: React.CSSProperties = {
    fontSize,
    fontFamily: FONT,
    fontWeight: 600,
    color: meta.color,
    background: meta.bg,
    border: `1px solid ${meta.border}`,
    letterSpacing: "0.01em",
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    padding: "1px 7px",
    borderRadius: "999px",
  };

  if (tier === "just_dropped") {
    return (
      <motion.span
        animate={{ opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={baseStyle}
      >
        {icon}
        {meta.label}
      </motion.span>
    );
  }

  return <span style={baseStyle}>{icon}{meta.label}</span>;
}
