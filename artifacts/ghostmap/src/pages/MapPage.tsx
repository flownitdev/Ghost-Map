import { useState } from "react";
import { GhostMap } from "@/components/Map";
import { LocationPanel, HudOverlay } from "@/components/Sidebar";
import type { Location } from "@/types/location";

export function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#111012] relative">
      <HudOverlay />
      <GhostMap onSelectLocation={setSelectedLocation} />
      <LocationPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </div>
  );
}

export default MapPage;
