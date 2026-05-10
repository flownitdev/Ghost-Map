import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, X, MapPin, Compass, TrendingUp, ChevronDown } from "lucide-react";
import type { Location } from "@/types/location";
import { CATEGORY_META, RISK_COLORS } from "@/lib/mapUtils";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

type FeedEventType = "submission" | "explored" | "trending";

interface FeedEvent {
  id: string;
  type: FeedEventType;
  location: Location;
  user: string;
  timeAgo: string;
  timestamp: number;
}

const FAKE_EXPLORERS = [
  "ShadowWalker", "VoidDrifter", "RuinSeeker", "CrypticGhost",
  "UrbexNight", "PhantomLens", "DecayHunter", "LostSoul_42",
  "GhostFrame", "CataEdge", "OldWorld_X", "ForgottenKeys",
];

function randomExplorer() {
  return FAKE_EXPLORERS[Math.floor(Math.random() * FAKE_EXPLORERS.length)];
}

function timeAgoLabel(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function generateSeedEvents(locations: Location[]): FeedEvent[] {
  if (!locations.length) return [];
  const now = Date.now();
  const types: FeedEventType[] = ["submission", "explored", "trending", "explored", "explored", "submission"];
  return Array.from({ length: 8 }, (_, i) => {
    const loc = locations[i % locations.length];
    const type = types[i % types.length];
    return {
      id: `seed-${i}`,
      type,
      location: loc,
      user: randomExplorer(),
      timeAgo: timeAgoLabel(now - (i + 1) * 90_000 + Math.random() * 60_000),
      timestamp: now - (i + 1) * 90_000,
    };
  });
}

const TYPE_META: Record<FeedEventType, { icon: React.ReactNode; label: string; color: string }> = {
  submission: { icon: <MapPin className="w-3 h-3" />, label: "submitted", color: "#A855F7" },
  explored:   { icon: <Compass className="w-3 h-3" />,   label: "explored",  color: "#4ade80" },
  trending:   { icon: <TrendingUp className="w-3 h-3" />, label: "trending",  color: "#f59e0b" },
};

interface ActivityFeedProps {
  locations: Location[];
  onSelectLocation: (loc: Location) => void;
}

export function ActivityFeed({ locations, onSelectLocation }: ActivityFeedProps) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [pulse, setPulse] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (locations.length) setEvents(generateSeedEvents(locations));
  }, [locations.length]);

  // Simulate new live events every ~18-35s
  useEffect(() => {
    if (!locations.length) return;
    function scheduleNext() {
      const delay = 18_000 + Math.random() * 17_000;
      intervalRef.current = setTimeout(() => {
        const loc = locations[Math.floor(Math.random() * locations.length)];
        const types: FeedEventType[] = ["explored", "explored", "submission", "trending"];
        const type = types[Math.floor(Math.random() * types.length)];
        const newEvent: FeedEvent = {
          id: `live-${Date.now()}`,
          type,
          location: loc,
          user: randomExplorer(),
          timeAgo: "just now",
          timestamp: Date.now(),
        };
        setEvents((prev) => [newEvent, ...prev.slice(0, 14)]);
        setPulse(true);
        setTimeout(() => setPulse(false), 1200);
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, [locations.length]);

  // Update "time ago" labels every 30s
  useEffect(() => {
    const id = setInterval(() => {
      setEvents((prev) =>
        prev.map((e) => ({ ...e, timeAgo: timeAgoLabel(e.timestamp) }))
      );
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-5 z-[999]"
      style={{ bottom: 88 }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          width: 272,
          background: "rgba(28,28,30,0.88)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 cursor-pointer select-none"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="relative flex-shrink-0">
            <Radio className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
            <motion.div
              animate={{ scale: pulse ? [1, 1.8, 1] : 1, opacity: pulse ? [1, 0, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: "#4ade80" }}
            />
          </div>

          <span
            className="font-sans font-semibold flex-1"
            style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", fontFamily: FONT, letterSpacing: "-0.01em" }}
          >
            Community Feed
          </span>

          {!open && events.length > 0 && (
            <span
              className="font-sans font-semibold rounded-full px-1.5 py-0.5"
              style={{ fontSize: "10px", background: "rgba(74,222,128,0.15)", color: "#4ade80", fontFamily: FONT }}
            >
              LIVE
            </span>
          )}

          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </div>

        {/* Feed list */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div
                className="overflow-y-auto"
                style={{ maxHeight: 320, borderTop: "1px solid rgba(255,255,255,0.06)", scrollbarWidth: "none" }}
              >
                <AnimatePresence initial={false}>
                  {events.map((event) => (
                    <FeedRow
                      key={event.id}
                      event={event}
                      onSelect={() => { onSelectLocation(event.location); setOpen(false); }}
                    />
                  ))}
                </AnimatePresence>
                {events.length === 0 && (
                  <p className="text-center py-5 font-sans" style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>
                    Waiting for activity…
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FeedRow({ event, onSelect }: { event: FeedEvent; onSelect: () => void }) {
  const meta = CATEGORY_META[event.location.category];
  const typeMeta = TYPE_META[event.type];
  const risk = RISK_COLORS[event.location.riskLevel];

  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      className="w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors duration-100"
      style={{
        background: "transparent",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        cursor: "pointer",
        fontFamily: FONT,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Category dot */}
      <div
        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
        style={{ background: meta.color, boxShadow: `0 0 5px ${meta.glowColor}` }}
      />

      <div className="flex-1 min-w-0">
        {/* User + action */}
        <div className="flex items-center gap-1 flex-wrap">
          <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
            {event.user}
          </span>
          <span style={{ color: typeMeta.color, fontSize: "11px" }} className="flex items-center gap-0.5">
            {typeMeta.icon} {typeMeta.label}
          </span>
        </div>

        {/* Location name */}
        <p
          className="truncate mt-0.5"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.42)", letterSpacing: "-0.01em" }}
        >
          {event.location.name}
        </p>
      </div>

      {/* Right side */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>{event.timeAgo}</span>
        <span
          className="px-1.5 py-0.5 rounded-full capitalize"
          style={{
            fontSize: "8.5px",
            color: risk.color,
            background: risk.bg,
            border: `1px solid ${risk.border}33`,
          }}
        >
          {event.location.riskLevel}
        </span>
      </div>
    </motion.button>
  );
}
