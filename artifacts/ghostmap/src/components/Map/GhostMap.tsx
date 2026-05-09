import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { motion } from "framer-motion";
import { TILE_LAYERS, MAP_CENTER, MAP_DEFAULT_ZOOM, fixLeafletIcons } from "@/lib/mapUtils";
import { MapMarker } from "./MapMarker";
import type { Location } from "@/types/location";

fixLeafletIcons();

interface GhostMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
}

export function GhostMap({ locations, selectedLocation, onSelectLocation }: GhostMapProps) {
  const tile = TILE_LAYERS.satellite;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full h-full bg-[#111012]"
      data-testid="map-container"
    >
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        className="w-full h-full bg-[#111012]"
        zoomControl={false}
      >
        <TileLayer url={tile.url} attribution={tile.attribution} />
        <ZoomControl position="bottomleft" />

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
