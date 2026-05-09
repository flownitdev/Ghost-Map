import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { GhostMap, FilterBar } from "@/components/Map";
import { AddLocationModal } from "@/components/Map/AddLocationModal";
import { LocationPanel } from "@/components/Sidebar";
import { useLocations } from "@/hooks/useLocations";
import { useMapLocations } from "@/hooks/useMapLocations";

export function MapPage() {
  const { locations, loadingState, addLocation } = useLocations();
  const [modalOpen, setModalOpen] = useState(false);

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
  } = useMapLocations(locations);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[100dvh] overflow-hidden bg-[#111012] relative"
    >
      <FilterBar
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        visibleCount={visibleCount}
        totalCount={totalCount}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
      />

      {/* Map — dim slightly while loading */}
      <div
        className="w-full h-full transition-opacity duration-500"
        style={{ opacity: loadingState === "loading" ? 0.7 : 1 }}
      >
        <GhostMap
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onSelectLocation={selectLocation}
        />
      </div>

      {/* Loading indicator */}
      <AnimatePresence>
        {loadingState === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-full font-sans"
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.5)",
              background: "rgba(17,16,18,0.88)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
            }}
          >
            Loading locations…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add location FAB */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.35, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08, boxShadow: "0 0 28px rgba(250,72,23,0.4)" }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-7 z-[1000] flex items-center gap-2 px-4 py-3 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(250,72,23,0.18) 0%, rgba(250,72,23,0.10) 100%)",
          border: "1px solid rgba(250,72,23,0.35)",
          color: "#FA4817",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 14px rgba(250,72,23,0.15)",
        }}
        data-testid="add-location-fab"
      >
        <Plus className="w-4 h-4" />
        <span
          className="font-sans font-semibold"
          style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}
        >
          Add Site
        </span>
      </motion.button>

      <LocationPanel location={selectedLocation} onClose={clearSelection} />

      <AddLocationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addLocation}
      />
    </motion.div>
  );
}

export default MapPage;
