import { Search, X, SlidersHorizontal } from "lucide-react";
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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] flex flex-col items-center gap-2"
      style={{ width: "min(640px, calc(100vw - 48px))" }}
      data-testid="filter-bar"
    >
      {/* Search row */}
      <div
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(14,13,20,0.90) 0%, rgba(11,10,16,0.85) 100%)",
          backdropFilter: "blur(28px) saturate(1.6)",
          WebkitBackdropFilter: "blur(28px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />

        <input
          type="text"
          placeholder="Search locations…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm font-sans placeholder:text-xs"
          style={{
            color: "rgba(255,255,255,0.85)",
            caretColor: "#A855F7",
          }}
          data-testid="search-input"
        />

        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              onClick={() => onSearchChange("")}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
              data-testid="clear-search"
            >
              <X className="w-3 h-3" />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          className="flex-shrink-0 w-px h-4 mx-1"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <SlidersHorizontal className="w-3 h-3" style={{ color: "rgba(255,255,255,0.25)" }} />
          <span
            className="font-sans tabular-nums"
            style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}
          >
            <span style={{ color: visibleCount === totalCount ? "rgba(255,255,255,0.55)" : "#A855F7" }}>
              {visibleCount}
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>/{totalCount}</span>
          </span>
        </div>
      </div>

      {/* Category pills row */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* All pill */}
        <CategoryPill
          label="All"
          color="#A855F7"
          isActive={activeCategory === "all"}
          onClick={() => onCategoryChange("all")}
          testId="filter-all"
        />
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <CategoryPill
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

interface CategoryPillProps {
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
  testId: string;
}

function CategoryPill({ label, color, isActive, onClick, testId }: CategoryPillProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.12 }}
      className="px-3 py-1.5 rounded-full font-sans font-medium transition-all duration-150"
      style={{
        fontSize: "10.5px",
        letterSpacing: "0.05em",
        background: isActive
          ? `${color}22`
          : "rgba(12,11,17,0.82)",
        border: isActive
          ? `1px solid ${color}66`
          : "1px solid rgba(255,255,255,0.07)",
        color: isActive ? color : "rgba(255,255,255,0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: isActive ? `0 0 12px ${color}33` : "none",
      }}
      data-testid={testId}
    >
      {label}
    </motion.button>
  );
}
