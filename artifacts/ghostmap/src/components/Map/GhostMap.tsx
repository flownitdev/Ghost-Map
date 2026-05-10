import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { motion } from "framer-motion";
import { TILE_LAYERS, MAP_CENTER, MAP_DEFAULT_ZOOM, fixLeafletIcons } from "@/lib/mapUtils";
import { MapMarker } from "./MapMarker";
import { HeatmapLayer } from "./HeatmapLayer";
import { DecayZones } from "./DecayZones";
import type { Location } from "@/types/location";
import type { HeatmapSettings } from "@/hooks/useHeatmap";

fixLeafletIcons();

interface GhostMapProps {
  locations: Location[];
  allLocations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  heatmapSettings: HeatmapSettings;
}

export function GhostMap({
  locations,
  allLocations,
  selectedLocation,
  onSelectLocation,
  heatmapSettings,
}: GhostMapProps) {
  const tile = TILE_LAYERS.satellite;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full h-full bg-[#0c0b11]"
      data-testid="map-container"
    >
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        className="w-full h-full bg-[#0c0b11]"
        zoomControl={false}
      >
        <TileLayer url={tile.url} attribution={tile.attribution} />
        <ZoomControl position="bottomleft" />

        <HeatmapLayer
          locations={allLocations}
          intensity={heatmapSettings.intensity}
          radius={heatmapSettings.radius}
          visible={heatmapSettings.visible}
        />

        <DecayZones
          locations={allLocations}
          visible={heatmapSettings.visible}
        />

        {locations.map((location) => (
          <MapMarker
            key={location.id}
            location={location}
            isSelected={selectedLocation?.id === location.id}
            onSelect={onSelectLocation}
          />
        ))}
      </MapContainer>
    </motion.div>
  );
}
