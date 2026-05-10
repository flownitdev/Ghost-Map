import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark, Compass, MapPin, Loader2, Zap, TrendingUp, Shield, Lock, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserLocations } from "@/data/locationService";
import { CATEGORY_META, RISK_COLORS } from "@/lib/mapUtils";
import { RANKS, ADMIN_EMAILS, calcDangerScore, calcPoints, getRankForPoints } from "@/types/rank";
import { RankBadge, RankProgressBar } from "@/components/Rank/RankBadge";
import type { Location } from "@/types/location";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

type Tab = "saved" | "explored" | "submitted";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("explored");
  const [saved, setSaved] = useState<Location[]>([]);
  const [explored, setExplored] = useState<Location[]>([]);
  const [submitted, setSubmitted] = useState<Location[]>([]);
  const [fetching, setFetching] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

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

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? "");
  const dangerScore = calcDangerScore(explored);
  const totalPoints = calcPoints({ exploredCount: explored.length, savedCount: saved.length, submittedCount: submitted.length, dangerScore });
  const rank = isAdmin ? RANKS[RANKS.length - 1] : getRankForPoints(totalPoints);
  const rankIndex = RANKS.findIndex((r) => r.tier === rank.tier);
  const nextRank = rankIndex < RANKS.length - 1 ? RANKS[rankIndex + 1] : null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; data: Location[] }[] = [
    { id: "explored",  label: "Explored",  icon: <Compass className="w-3.5 h-3.5" />,  data: explored  },
    { id: "saved",     label: "Saved",     icon: <Bookmark className="w-3.5 h-3.5" />, data: saved     },
    { id: "submitted", label: "Submitted", icon: <MapPin className="w-3.5 h-3.5" />,   data: submitted },
  ];

  const activeData = tabs.find((t) => t.id === tab)?.data ?? [];

  return (
    <div className="min-h-screen" style={{ background: "#0c0b11" }}>
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 80% 35% at 50% 0%, rgba(168,85,247,0.06) 0%, transparent 60%)" }} />

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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.04 }} className="mb-6">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ boxShadow: [`0 0 0px ${rank.glowColor}`, `0 0 20px ${rank.glowColor}`, `0 0 0px ${rank.glowColor}`] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-sans font-bold flex-shrink-0"
              style={{ background: `${rank.color}18`, border: `1px solid ${rank.color}30`, color: rank.color, fontSize: "22px", fontFamily: DISPLAY_FONT }}
            >
              {user.email?.[0]?.toUpperCase()}
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="font-sans font-bold text-white" style={{ fontSize: "22px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em" }}>
                  Explorer Profile
                </h1>
                {isAdmin && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: "10px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", fontFamily: FONT }}>
                    <Shield className="w-2.5 h-2.5" /> Admin
                  </span>
                )}
              </div>
              <p className="font-sans truncate" style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontFamily: FONT }}>
                {user.email}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rank card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="rounded-3xl p-5 mb-4"
          style={{
            background: `linear-gradient(135deg, ${rank.color}08 0%, rgba(28,28,30,0.6) 100%)`,
            border: `1px solid ${rank.color}22`,
            boxShadow: `0 0 40px ${rank.glowColor.replace("0.4", "0.08")}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, marginBottom: 4 }}>
                EXPLORER RANK
              </p>
              <RankBadge rank={rank} size="lg" animated />
            </div>
            <div className="text-right">
              <p className="font-sans font-bold tabular-nums" style={{ fontSize: "32px", fontFamily: DISPLAY_FONT, color: rank.color, letterSpacing: "-0.04em" }}>
                {totalPoints}
              </p>
              <p className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>total points</p>
            </div>
          </div>

          <RankProgressBar rank={rank} nextRank={nextRank} totalPoints={totalPoints} />

          <p className="font-sans mt-3" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, fontStyle: "italic" }}>
            {rank.description}
          </p>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="grid grid-cols-4 gap-2.5 mb-4"
        >
          {[
            { label: "Explored", value: explored.length, icon: <Compass className="w-3.5 h-3.5" />, color: "#4ade80" },
            { label: "Saved",    value: saved.length,    icon: <Bookmark className="w-3.5 h-3.5" />, color: "#60a5fa" },
            { label: "Submitted",value: submitted.length,icon: <MapPin className="w-3.5 h-3.5" />,   color: "#A855F7" },
            { label: "Danger",   value: dangerScore,     icon: <Zap className="w-3.5 h-3.5" />,      color: "#f43f5e" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl px-3 py-4 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex justify-center mb-1.5" style={{ color: s.color, opacity: 0.6 }}>{s.icon}</div>
              <p className="font-sans font-bold text-white tabular-nums" style={{ fontSize: "22px", letterSpacing: "-0.03em", fontFamily: DISPLAY_FONT }}>
                {fetching ? "—" : s.value}
              </p>
              <p className="font-sans mt-0.5" style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.25)", fontFamily: FONT, fontWeight: 500 }}>
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Rank ladder */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="rounded-2xl p-4 mb-6"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="font-sans font-semibold" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
              Rank Ladder
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {RANKS.map((r, i) => {
              const isCurrentRank = r.tier === rank.tier;
              const isPast = RANKS.findIndex((x) => x.tier === rank.tier) > i;
              return (
                <div key={r.tier} className="flex items-center gap-1.5">
                  <div
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
                    style={{
                      background: isCurrentRank ? `${r.color}18` : isPast ? "rgba(255,255,255,0.05)" : "transparent",
                      border: isCurrentRank ? `1px solid ${r.color}40` : isPast ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>{r.emoji}</span>
                    <span className="font-sans" style={{ fontSize: "10px", fontFamily: FONT, fontWeight: isCurrentRank ? 600 : 400, color: isCurrentRank ? r.color : isPast ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}>
                      {r.label}
                    </span>
                    {!isPast && !isCurrentRank && <Lock className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.15)" }} />}
                  </div>
                  {i < RANKS.length - 1 && <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.1)" }} />}
                </div>
              );
            })}
          </div>
          <p className="font-sans mt-3" style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)", fontFamily: FONT }}>
            Ghost rank and above can access Extreme danger zones
          </p>
        </motion.div>

        {/* Admin panel */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl p-4 mb-6"
            style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.18)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: "#f59e0b" }} />
                <span className="font-sans font-semibold" style={{ fontSize: "13px", color: "#f59e0b", fontFamily: FONT }}>Admin Mode</span>
              </div>
              {/* iOS-style toggle */}
              <button
                onClick={() => setAdminMode((v) => !v)}
                className="relative rounded-full transition-all duration-250"
                style={{
                  width: 42, height: 26, flexShrink: 0, cursor: "pointer",
                  background: adminMode ? "#f59e0b" : "rgba(255,255,255,0.12)",
                  border: "none", padding: 3,
                }}
              >
                <motion.div
                  animate={{ x: adminMode ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="w-5 h-5 rounded-full"
                  style={{ background: "white" }}
                />
              </button>
            </div>
            {adminMode && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(245,158,11,0.15)" }}>
                <p className="font-sans" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: FONT }}>
                  Admin mode enabled. Flagged & removal controls are now visible on location panels.
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>
                    Flagged: {(JSON.parse(localStorage.getItem("gm-flagged") ?? "[]") as string[]).length}
                  </span>
                  <span className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>
                    Removed: {(JSON.parse(localStorage.getItem("gm-removed") ?? "[]") as string[]).length}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="flex gap-1.5 mb-5"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-150"
              style={{
                fontSize: "13px", fontWeight: 500, fontFamily: FONT, letterSpacing: "-0.01em", cursor: "pointer",
                background: tab === t.id ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.04)",
                border: tab === t.id ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.07)",
                color: tab === t.id ? "#A855F7" : "rgba(255,255,255,0.4)",
              }}
            >
              {t.icon}
              {t.label}
              <span
                className="font-sans font-semibold rounded-full px-1.5"
                style={{ fontSize: "10px", background: tab === t.id ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.06)", color: tab === t.id ? "#A855F7" : "rgba(255,255,255,0.25)" }}
              >
                {fetching ? "·" : t.data.length}
              </span>
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
              <div className="rounded-2xl px-6 py-12 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="font-sans" style={{ fontSize: "14px", color: "rgba(255,255,255,0.22)", fontFamily: FONT }}>
                  No {tab} locations yet
                </p>
                {tab === "explored" && (
                  <p className="font-sans mt-1" style={{ fontSize: "12px", color: "rgba(255,255,255,0.14)", fontFamily: FONT }}>
                    Mark locations explored on the map to earn points
                  </p>
                )}
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
  const isExtreme = location.riskLevel === "extreme";

  const pointsEarned = isExtreme ? 10 : location.riskLevel === "high" ? 5 : location.riskLevel === "medium" ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{
        background: isExtreme ? "rgba(244,63,94,0.03)" : "rgba(255,255,255,0.03)",
        border: isExtreme ? "1px solid rgba(244,63,94,0.15)" : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: riskStyle.color, boxShadow: `0 0 8px ${riskStyle.color}66` }} />

      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-white truncate" style={{ fontSize: "14px", fontFamily: FONT, letterSpacing: "-0.01em" }}>
          {location.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-sans" style={{ fontSize: "12px", color: meta.color, fontFamily: FONT }}>{meta.emoji} {meta.label}</span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span className="font-sans capitalize" style={{ fontSize: "12px", color: riskStyle.color, fontFamily: FONT }}>
            {riskStyle.label} risk
          </span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-sans font-bold tabular-nums" style={{ fontSize: "18px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em", color: riskStyle.color }}>
          {location.abandonmentScore}
        </p>
        <p className="font-sans" style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>
          +{pointsEarned} pts
        </p>
      </div>
    </motion.div>
  );
}
