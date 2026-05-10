import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_META } from "@/lib/mapUtils";
import type { CategoryFilter } from "@/hooks/useMapLocations";
import type { LocationCategory } from "@/types/location";

const CATEGORIES: LocationCategory[] = ["factory", "hospital", "mall", "school", "tunnel", "industrial"];
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

interface FilterBarProps {
  activeCategory: CategoryFilter;
  searchQuery: string;
  visibleCount: number;
  totalCount: number;
  onCategoryChange: (category: CategoryFilter) => void;
  onSearchChange: (query: string) => void;
}

export function FilterBar({
  activeCategory,
  searchQuery,
  visibleCount,
  totalCount,
  onCategoryChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] flex flex-col items-center gap-2"
      style={{ width: "min(560px, calc(100vw - 56px))" }}
      data-testid="filter-bar"
    >
      {/* Search bar */}
      <div
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl"
        style={{
          background: "rgba(18,17,24,0.76)",
          backdropFilter: "blur(48px) saturate(1.6)",
          WebkitBackdropFilter: "blur(48px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.22)" }} />

        <input
          type="text"
          placeholder="Search locations…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-sans"
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.88)",
            caretColor: "#FA4817",
            fontFamily: FONT,
            letterSpacing: "-0.01em",
          }}
          data-testid="search-input"
        />

        <AnimatePresence mode="wait">
          {searchQuery ? (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ duration: 0.1 }}
              onClick={() => onSearchChange("")}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", border: "none" }}
              data-testid="clear-search"
            >
              <X className="w-3 h-3" />
            </motion.button>
          ) : (
            <motion.span
              key="count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-shrink-0 font-sans tabular-nums"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.22)", fontFamily: FONT }}
            >
              {visibleCount === totalCount ? totalCount : (
                <><span style={{ color: "#FA4817" }}>{visibleCount}</span>/{totalCount}</>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Category pills */}
      <div
        className="flex items-center gap-0.5 p-0.5 rounded-xl"
        style={{
          background: "rgba(18,17,24,0.7)",
          backdropFilter: "blur(48px)",
          WebkitBackdropFilter: "blur(48px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        <SegmentPill
          label="All"
          color="#FA4817"
          isActive={activeCategory === "all"}
          onClick={() => onCategoryChange("all")}
          testId="filter-all"
        />
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <SegmentPill
              key={cat}
              label={meta.label}
              color={meta.color}
              isActive={activeCategory === cat}
              onClick={() => onCategoryChange(cat)}
              testId={`filter-${cat}`}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

function SegmentPill({
  label,
  color,
  isActive,
  onClick,
  testId,
}: {
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      transition={{ duration: 0.1 }}
      className="relative px-3 py-1.5 rounded-lg font-sans transition-colors duration-150"
      style={{
        fontSize: "11.5px",
        fontWeight: isActive ? 600 : 400,
        background: "transparent",
        color: isActive ? color : "rgba(255,255,255,0.32)",
        cursor: "pointer",
        border: "none",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
        letterSpacing: "-0.01em",
      }}
      data-testid={testId}
    >
      {isActive && (
        <motion.span
          layoutId="pill-active"
          className="absolute inset-0 rounded-lg"
          style={{
            background: `${color}14`,
            border: `1px solid ${color}28`,
          }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
      )}
      <span className="relative">{label}</span>
    </motion.button>
  );
}
