import { motion, AnimatePresence } from "framer-motion";
import { Navigation, NavigationOff, Loader2 } from "lucide-react";
import type { GeoPosition } from "@/hooks/useGeolocation";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

interface GPSModeButtonProps {
  isTracking:    boolean;
  isSupported:   boolean;
  position:      GeoPosition | null;
  error:         string | null;
  onStart:       () => void;
  onStop:        () => void;
}

export function GPSModeButton({
  isTracking, isSupported, position, error, onStart, onStop,
}: GPSModeButtonProps) {
  const acquiring = isTracking && !position;

  return (
    <div
      className="fixed z-[1000]"
      style={{ bottom: "150px", left: "11px" }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={isTracking ? onStop : onStart}
          disabled={!isSupported}
          title={isTracking ? "Stop GPS mode" : "Start GPS exploration mode"}
          className="w-9 h-9 flex items-center justify-center rounded-lg"
          style={{
            background:    isTracking ? "rgba(74,222,128,0.15)" : "rgba(18,17,24,0.9)",
            border:        isTracking ? "1px solid rgba(74,222,128,0.4)"  : "1px solid rgba(255,255,255,0.12)",
            color:         isTracking ? "#4ade80" : "rgba(255,255,255,0.6)",
            boxShadow:     isTracking ? "0 0 12px rgba(74,222,128,0.25)" : "0 2px 8px rgba(0,0,0,0.4)",
            backdropFilter: "blur(20px)",
            cursor:        isSupported ? "pointer" : "not-allowed",
            opacity:       isSupported ? 1 : 0.4,
          }}
        >
          <AnimatePresence mode="wait">
            {acquiring ? (
              <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="w-4 h-4 animate-spin" />
              </motion.span>
            ) : isTracking ? (
              <motion.span key="on" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <Navigation className="w-4 h-4" style={{ fill: "#4ade80", opacity: 0.8 }} />
              </motion.span>
            ) : (
              <motion.span key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NavigationOff className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {isTracking && position && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 4 }}
              className="px-2 py-1 rounded-md text-center"
              style={{
                background: "rgba(10,9,14,0.88)",
                border: "1px solid rgba(74,222,128,0.2)",
                backdropFilter: "blur(20px)",
                fontFamily: FONT,
              }}
            >
              <p
                className="font-sans font-semibold tabular-nums"
                style={{ fontSize: "9px", color: "#4ade80", letterSpacing: "0.02em" }}
              >
                ±{Math.round(position.accuracy)}m
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="absolute left-11 top-0 w-44 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.25)",
                backdropFilter: "blur(20px)",
                fontFamily: FONT,
              }}
            >
              <p className="font-sans" style={{ fontSize: "10px", color: "#f43f5e", lineHeight: 1.5 }}>
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
