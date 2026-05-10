import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_META } from "@/lib/mapUtils";
import type { CategoryFilter } from "@/hooks/useMapLocations";
import type { LocationCategory } from "@/types/location";

const CATEGORIES: LocationCategory[] = ["factory", "hospital", "mall", "school", "tunnel", "industrial"];

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
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.25 }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] flex flex-col items-center gap-2.5"
      style={{ width: "min(600px, calc(100vw - 56px))" }}
      data-testid="filter-bar"
    >
      {/* Search bar */}
      <div
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(28,28,30,0.82)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.28)" }} />

        <input
          type="text"
          placeholder="Search locations"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-sans"
          style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.9)",
            caretColor: "#A855F7",
          }}
          data-testid="search-input"
        />

        <AnimatePresence>
          {searchQuery ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ duration: 0.1 }}
              onClick={() => onSearchChange("")}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.55)" }}
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
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.28)" }}
            >
              {visibleCount === totalCount ? totalCount : (
                <><span style={{ color: "#A855F7" }}>{visibleCount}</span>/{totalCount}</>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Category segment row */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{
          background: "rgba(28,28,30,0.78)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.35)",
        }}
      >
        <SegmentPill
          label="All"
          color="#A855F7"
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
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.1 }}
      className="relative px-3 py-1.5 rounded-lg font-sans font-medium transition-colors duration-150"
      style={{
        fontSize: "12px",
        background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
        color: isActive ? color : "rgba(255,255,255,0.38)",
        cursor: "pointer",
        border: "none",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
        boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
        letterSpacing: "-0.01em",
      }}
      data-testid={testId}
    >
      {isActive && (
        <motion.span
          layoutId="pill-active"
          className="absolute inset-0 rounded-lg"
          style={{
            background: `${color}18`,
            border: `1px solid ${color}33`,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative">{label}</span>
    </motion.button>
  );
}
