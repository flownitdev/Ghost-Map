import { motion } from "framer-motion";
import type { RankDefinition } from "@/types/rank";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

interface RankBadgeProps {
  rank: RankDefinition;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

export function RankBadge({ rank, size = "md", showLabel = true, animated = true }: RankBadgeProps) {
  const sizes = {
    sm: { emoji: "12px", text: "10px", px: "6px", py: "3px", gap: "4px" },
    md: { emoji: "13px", text: "11px", px: "8px", py: "4px", gap: "5px" },
    lg: { emoji: "16px", text: "13px", px: "10px", py: "5px", gap: "6px" },
  }[size];

  const badge = (
    <div
      className="inline-flex items-center rounded-full"
      style={{
        gap: sizes.gap,
        padding: `${sizes.py} ${sizes.px}`,
        background: `${rank.color}14`,
        border: `1px solid ${rank.color}33`,
        color: rank.color,
      }}
    >
      <span style={{ fontSize: sizes.emoji, lineHeight: 1 }}>{rank.emoji}</span>
      {showLabel && (
        <span style={{ fontSize: sizes.text, fontWeight: 600, fontFamily: FONT, letterSpacing: "-0.01em" }}>
          {rank.label}
        </span>
      )}
    </div>
  );

  if (!animated) return badge;

  return (
    <motion.div
      className="inline-flex"
      whileHover={{ scale: 1.04 }}
      style={{ filter: `drop-shadow(0 0 6px ${rank.glowColor})` }}
    >
      {badge}
    </motion.div>
  );
}

export function RankProgressBar({
  rank,
  nextRank,
  totalPoints,
}: {
  rank: RankDefinition;
  nextRank: RankDefinition | null;
  totalPoints: number;
}) {
  if (!nextRank || rank.tier === "Admin" || rank.tier === "Phantom") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full" style={{ background: `${rank.color}33` }}>
          <div className="h-full w-full rounded-full" style={{ background: rank.color }} />
        </div>
        <span style={{ fontSize: "10px", color: rank.color, fontFamily: FONT }}>MAX</span>
      </div>
    );
  }

  const progress = Math.min(
    ((totalPoints - rank.minPoints) / (nextRank.minPoints - rank.minPoints)) * 100,
    100
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
          {totalPoints} / {nextRank.minPoints} pts to {nextRank.emoji} {nextRank.label}
        </span>
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${rank.color}88, ${rank.color})` }}
        />
      </div>
    </div>
  );
}
