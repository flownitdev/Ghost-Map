import { motion } from "framer-motion";
import { ShieldCheck, HelpCircle, Building2, RefreshCcw } from "lucide-react";
import type { VerificationState } from "@/types/location";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

const CONFIG: Record<VerificationState, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  unverified: {
    label: "Unverified",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    icon: <HelpCircle className="w-2.5 h-2.5" />,
  },
  community_verified: {
    label: "Community Verified",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.22)",
    icon: <ShieldCheck className="w-2.5 h-2.5" />,
  },
  demolished: {
    label: "Demolished",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.2)",
    icon: <Building2 className="w-2.5 h-2.5" />,
  },
  active_again: {
    label: "Active Again",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.22)",
    icon: <RefreshCcw className="w-2.5 h-2.5" />,
  },
};

interface VerificationBadgeProps {
  state: VerificationState;
  size?: "sm" | "md";
  pulse?: boolean;
}

export function VerificationBadge({ state, size = "sm", pulse = false }: VerificationBadgeProps) {
  const cfg = CONFIG[state];
  return (
    <motion.span
      animate={pulse && state === "community_verified" ? { opacity: [0.7, 1, 0.7] } : {}}
      transition={{ duration: 2.5, repeat: Infinity }}
      className="inline-flex items-center gap-1 rounded-full"
      style={{
        paddingLeft: size === "md" ? "8px" : "6px",
        paddingRight: size === "md" ? "8px" : "6px",
        paddingTop: size === "md" ? "3px" : "2px",
        paddingBottom: size === "md" ? "3px" : "2px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        fontSize: size === "md" ? "11px" : "10px",
        fontFamily: FONT,
        fontWeight: 500,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </motion.span>
  );
}
