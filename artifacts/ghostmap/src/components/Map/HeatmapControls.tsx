import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ChevronDown, ChevronUp } from "lucide-react";
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
      transition={{ delay: 0.9, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-5 right-5 z-[1000]"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(16,15,22,0.94) 0%, rgba(12,11,17,0.92) 100%)",
          backdropFilter: "blur(28px) saturate(1.6)",
          WebkitBackdropFilter: "blur(28px) saturate(1.6)",
          border: visible
            ? "1px solid rgba(168,85,247,0.28)"
            : "1px solid rgba(255,255,255,0.07)",
          boxShadow: visible
            ? "0 8px 32px rgba(0,0,0,0.55), 0 0 20px rgba(168,85,247,0.07)"
            : "0 8px 32px rgba(0,0,0,0.55)",
          transition: "border-color 0.2s, box-shadow 0.2s",
          minWidth: 188,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          {/* Icon */}
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: visible ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.05)",
              border: visible ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.08)",
              transition: "all 0.2s",
            }}
          >
            <Flame
              className="w-3 h-3"
              style={{
                color: visible ? "#A855F7" : "rgba(255,255,255,0.28)",
                transition: "color 0.2s",
              }}
            />
          </div>

          {/* Label */}
          <span
            className="font-sans font-semibold flex-1"
            style={{
              fontSize: "10px",
              letterSpacing: "0.14em",
              color: visible ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.3)",
              transition: "color 0.2s",
            }}
          >
            HEATMAP
          </span>

          {/* Toggle pill */}
          <button
            onClick={onToggle}
            className="relative flex-shrink-0 rounded-full transition-all duration-200"
            style={{
              width: 28,
              height: 16,
              background: visible ? "rgba(168,85,247,0.55)" : "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
            }}
            aria-label="Toggle heatmap"
          >
            <span
              className="absolute top-[2px] rounded-full"
              style={{
                width: 10,
                height: 10,
                background: visible ? "#A855F7" : "rgba(255,255,255,0.35)",
                left: visible ? "calc(100% - 12px)" : 2,
                boxShadow: visible ? "0 0 8px rgba(168,85,247,0.9)" : "none",
                transition: "all 0.2s",
              }}
            />
          </button>

          {/* Expand chevron */}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ color: "rgba(255,255,255,0.25)", cursor: "pointer", marginLeft: 2 }}
            aria-label="Expand controls"
          >
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Expanded sliders */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className="px-3.5 pb-3.5 pt-2 space-y-3.5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                {/* Intensity slider */}
                <SliderRow
                  label="INTENSITY"
                  value={Math.round(intensity * 100)}
                  unit="%"
                  min={20}
                  max={100}
                  disabled={!visible}
                  onChange={(v) => onIntensityChange(v / 100)}
                />
                {/* Radius slider */}
                <SliderRow
                  label="RADIUS"
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
    <div style={{ opacity: disabled ? 0.38 : 1, transition: "opacity 0.2s" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="font-sans"
          style={{ fontSize: "8.5px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.32)" }}
        >
          {label}
        </span>
        <span
          className="font-title font-bold tabular-nums"
          style={{ fontSize: "10px", color: disabled ? "rgba(255,255,255,0.2)" : "#A855F7" }}
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
        style={{ accentColor: "#A855F7", cursor: disabled ? "not-allowed" : "pointer" }}
      />
    </div>
  );
}
