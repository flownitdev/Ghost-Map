import { X, Calendar, MapPin, AlertTriangle, Navigation } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Location } from "@/types/location";
import { RISK_COLORS } from "@/lib/mapUtils";

interface LocationPanelProps {
  location: Location | null;
  onClose: () => void;
}

const panelVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 28, stiffness: 220, mass: 0.8 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { type: "spring", damping: 32, stiffness: 260, mass: 0.6 },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function LocationPanel({ location, onClose }: LocationPanelProps) {
  const riskStyle = location ? RISK_COLORS[location.risk] : null;

  return (
    <AnimatePresence mode="wait">
      {location && riskStyle && (
        <motion.div
          key={location.id}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed right-0 top-0 h-[100dvh] w-full md:w-[400px] z-[1000] flex flex-col"
          style={{
            background:
              "linear-gradient(135deg, rgba(17,16,18,0.88) 0%, rgba(17,16,18,0.80) 100%)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
          }}
          data-testid="location-panel"
        >
          {/* Accent glow strip at top */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="h-[2px] w-full origin-left"
            style={{ background: `linear-gradient(90deg, ${riskStyle.color}, transparent)` }}
          />

          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col flex-1 overflow-hidden p-7"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5 font-sans">
                  Location Intel
                </p>
                <h2 className="font-title text-[1.4rem] font-bold text-white leading-tight">
                  {location.name}
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={onClose}
                className="mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:border-white/20 transition-colors"
                data-testid="close-panel"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-7">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span>{location.category}</span>
              </div>

              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                style={{
                  borderColor: riskStyle.border,
                  color: riskStyle.color,
                  backgroundColor: riskStyle.bg,
                  boxShadow: `0 0 12px ${riskStyle.bg}`,
                }}
                data-testid="risk-badge"
              >
                <AlertTriangle className="w-3 h-3" />
                RISK: {location.risk}
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div
              variants={itemVariants}
              className="h-px bg-white/6 mb-7"
            />

            {/* Description */}
            <motion.div variants={itemVariants} className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1">
              <p className="text-sm leading-[1.8] text-gray-400 font-sans">
                {location.description}
              </p>
            </motion.div>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="mt-6 pt-5 border-t border-white/8 space-y-3"
            >
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                <span>
                  Last scouted:{" "}
                  <strong className="text-gray-200 font-medium">{location.lastVisited}</strong>
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all"
                style={{
                  background: "rgba(250,72,23,0.12)",
                  border: "1px solid rgba(250,72,23,0.3)",
                  color: "#FA4817",
                }}
                data-testid="navigate-button"
              >
                <Navigation className="w-3.5 h-3.5" />
                Navigate to Location
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
