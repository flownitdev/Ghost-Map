import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { GhostMap, FilterBar } from "@/components/Map";
import { HeatmapControls } from "@/components/Map/HeatmapControls";
import { AddLocationModal } from "@/components/Map/AddLocationModal";
import { CinematicOverlay } from "@/components/Map/CinematicOverlay";
import { LocationPanel, TrendingPanel } from "@/components/Sidebar";
import { UserMenu } from "@/components/Auth/UserMenu";
import { ActivityFeed } from "@/components/Community/ActivityFeed";
import { useLocations } from "@/hooks/useLocations";
import { useMapLocations } from "@/hooks/useMapLocations";
import { useHeatmap } from "@/hooks/useHeatmap";
import { useUserLocations } from "@/hooks/useUserLocations";
import { useRank } from "@/hooks/useRank";
import { useAuth } from "@/contexts/AuthContext";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

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

  const { settings: heatmapSettings, toggle, setIntensity, setRadius } = useHeatmap();

  // Auth + rank
  const { user } = useAuth();
  const { savedIds, exploredIds } = useUserLocations();

  const exploredLocations = useMemo(
    () => locations.filter((l) => exploredIds.has(String(l.id))),
    [locations, exploredIds]
  );

  const stats = useRank({
    user,
    exploredLocations,
    savedIds,
    submittedLocations: [],
  });

  // Filter out admin-removed locations from visible map
  const adminRemovedIds = useMemo<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("gm-removed") ?? "[]") as string[]);
    } catch {
      return new Set();
    }
  }, []);

  const visibleLocations = useMemo(
    () => filteredLocations.filter((l) => !adminRemovedIds.has(String(l.id))),
    [filteredLocations, adminRemovedIds]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[100dvh] overflow-hidden bg-[#0c0b11] relative"
    >
      {/* Cinematic atmosphere layer */}
      <CinematicOverlay />

      <FilterBar
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        visibleCount={visibleCount}
        totalCount={totalCount}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
      />

      <UserMenu stats={stats} />

      <HeatmapControls
        settings={heatmapSettings}
        onToggle={toggle}
        onIntensityChange={setIntensity}
        onRadiusChange={setRadius}
      />

      <div
        className="w-full h-full transition-opacity duration-500"
        style={{ opacity: loadingState === "loading" ? 0.6 : 1 }}
      >
        <GhostMap
          locations={visibleLocations}
          allLocations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={selectLocation}
          heatmapSettings={heatmapSettings}
        />
      </div>

      {/* Loading pill */}
      <AnimatePresence>
        {loadingState === "loading" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-full font-sans"
            style={{
              fontSize: "13px", color: "rgba(255,255,255,0.45)", background: "rgba(28,28,30,0.88)",
              border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(40px)", fontFamily: FONT, letterSpacing: "-0.01em",
            }}
          >
            Loading locations…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Community Activity Feed */}
      <ActivityFeed locations={locations} onSelectLocation={selectLocation} />

      {/* Add Site FAB */}
      <motion.button
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.35, type: "spring", stiffness: 280, damping: 22 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-7 z-[1000] flex items-center gap-2 px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(28,28,30,0.88)", border: "1px solid rgba(168,85,247,0.25)", color: "#A855F7",
          backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
          cursor: "pointer", fontFamily: FONT,
        }}
        data-testid="add-location-fab"
      >
        <Plus className="w-4 h-4" />
        <span className="font-sans font-semibold" style={{ fontSize: "13px", letterSpacing: "-0.01em" }}>
          Add Site
        </span>
      </motion.button>

      <TrendingPanel locations={locations} onSelectLocation={selectLocation} />

      <LocationPanel
        location={selectedLocation}
        onClose={clearSelection}
        onSelectLocation={selectLocation}
        allLocations={locations}
        userRankTier={stats.rank.tier}
        isAdmin={stats.isAdmin}
      />

      <AddLocationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => { await addLocation(payload); }}
      />
    </motion.div>
  );
}

export default MapPage;
