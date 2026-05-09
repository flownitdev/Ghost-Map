import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LOCATIONS, Location } from "../data/locations";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

// Custom glowing marker
const createGlowingMarker = () => {
  return L.divIcon({
    className: "bg-transparent border-none",
    html: `<div style="width: 12px; height: 12px; background-color: #FA4817; border-radius: 50%; box-shadow: 0 0 10px 2px #FA4817, 0 0 20px 5px rgba(250,72,23,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

interface GhostMapProps {
  onSelectLocation: (location: Location) => void;
}

export function GhostMap({ onSelectLocation }: GhostMapProps) {
  const glowingIcon = createGlowingMarker();

  return (
    <div className="w-full h-full bg-[#111012]">
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={12}
        className="w-full h-full bg-[#111012]"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ZoomControl position="bottomleft" />
        
        {LOCATIONS.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={glowingIcon}
            eventHandlers={{
              click: () => onSelectLocation(location),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
