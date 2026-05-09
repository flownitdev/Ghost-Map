import { motion } from "framer-motion";
import { GhostMap, FilterBar } from "@/components/Map";
import { LocationPanel, HudOverlay } from "@/components/Sidebar";
import { useMapLocations } from "@/hooks/useMapLocations";

export function MapPage() {
  const {
    filteredLocations,
    selectedLocation,
    activeCategory,
    searchQuery,
    visibleCount,
    totalCount,
    setActiveCategory,
    setSearchQuery,
    selectLocation,
    clearSelection,
  } = useMapLocations();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[100dvh] overflow-hidden bg-[#111012] relative"
    >
      <HudOverlay />

      <FilterBar
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        visibleCount={visibleCount}
        totalCount={totalCount}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
      />

      <GhostMap
        locations={filteredLocations}
        selectedLocation={selectedLocation}
        onSelectLocation={selectLocation}
      />

      <LocationPanel
        location={selectedLocation}
        onClose={clearSelection}
      />
    </motion.div>
  );
}

export default MapPage;
