import { useState, useMemo, useCallback } from "react";
import type { Location, LocationCategory } from "@/types/location";

export type CategoryFilter = LocationCategory | "all";

export interface MapLocationsState {
  filteredLocations: Location[];
  selectedLocation: Location | null;
  activeCategory: CategoryFilter;
  searchQuery: string;
  totalCount: number;
  visibleCount: number;
  setActiveCategory: (category: CategoryFilter) => void;
  setSearchQuery: (query: string) => void;
  selectLocation: (location: Location) => void;
  clearSelection: () => void;
}

export function useMapLocations(allLocations: Location[] = []): MapLocationsState {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allLocations.filter((loc) => {
      const matchesCategory =
        activeCategory === "all" || loc.category === activeCategory;
      const matchesSearch =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allLocations, activeCategory, searchQuery]);

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
    totalCount: allLocations.length,
    visibleCount: filteredLocations.length,
    setActiveCategory,
    setSearchQuery,
    selectLocation,
    clearSelection,
  };
}
