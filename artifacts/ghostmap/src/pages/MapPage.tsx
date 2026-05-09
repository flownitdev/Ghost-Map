import { useState } from "react";
import { motion } from "framer-motion";
import { GhostMap } from "@/components/Map";
import { LocationPanel, HudOverlay } from "@/components/Sidebar";
import type { Location } from "@/types/location";

export function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[100dvh] overflow-hidden bg-[#111012] relative"
    >
      <HudOverlay />
      <GhostMap
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
      />
      <LocationPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </motion.div>
  );
}

export default MapPage;
