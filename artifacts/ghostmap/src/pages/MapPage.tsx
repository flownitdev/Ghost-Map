import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin } from "lucide-react";
import { GhostMap, FilterBar } from "@/components/Map";
import { HeatmapControls } from "@/components/Map/HeatmapControls";
import { AddLocationModal } from "@/components/Map/AddLocationModal";
import { CinematicOverlay } from "@/components/Map/CinematicOverlay";
import { LocationPanel, TrendingPanel } from "@/components/Sidebar";
import { UserMenu } from "@/components/Auth/UserMenu";
import { ActivityFeed } from "@/components/Community/ActivityFeed";
import { GPSModeButton } from "@/components/GPS/GPSModeButton";
import { GPSNearbyPanel } from "@/components/GPS/GPSNearbyPanel";
import { AchievementToast } from "@/components/Achievements/AchievementToast";
import { SatScannerButton } from "@/components/SatScanner/SatScannerButton";
import { SatScannerOverlay } from "@/components/SatScanner/SatScannerOverlay";
import { SatScannerResultsPanel } from "@/components/SatScanner/SatScannerResultsPanel";
import { useLocations } from "@/hooks/useLocations";
import { useMapLocations } from "@/hooks/useMapLocations";
import { useHeatmap } from "@/hooks/useHeatmap";
import { useUserLocations } from "@/hooks/useUserLocations";
import { useRank } from "@/hooks/useRank";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/contexts/AuthContext";
import { useSatScanner } from "@/hooks/useSatScanner";
import type { Location } from "@/types/location";
import type { Achievement } from "@/types/exploration";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

function ProximityAlert({
  nearbyLocation, exploredIds, onView,
}: {
  nearbyLocation: Location | null;
  exploredIds:    Set<string>;
  onView:         (l: Location) => void;
}) {
  const explored = nearbyLocation ? exploredIds.has(String(nearbyLocation.id)) : false;
  return (
    <AnimatePresence>
      {nearbyLocation && (
        <motion.div
          key={String(nearbyLocation.id)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed z-[950] flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            bottom:         "88px",
            left:           "50%",
            transform:      "translateX(-50%)",
            background:     "rgba(14,13,20,0.92)",
            border:         "1px solid rgba(74,222,128,0.3)",
            backdropFilter: "blur(40px)",
            boxShadow:      "0 4px 24px rgba(0,0,0,0.5), 0 0 20px rgba(74,222,128,0.1)",
            maxWidth:       "360px",
            width:          "calc(100vw - 32px)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-sans" style={{ fontSize: "10px", color: "rgba(74,222,128,0.8)", fontFamily: FONT, fontWeight: 600, letterSpacing: "0.05em" }}>
              YOU'RE NEAR {explored ? "· ALREADY EXPLORED" : "· UNDISCOVERED"}
            </p>
            <p className="font-sans font-semibold text-white truncate" style={{ fontSize: "13px", fontFamily: FONT, letterSpacing: "-0.01em" }}>
              {nearbyLocation.name}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onView(nearbyLocation)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0"
            style={{
              background: "rgba(74,222,128,0.12)",
              border:     "1px solid rgba(74,222,128,0.3)",
              color:      "#4ade80",
              fontSize:   "11px",
              fontFamily: FONT,
              fontWeight: 600,
              cursor:     "pointer",
            }}
          >
            <MapPin className="w-3 h-3" /> View
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MapPage() {
  const { locations, loadingState } = useLocations();
  const [modalOpen, setModalOpen] = useState(false);

  const {
    scanState,
    scanResponse,
    error: scanError,
    updateMapView,
    startScan,
    cancelScan,
    reset: resetScan,
  } = useSatScanner();

  const {
    filteredLocations,
    selectedLocation,
    activeCategory,
    searchQuery,
    sortMode,
    visibleCount,
    totalCount,
    setActiveCategory,
    setSearchQuery,
    setSortMode,
    selectLocation,
    clearSelection,
  } = useMapLocations(locations);

  const { settings: heatmapSettings, toggle, setIntensity, setRadius } = useHeatmap();

  const { user } = useAuth();
  const { savedIds, exploredIds } = useUserLocations();

  const exploredLocations = useMemo(
    () => locations.filter((l) => exploredIds.has(String(l.id))),
    [locations, exploredIds]
  );

  const stats = useRank({ user, exploredLocations, savedIds, submittedLocations: [] });

  const geo = useGeolocation(locations);

  const [hasGPSVisit, setHasGPSVisit] = useState(() => localStorage.getItem("gm-gps-visit") === "true");
  const [hasTrail,    setHasTrail]    = useState(() => localStorage.getItem("gm-has-trail") === "true");
  const [hasLog,      setHasLog]      = useState(() => localStorage.getItem("gm-has-log")   === "true");

  useEffect(() => {
    if (geo.nearbyLocation && !hasGPSVisit) {
      setHasGPSVisit(true);
      localStorage.setItem("gm-gps-visit", "true");
    }
  }, [geo.nearbyLocation, hasGPSVisit]);

  useEffect(() => {
    if (!geo.isTracking && geo.trailPoints.length >= 3 && !hasTrail) {
      setHasTrail(true);
      localStorage.setItem("gm-has-trail", "true");
    }
  }, [geo.isTracking, geo.trailPoints.length, hasTrail]);

  const handleLogAdded = () => {
    if (!hasLog) {
      setHasLog(true);
      localStorage.setItem("gm-has-log", "true");
    }
  };

  const { newlyUnlocked, dismissNew } = useAchievements({
    exploredLocations,
    hasLog,
    hasGPSVisit,
    hasTrail,
    rankTier: stats.rank.tier,
  });

  const [currentToast, setCurrentToast] = useState<Achievement | null>(null);
  const [toastQueue,   setToastQueue]   = useState<Achievement[]>([]);

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setToastQueue((q) => [...q, ...newlyUnlocked]);
      dismissNew();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newlyUnlocked.length]);

  useEffect(() => {
    if (!currentToast && toastQueue.length > 0) {
      const [next, ...rest] = toastQueue;
      setCurrentToast(next);
      setToastQueue(rest);
    }
  }, [currentToast, toastQueue]);

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
      transition={{ duration: 0.6 }}
      className="w-full h-[100dvh] overflow-hidden bg-[#0a090e] relative"
    >
      <CinematicOverlay />

      <FilterBar
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        visibleCount={visibleCount}
        totalCount={totalCount}
        sortMode={sortMode}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
        onSortChange={setSortMode}
      />

      <UserMenu stats={stats} />

      <HeatmapControls
        settings={heatmapSettings}
        onToggle={toggle}
        onIntensityChange={setIntensity}
        onRadiusChange={setRadius}
      />

      <div
        className="w-full h-full transition-opacity duration-700"
        style={{ opacity: loadingState === "loading" ? 0.5 : 1 }}
      >
        <GhostMap
          locations={visibleLocations}
          allLocations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={selectLocation}
          heatmapSettings={heatmapSettings}
          gpsTracking={geo.isTracking}
          gpsPosition={geo.position}
          trailPoints={geo.trailPoints}
          onMapStateChange={updateMapView}
          scanResults={scanResponse?.results ?? []}
        />
      </div>

      <SatScannerOverlay scanState={scanState} />

      <SatScannerButton
        scanState={scanState}
        onScan={startScan}
        onCancel={cancelScan}
        onReset={resetScan}
      />

      <SatScannerResultsPanel
        scanState={scanState}
        scanResponse={scanResponse}
        error={scanError}
        onClose={resetScan}
      />

      <GPSModeButton
        isTracking={geo.isTracking}
        isSupported={geo.isSupported}
        position={geo.position}
        error={geo.error}
        onStart={geo.startTracking}
        onStop={geo.stopTracking}
      />

      <GPSNearbyPanel
        position={geo.position}
        isTracking={geo.isTracking}
        allLocations={locations}
        exploredIds={exploredIds}
        onSelectLocation={selectLocation}
      />

      <ProximityAlert
        nearbyLocation={geo.nearbyLocation}
        exploredIds={exploredIds}
        onView={selectLocation}
      />

      <AchievementToast
        achievement={currentToast}
        onDismiss={() => setCurrentToast(null)}
      />

      <AnimatePresence>
        {loadingState === "loading" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-full font-sans"
            style={{
              fontSize:       "12px",
              color:          "rgba(255,255,255,0.35)",
              background:     "rgba(18,17,24,0.82)",
              border:         "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(40px)",
              fontFamily:     FONT,
              letterSpacing:  "-0.01em",
            }}
          >
            Loading locations…
          </motion.div>
        )}
      </AnimatePresence>

      <ActivityFeed locations={locations} onSelectLocation={selectLocation} />

      <motion.button
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.35, type: "spring", stiffness: 280, damping: 22 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-7 z-[1000] flex items-center gap-2 px-4 py-2.5 rounded-xl"
        style={{
          background:          "rgba(250,72,23,0.1)",
          border:              "1px solid rgba(250,72,23,0.22)",
          color:               "#FA4817",
          backdropFilter:      "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow:           "0 4px 24px rgba(0,0,0,0.4)",
          cursor:              "pointer",
          fontFamily:          FONT,
        }}
        data-testid="add-location-fab"
      >
        <Plus className="w-4 h-4" />
        <span className="font-sans font-semibold" style={{ fontSize: "12.5px", letterSpacing: "-0.01em" }}>
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
        onLogAdded={handleLogAdded}
      />

      <AddLocationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </motion.div>
  );
}

export default MapPage;
