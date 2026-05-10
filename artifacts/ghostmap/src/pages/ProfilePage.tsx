import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark, Compass, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserLocations } from "@/data/locationService";
import { CATEGORY_META, RISK_COLORS } from "@/lib/mapUtils";
import type { Location } from "@/types/location";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

type Tab = "saved" | "explored" | "submitted";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("saved");
  const [saved, setSaved] = useState<Location[]>([]);
  const [explored, setExplored] = useState<Location[]>([]);
  const [submitted, setSubmitted] = useState<Location[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    fetchUserLocations(user.id)
      .then(({ saved, explored, submitted }) => {
        setSaved(saved);
        setExplored(explored);
        setSubmitted(submitted);
      })
      .finally(() => setFetching(false));
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0c0b11" }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#A855F7" }} />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; data: Location[] }[] = [
    { id: "saved",     label: "Saved",     icon: <Bookmark className="w-3.5 h-3.5" />,  data: saved     },
    { id: "explored",  label: "Explored",  icon: <Compass className="w-3.5 h-3.5" />,   data: explored  },
    { id: "submitted", label: "Submitted", icon: <MapPin className="w-3.5 h-3.5" />,    data: submitted },
  ];

  const activeData = tabs.find((t) => t.id === tab)?.data ?? [];

  return (
    <div className="min-h-screen" style={{ background: "#0c0b11" }}>
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 80% 35% at 50% 0%, rgba(168,85,247,0.05) 0%, transparent 60%)" }}
      />

      <div className="relative max-w-xl mx-auto px-5 py-10">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-9 font-sans"
          style={{ fontSize: "15px", color: "#A855F7", fontFamily: FONT, cursor: "pointer" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to map
        </motion.button>

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.04 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-sans font-bold"
              style={{
                background: "rgba(168,85,247,0.13)",
                border: "1px solid rgba(168,85,247,0.2)",
                color: "#A855F7",
                fontSize: "22px",
                fontFamily: DISPLAY_FONT,
              }}
            >
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1
                className="font-sans font-bold text-white"
                style={{ fontSize: "22px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em" }}
              >
                Explorer Profile
              </h1>
              <p className="font-sans mt-0.5" style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", fontFamily: FONT }}>
                {user.email}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.09 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {tabs.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl px-4 py-5 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p
                className="font-sans font-bold text-white tabular-nums"
                style={{ fontSize: "26px", letterSpacing: "-0.03em", fontFamily: DISPLAY_FONT }}
              >
                {fetching ? "—" : t.data.length}
              </p>
              <p
                className="font-sans mt-1"
                style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", fontFamily: FONT, fontWeight: 500 }}
              >
                {t.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="flex gap-1.5 mb-5"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-150"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: FONT,
                letterSpacing: "-0.01em",
                cursor: "pointer",
                background: tab === t.id ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.04)",
                border: tab === t.id ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.07)",
                color: tab === t.id ? "#A855F7" : "rgba(255,255,255,0.4)",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* Location list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2.5"
          >
            {fetching ? (
              <div className="flex justify-center py-14">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(255,255,255,0.18)" }} />
              </div>
            ) : activeData.length === 0 ? (
              <div
                className="rounded-2xl px-6 py-12 text-center"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="font-sans" style={{ fontSize: "14px", color: "rgba(255,255,255,0.22)", fontFamily: FONT }}>
                  No {tab} locations yet
                </p>
              </div>
            ) : (
              activeData.map((loc, i) => (
                <ProfileCard key={String(loc.id)} location={loc} index={i} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileCard({ location, index }: { location: Location; index: number }) {
  const meta = CATEGORY_META[location.category];
  const riskStyle = RISK_COLORS[location.riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Category dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ background: meta.color, boxShadow: `0 0 8px ${meta.glowColor}` }}
      />

      <div className="flex-1 min-w-0">
        <p
          className="font-sans font-semibold text-white truncate"
          style={{ fontSize: "14px", fontFamily: FONT, letterSpacing: "-0.01em" }}
        >
          {location.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-sans" style={{ fontSize: "12px", color: meta.color, fontFamily: FONT }}>
            {meta.label}
          </span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span className="font-sans capitalize" style={{ fontSize: "12px", color: riskStyle.color, fontFamily: FONT }}>
            {location.riskLevel} risk
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <p
          className="font-sans font-bold tabular-nums"
          style={{
            fontSize: "18px",
            fontFamily: DISPLAY_FONT,
            letterSpacing: "-0.02em",
            color: location.abandonmentScore >= 80 ? "#A855F7" : location.abandonmentScore >= 55 ? "#c084fc" : "#4ade80",
          }}
        >
          {location.abandonmentScore}
        </p>
        <p className="font-sans" style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>
          score
        </p>
      </div>
    </motion.div>
  );
}
