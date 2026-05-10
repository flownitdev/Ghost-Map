import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, MapPin, Compass, TrendingUp, ChevronUp } from "lucide-react";
import type { Location } from "@/types/location";
import { CATEGORY_META } from "@/lib/mapUtils";

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
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
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

const TYPE_META: Record<FeedEventType, { icon: React.ReactNode; verb: string; color: string }> = {
  submission: { icon: <MapPin className="w-2.5 h-2.5" />, verb: "submitted", color: "rgba(255,255,255,0.35)" },
  explored:   { icon: <Compass className="w-2.5 h-2.5" />,   verb: "explored",  color: "rgba(255,255,255,0.35)" },
  trending:   { icon: <TrendingUp className="w-2.5 h-2.5" />, verb: "trending",  color: "rgba(255,255,255,0.35)" },
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

  useEffect(() => {
    if (!locations.length) return;
    function scheduleNext() {
      const delay = 20_000 + Math.random() * 15_000;
      intervalRef.current = setTimeout(() => {
        const loc = locations[Math.floor(Math.random() * locations.length)];
        const types: FeedEventType[] = ["explored", "explored", "submission", "trending"];
        const type = types[Math.floor(Math.random() * types.length)];
        const newEvent: FeedEvent = {
          id: `live-${Date.now()}`,
          type,
          location: loc,
          user: randomExplorer(),
          timeAgo: "now",
          timestamp: Date.now(),
        };
        setEvents((prev) => [newEvent, ...prev.slice(0, 14)]);
        setPulse(true);
        setTimeout(() => setPulse(false), 1000);
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, [locations.length]);

  useEffect(() => {
    const id = setInterval(() => {
      setEvents((prev) => prev.map((e) => ({ ...e, timeAgo: timeAgoLabel(e.timestamp) })));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-5 z-[999]"
      style={{ bottom: 84 }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          width: 252,
          background: "rgba(18,17,24,0.82)",
          backdropFilter: "blur(48px) saturate(1.6)",
          WebkitBackdropFilter: "blur(48px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer select-none"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="relative flex-shrink-0">
            <Radio className="w-3 h-3" style={{ color: "rgba(255,255,255,0.35)" }} />
            {pulse && (
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.5)" }}
              />
            )}
            {/* Static dot indicator */}
            <div
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: "#4ade80" }}
            />
          </div>

          <span
            className="font-sans flex-1"
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontFamily: FONT, letterSpacing: "-0.01em" }}
          >
            Activity
          </span>

          {!open && events.length > 0 && (
            <span
              className="font-sans rounded-full px-1.5 py-0.5"
              style={{ fontSize: "9px", background: "rgba(74,222,128,0.1)", color: "rgba(74,222,128,0.7)", fontFamily: FONT, fontWeight: 600 }}
            >
              LIVE
            </span>
          )}

          <motion.div
            animate={{ rotate: open ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            style={{ color: "rgba(255,255,255,0.18)" }}
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </motion.div>
        </div>

        {/* Feed */}
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
                style={{ maxHeight: 280, borderTop: "1px solid rgba(255,255,255,0.05)", scrollbarWidth: "none" }}
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
                  <p
                    className="text-center py-5 font-sans"
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", fontFamily: FONT }}
                  >
                    No activity yet
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

  return (
    <motion.button
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onSelect}
      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left"
      style={{
        background: "transparent",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        cursor: "pointer",
        fontFamily: FONT,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Category color dot */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: meta.color, opacity: 0.7 }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>
            {event.user}
          </span>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)" }} className="flex items-center gap-0.5">
            {typeMeta.icon} {typeMeta.verb}
          </span>
        </div>
        <p className="truncate" style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.35)", marginTop: "1px", letterSpacing: "-0.01em" }}>
          {event.location.name}
        </p>
      </div>

      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.18)", flexShrink: 0 }}>
        {event.timeAgo}
      </span>
    </motion.button>
  );
}
