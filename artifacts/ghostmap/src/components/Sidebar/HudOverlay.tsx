import { Radar } from "lucide-react";
import { motion } from "framer-motion";
import { getLocations } from "@/data/locationService";

const locations = getLocations();
const highRisk = locations.filter((l) => l.riskLevel === "high").length;

export function HudOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
      className="fixed top-5 left-5 z-[1000] pointer-events-none"
      data-testid="hud-overlay"
    >
      <div
        className="flex items-center gap-4 pl-3.5 pr-5 py-3 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(14,13,20,0.88) 0%, rgba(11,10,16,0.82) 100%)",
          backdropFilter: "blur(28px) saturate(1.6)",
          WebkitBackdropFilter: "blur(28px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Radar icon with concentric pulse rings */}
        <div className="relative flex items-center justify-center w-9 h-9 flex-shrink-0">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                inset: `-${i * 3}px`,
                border: "1px solid rgba(168,85,247,0.3)",
                animation: `ghost-ripple 2.4s ease-out ${i * 0.7}s infinite`,
              }}
            />
          ))}
          <div
            className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
            style={{
              background: "rgba(168,85,247,0.14)",
              border: "1px solid rgba(168,85,247,0.28)",
              boxShadow: "0 0 12px rgba(168,85,247,0.2)",
            }}
          >
            <Radar
              className="w-4 h-4"
              style={{ color: "#A855F7", animation: "spin 6s linear infinite" }}
            />
          </div>
        </div>

        {/* Brand */}
        <div className="min-w-0">
          <h1
            className="font-title font-bold tracking-[0.2em] text-white leading-none"
            style={{ fontSize: "0.95rem", letterSpacing: "0.18em" }}
          >
            GHOSTMAP
          </h1>
          <p
            className="font-sans uppercase leading-none mt-[5px]"
            style={{ fontSize: "8.5px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)" }}
          >
            Urban Exploration
          </p>
        </div>

        {/* Divider */}
        <div
          className="flex-shrink-0 w-px h-7 mx-0.5"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p
              className="font-title font-bold leading-none"
              style={{ fontSize: "1rem", color: "#A855F7" }}
            >
              {locations.length}
            </p>
            <p
              className="font-sans uppercase leading-none mt-[5px]"
              style={{ fontSize: "7.5px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)" }}
            >
              Sites
            </p>
          </div>

          <div className="text-center">
            <p
              className="font-title font-bold leading-none"
              style={{ fontSize: "1rem", color: "#A855F7" }}
            >
              {highRisk}
            </p>
            <p
              className="font-sans uppercase leading-none mt-[5px]"
              style={{ fontSize: "7.5px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)" }}
            >
              Critical
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
