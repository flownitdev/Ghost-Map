import { motion } from "framer-motion";
import { getLocations } from "@/data/locationService";

const locations = getLocations();

export function HudOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
      className="fixed top-5 left-5 z-[1000] pointer-events-none"
      data-testid="hud-overlay"
    >
      <div
        className="flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-2xl"
        style={{
          background: "rgba(18,17,24,0.76)",
          backdropFilter: "blur(48px) saturate(1.5)",
          WebkitBackdropFilter: "blur(48px) saturate(1.5)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Ghost mark */}
        <span style={{ fontSize: "18px", lineHeight: 1 }}>👻</span>

        {/* Brand */}
        <div className="min-w-0">
          <h1
            className="font-title font-bold text-white leading-none"
            style={{ fontSize: "14px", letterSpacing: "0.14em" }}
          >
            GHOSTMAP
          </h1>
          <p
            className="font-sans leading-none mt-1"
            style={{ fontSize: "8px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}
          >
            Urban Exploration
          </p>
        </div>

        {/* Divider */}
        <div className="w-px h-6 flex-shrink-0" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* Site count */}
        <div>
          <p className="font-title font-bold leading-none text-white" style={{ fontSize: "15px" }}>
            {locations.length}
          </p>
          <p
            className="font-sans leading-none mt-1"
            style={{ fontSize: "8px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}
          >
            Sites
          </p>
        </div>
      </div>
    </motion.div>
  );
}
