import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, ZoomControl, useMapEvents } from "react-leaflet";
import { motion } from "framer-motion";
import { TILE_LAYERS, MAP_CENTER, MAP_DEFAULT_ZOOM, fixLeafletIcons } from "@/lib/mapUtils";
import { MapMarker } from "./MapMarker";
import { HeatmapLayer } from "./HeatmapLayer";
import { DecayZones } from "./DecayZones";
import { UserLocationMarker } from "@/components/GPS/UserLocationMarker";
import { HeatTrailLayer } from "@/components/GPS/HeatTrailLayer";
import { SatScannerResultMarkers } from "@/components/SatScanner/SatScannerResultMarkers";
import type { Location } from "@/types/location";
import type { HeatmapSettings } from "@/hooks/useHeatmap";
import type { GeoPosition } from "@/hooks/useGeolocation";
import type { ScanTileResult } from "@/hooks/useSatScanner";

fixLeafletIcons();

// Reports map center + zoom to parent whenever the user pans or zooms
function MapStateCapture({ onChange }: { onChange: (lat: number, lng: number, zoom: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onChange(c.lat, c.lng, map.getZoom());
    },
    zoomend: () => {
      const c = map.getCenter();
      onChange(c.lat, c.lng, map.getZoom());
    },
  });

  useEffect(() => {
    const c = map.getCenter();
    onChange(c.lat, c.lng, map.getZoom());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

interface GhostMapProps {
  locations:          Location[];
  allLocations:       Location[];
  selectedLocation:   Location | null;
  onSelectLocation:   (location: Location) => void;
  heatmapSettings:    HeatmapSettings;
  gpsTracking?:       boolean;
  gpsPosition?:       GeoPosition | null;
  trailPoints?:       [number, number][];
  onMapStateChange?:  (lat: number, lng: number, zoom: number) => void;
  scanResults?:       ScanTileResult[];
}

export function GhostMap({
  locations,
  allLocations,
  selectedLocation,
  onSelectLocation,
  heatmapSettings,
  gpsTracking  = false,
  gpsPosition  = null,
  trailPoints  = [],
  onMapStateChange,
  scanResults  = [],
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

        {onMapStateChange && <MapStateCapture onChange={onMapStateChange} />}

        <HeatmapLayer
          locations={allLocations}
          intensity={heatmapSettings.intensity}
          radius={heatmapSettings.radius}
          visible={heatmapSettings.visible}
        />

        <DecayZones locations={allLocations} visible={heatmapSettings.visible} />

        <HeatTrailLayer trailPoints={trailPoints} visible={gpsTracking && trailPoints.length >= 2} />

        <UserLocationMarker position={gpsPosition} visible={gpsTracking} />

        {locations.map((location) => (
          <MapMarker
            key={location.id}
            location={location}
            isSelected={selectedLocation?.id === location.id}
            onSelect={onSelectLocation}
          />
        ))}

        {scanResults.length > 0 && <SatScannerResultMarkers results={scanResults} />}
      </MapContainer>
    </motion.div>
  );
}
