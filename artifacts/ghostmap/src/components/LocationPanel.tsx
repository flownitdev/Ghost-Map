import { Location } from "../data/locations";
import { X, Calendar, MapPin, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface LocationPanelProps {
  location: Location | null;
  onClose: () => void;
}

export function LocationPanel({ location, onClose }: LocationPanelProps) {
  return (
    <AnimatePresence>
      {location && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-[100dvh] w-full md:w-[380px] z-[1000] bg-[#111012]/75 backdrop-blur-[20px] border-l border-white/10 p-6 flex flex-col"
          data-testid="location-panel"
        >
          <div className="flex items-start justify-between mb-6">
            <h2 className="font-title text-2xl font-bold text-white leading-tight">
              {location.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 -mt-2 text-muted-foreground hover:text-white transition-colors"
              data-testid="close-panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/10 bg-white/5 text-xs text-gray-300">
              <MapPin className="w-3 h-3" />
              {location.category}
            </div>
            
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border"
              style={{
                borderColor: location.risk === 'HIGH' ? '#FA4817' : location.risk === 'MEDIUM' ? '#354362' : '#2a6e4f',
                color: location.risk === 'HIGH' ? '#FA4817' : location.risk === 'MEDIUM' ? '#92a5d1' : '#4ade80',
                backgroundColor: location.risk === 'HIGH' ? 'rgba(250,72,23,0.1)' : location.risk === 'MEDIUM' ? 'rgba(53,67,98,0.3)' : 'rgba(42,110,79,0.2)'
              }}
            >
              <AlertTriangle className="w-3 h-3" />
              RISK: {location.risk}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-sans">
              {location.description}
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Last visited: <strong className="text-gray-300">{location.lastVisited}</strong></span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
