import { motion, AnimatePresence } from "framer-motion";
import { Satellite, X, Loader2 } from "lucide-react";
import type { ScanState } from "@/hooks/useSatScanner";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

interface SatScannerButtonProps {
  scanState: ScanState;
  onScan: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export function SatScannerButton({ scanState, onScan, onCancel, onReset }: SatScannerButtonProps) {
  const isScanning = scanState === "scanning";
  const hasResults = scanState === "results";
  const isError = scanState === "error";

  function handleClick() {
    if (isScanning) { onCancel(); return; }
    if (hasResults || isError) { onReset(); return; }
    onScan();
  }

  const activeColor = isScanning ? "#4ade80" : hasResults ? "#A855F7" : isError ? "#f43f5e" : "rgba(255,255,255,0.7)";
  const activeBg = isScanning
    ? "rgba(74,222,128,0.12)"
    : hasResults
    ? "rgba(168,85,247,0.12)"
    : isError
    ? "rgba(244,63,94,0.1)"
    : "rgba(18,17,24,0.9)";
  const activeBorder = isScanning
    ? "rgba(74,222,128,0.35)"
    : hasResults
    ? "rgba(168,85,247,0.35)"
    : isError
    ? "rgba(244,63,94,0.3)"
    : "rgba(255,255,255,0.12)";

  return (
    <div
      className="fixed z-[1000]"
      style={{ bottom: "196px", left: "11px" }}
    >
      <motion.button
        whileHover={!isScanning ? { scale: 1.05 } : {}}
        whileTap={!isScanning ? { scale: 0.96 } : {}}
        onClick={handleClick}
        title={isScanning ? "Cancel scan" : hasResults ? "Clear scan results" : "Scan nearby area for abandoned structures"}
        className="w-9 h-9 flex items-center justify-center rounded-lg relative overflow-hidden"
        style={{
          background: activeBg,
          border: `1px solid ${activeBorder}`,
          color: activeColor,
          boxShadow: isScanning
            ? "0 0 14px rgba(74,222,128,0.2)"
            : hasResults
            ? "0 0 14px rgba(168,85,247,0.2)"
            : "0 2px 8px rgba(0,0,0,0.4)",
          backdropFilter: "blur(20px)",
          cursor: "pointer",
        }}
      >
        {isScanning && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "rgba(74,222,128,0.08)" }}
          />
        )}
        <AnimatePresence mode="wait">
          {isScanning ? (
            <motion.span key="scanning" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.span>
          ) : hasResults || isError ? (
            <motion.span key="clear" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <X className="w-4 h-4" />
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Satellite className="w-4 h-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            className="absolute left-11 top-0 whitespace-nowrap px-3 py-1.5 rounded-xl"
            style={{
              background: "rgba(10,9,14,0.9)",
              border: "1px solid rgba(74,222,128,0.2)",
              backdropFilter: "blur(20px)",
              fontFamily: FONT,
            }}
          >
            <p className="font-sans" style={{ fontSize: "10px", color: "#4ade80", letterSpacing: "0.04em", fontWeight: 600 }}>
              SCANNING AREA
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
