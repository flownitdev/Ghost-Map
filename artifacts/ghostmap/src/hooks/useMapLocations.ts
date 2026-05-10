import { useState, useMemo, useCallback } from "react";
import type { Location, LocationCategory } from "@/types/location";
import { sortLocations, type SortMode } from "@/lib/freshness";

export type CategoryFilter = LocationCategory | "all";
export type { SortMode };

export interface MapLocationsState {
  filteredLocations: Location[];
  selectedLocation: Location | null;
  activeCategory: CategoryFilter;
  searchQuery: string;
  sortMode: SortMode;
  totalCount: number;
  visibleCount: number;
  setActiveCategory: (category: CategoryFilter) => void;
  setSearchQuery: (query: string) => void;
  setSortMode: (mode: SortMode) => void;
  selectLocation: (location: Location) => void;
  clearSelection: () => void;
}

export function useMapLocations(allLocations: Location[] = []): MapLocationsState {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("freshest");

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = allLocations.filter((loc) => {
      const matchesCategory =
        activeCategory === "all" || loc.category === activeCategory;
      const matchesSearch =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
    return sortLocations(filtered, sortMode);
  }, [allLocations, activeCategory, searchQuery, sortMode]);

  const selectLocation = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  return {
    filteredLocations,
    selectedLocation,
    activeCategory,
    searchQuery,
    sortMode,
    totalCount: allLocations.length,
    visibleCount: filteredLocations.length,
    setActiveCategory,
    setSearchQuery,
    setSortMode,
    selectLocation,
    clearSelection,
  };
}
