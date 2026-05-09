import { Radar } from "lucide-react";
import { motion } from "framer-motion";
import { getLocations } from "@/data/locationService";

const locations = getLocations();

export function HudOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      className="fixed top-6 left-6 z-[1000] pointer-events-none"
      data-testid="hud-overlay"
    >
      <div
        className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
        style={{
          background: "rgba(17,16,18,0.80)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Icon with pulse rings */}
        <div className="relative flex items-center justify-center w-10 h-10">
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(250,72,23,0.15)", animationDuration: "2s" }}
          />
          <span
            className="absolute inset-1 rounded-full animate-ping"
            style={{ background: "rgba(250,72,23,0.1)", animationDuration: "2s", animationDelay: "0.4s" }}
          />
          <div
            className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
            style={{ background: "rgba(250,72,23,0.18)", border: "1px solid rgba(250,72,23,0.3)" }}
          >
            <Radar
              className="w-5 h-5"
              style={{ color: "#FA4817", animation: "spin 5s linear infinite" }}
            />
          </div>
        </div>

        {/* Text */}
        <div>
          <h1 className="font-title text-[1.1rem] font-bold tracking-widest text-white leading-none m-0">
            GHOSTMAP
          </h1>
          <p className="font-sans text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.18em] leading-none">
            Urban Exploration Intelligence
          </p>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Location count */}
        <div className="text-right">
          <p
            className="font-title text-lg font-bold leading-none"
            style={{ color: "#FA4817" }}
          >
            {locations.length}
          </p>
          <p className="font-sans text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">
            Sites
          </p>
        </div>
      </div>
    </motion.div>
  );
}
