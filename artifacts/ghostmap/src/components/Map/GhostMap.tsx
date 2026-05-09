import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { LOCATIONS } from "@/data/locations";
import { TILE_LAYERS, MAP_CENTER, MAP_DEFAULT_ZOOM, fixLeafletIcons } from "@/lib/mapUtils";
import { MapMarker } from "./MapMarker";
import type { Location } from "@/types/location";

fixLeafletIcons();

interface GhostMapProps {
  onSelectLocation: (location: Location) => void;
}

export function GhostMap({ onSelectLocation }: GhostMapProps) {
  const tile = TILE_LAYERS.satellite;

  return (
    <div className="w-full h-full bg-[#111012]" data-testid="map-container">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        className="w-full h-full bg-[#111012]"
        zoomControl={false}
      >
        <TileLayer url={tile.url} attribution={tile.attribution} />
        <ZoomControl position="bottomleft" />

        {LOCATIONS.map((location) => (
          <MapMarker
            key={location.id}
            location={location}
            onSelect={onSelectLocation}
          />
        ))}
      </MapContainer>
    </div>
  );
}
