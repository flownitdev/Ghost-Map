import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ChevronDown } from "lucide-react";
import type { HeatmapSettings } from "@/hooks/useHeatmap";

interface HeatmapControlsProps {
  settings: HeatmapSettings;
  onToggle: () => void;
  onIntensityChange: (v: number) => void;
  onRadiusChange: (v: number) => void;
}

export function HeatmapControls({
  settings,
  onToggle,
  onIntensityChange,
  onRadiusChange,
}: HeatmapControlsProps) {
  const [expanded, setExpanded] = useState(false);
  const { visible, intensity, radius } = settings;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-5 right-5 z-[1000]"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(28,28,30,0.82)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
          border: visible
            ? "1px solid rgba(168,85,247,0.22)"
            : "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
          transition: "border-color 0.25s",
          minWidth: 180,
        }}
      >
        {/* Toggle row */}
        <div className="flex items-center gap-3 px-3.5 py-3">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: visible ? "rgba(168,85,247,0.16)" : "rgba(255,255,255,0.06)",
              transition: "background 0.25s",
            }}
          >
            <Flame
              className="w-3.5 h-3.5"
              style={{
                color: visible ? "#A855F7" : "rgba(255,255,255,0.3)",
                transition: "color 0.25s",
              }}
            />
          </div>

          <span
            className="font-sans flex-1"
            style={{
              fontSize: "13px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
              color: visible ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.38)",
              fontWeight: 500,
              transition: "color 0.25s",
              letterSpacing: "-0.01em",
            }}
          >
            Heatmap
          </span>

          {/* iOS-style toggle */}
          <button
            onClick={onToggle}
            className="relative flex-shrink-0 rounded-full transition-all duration-250"
            style={{
              width: 36,
              height: 22,
              background: visible ? "#A855F7" : "rgba(255,255,255,0.12)",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Toggle heatmap"
          >
            <motion.span
              layout
              className="absolute top-[3px] rounded-full"
              style={{
                width: 16,
                height: 16,
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                left: visible ? "calc(100% - 19px)" : 3,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          </button>

          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ color: "rgba(255,255,255,0.22)", cursor: "pointer", marginLeft: -2 }}
            aria-label="Expand controls"
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </button>
        </div>

        {/* Expanded sliders */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div
                className="px-3.5 pb-4 pt-3 space-y-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <SliderRow
                  label="Intensity"
                  value={Math.round(intensity * 100)}
                  unit="%"
                  min={20}
                  max={100}
                  disabled={!visible}
                  onChange={(v) => onIntensityChange(v / 100)}
                />
                <SliderRow
                  label="Radius"
                  value={radius}
                  unit="px"
                  min={20}
                  max={60}
                  disabled={!visible}
                  onChange={onRadiusChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SliderRow({
  label,
  value,
  unit,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ opacity: disabled ? 0.3 : 1, transition: "opacity 0.25s" }}>
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-sans"
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
            fontWeight: 400,
          }}
        >
          {label}
        </span>
        <span
          className="font-sans tabular-nums font-semibold"
          style={{
            fontSize: "12px",
            color: disabled ? "rgba(255,255,255,0.2)" : "#A855F7",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
          }}
        >
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full"
        style={{ accentColor: "#A855F7", cursor: disabled ? "not-allowed" : "pointer", height: 3 }}
      />
    </div>
  );
}
