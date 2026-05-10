import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark, Compass, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserLocations } from "@/data/locationService";
import { CATEGORY_META, RISK_COLORS } from "@/lib/mapUtils";
import type { Location } from "@/types/location";

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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0c0b11" }}
      >
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#A855F7" }} />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; data: Location[] }[] = [
    { id: "saved", label: "Saved", icon: <Bookmark className="w-3.5 h-3.5" />, data: saved },
    { id: "explored", label: "Explored", icon: <Compass className="w-3.5 h-3.5" />, data: explored },
    { id: "submitted", label: "Submitted", icon: <MapPin className="w-3.5 h-3.5" />, data: submitted },
  ];

  const activeData = tabs.find((t) => t.id === tab)?.data ?? [];

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0c0b11" }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(168,85,247,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-8 font-sans text-sm"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to map
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-title font-bold text-xl"
              style={{
                background: "rgba(168,85,247,0.14)",
                border: "1px solid rgba(168,85,247,0.25)",
                color: "#A855F7",
              }}
            >
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1
                className="font-title font-bold text-white"
                style={{ fontSize: "20px", letterSpacing: "0.08em" }}
              >
                Explorer Profile
              </h1>
              <p className="font-sans text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {user.email}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {tabs.map((t) => (
            <div
              key={t.id}
              className="rounded-xl px-4 py-4 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="font-title font-bold text-white"
                style={{ fontSize: "22px" }}
              >
                {fetching ? "—" : t.data.length}
              </p>
              <p
                className="font-sans mt-1"
                style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)" }}
              >
                {t.label.toUpperCase()}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex gap-1.5 mb-6"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans transition-all duration-150"
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.06em",
                fontFamily: "inherit",
                background: tab === t.id ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.03)",
                border: tab === t.id ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.06)",
                color: tab === t.id ? "#A855F7" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-3"
          >
            {fetching ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(255,255,255,0.2)" }} />
              </div>
            ) : activeData.length === 0 ? (
              <div
                className="rounded-xl px-6 py-10 text-center"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <p className="font-sans text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                  No {tab} locations yet
                </p>
              </div>
            ) : (
              activeData.map((loc, i) => (
                <ProfileLocationCard key={String(loc.id)} location={loc} index={i} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileLocationCard({ location, index }: { location: Location; index: number }) {
  const meta = CATEGORY_META[location.category];
  const riskStyle = RISK_COLORS[location.riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      className="flex items-center gap-4 px-5 py-4 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Category dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: meta.color, boxShadow: `0 0 8px ${meta.glowColor}` }}
      />

      <div className="flex-1 min-w-0">
        <p className="font-sans font-medium text-white text-sm truncate">{location.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="font-sans"
            style={{ fontSize: "10px", color: meta.color, letterSpacing: "0.06em" }}
          >
            {meta.label}
          </span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>·</span>
          <span
            className="font-sans"
            style={{ fontSize: "10px", color: riskStyle.color }}
          >
            {location.riskLevel} risk
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <p
          className="font-title font-bold tabular-nums"
          style={{
            fontSize: "16px",
            color: location.abandonmentScore >= 80 ? "#A855F7" : location.abandonmentScore >= 55 ? "#c084fc" : "#4ade80",
          }}
        >
          {location.abandonmentScore}
        </p>
        <p
          className="font-sans"
          style={{ fontSize: "8.5px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}
        >
          SCORE
        </p>
      </div>
    </motion.div>
  );
}
