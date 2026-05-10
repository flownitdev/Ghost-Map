import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark, Compass, MapPin, Loader2, Zap, TrendingUp, Lock, ChevronRight, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserLocations } from "@/data/locationService";
import { CATEGORY_META, RISK_COLORS } from "@/lib/mapUtils";
import { RANKS, calcDangerScore, calcPoints, getRankForPoints } from "@/types/rank";
import { RankBadge, RankProgressBar } from "@/components/Rank/RankBadge";
import { ACHIEVEMENT_DEFS, RARITY_META } from "@/types/exploration";
import type { ExplorationRarity } from "@/types/exploration";
import type { Location } from "@/types/location";

const FONT         = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

type Tab = "explored" | "saved" | "submitted" | "achievements";

function loadAchievements(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem("gm-achievements") ?? "{}"); }
  catch { return {}; }
}

export default function ProfilePage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [, navigate] = useLocation();
  const [tab,       setTab]       = useState<Tab>("explored");
  const [saved,     setSaved]     = useState<Location[]>([]);
  const [explored,  setExplored]  = useState<Location[]>([]);
  const [submitted, setSubmitted] = useState<Location[]>([]);
  const [fetching,  setFetching]  = useState(false);
  const [achStored, setAchStored] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      signIn();
    }
  }, [user, authLoading, signIn]);

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

  useEffect(() => {
    setAchStored(loadAchievements());
  }, []);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0c0b11" }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#A855F7" }} />
      </div>
    );
  }

  const displayName = user.name ?? user.id;

  const dangerScore  = calcDangerScore(explored);
  const totalPoints  = calcPoints({ exploredCount: explored.length, savedCount: saved.length, submittedCount: submitted.length, dangerScore });
  const rank         = getRankForPoints(totalPoints);
  const rankIndex    = RANKS.findIndex((r) => r.tier === rank.tier);
  const nextRank     = rankIndex < RANKS.length - 1 ? RANKS[rankIndex + 1] : null;
  const unlockedCount = Object.keys(achStored).length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "explored",      label: "Explored",     icon: <Compass className="w-3.5 h-3.5" />,  count: explored.length  },
    { id: "saved",         label: "Saved",        icon: <Bookmark className="w-3.5 h-3.5" />, count: saved.length     },
    { id: "submitted",     label: "Submitted",    icon: <MapPin className="w-3.5 h-3.5" />,   count: submitted.length },
    { id: "achievements",  label: "Achievements", icon: <Trophy className="w-3.5 h-3.5" />,   count: unlockedCount    },
  ];

  const locationDataMap: Record<Tab, Location[]> = {
    explored, saved, submitted, achievements: [],
  };

  return (
    <div className="min-h-screen" style={{ background: "#0c0b11" }}>
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 80% 35% at 50% 0%, rgba(168,85,247,0.06) 0%, transparent 60%)" }} />

      <div className="relative max-w-xl mx-auto px-5 py-10">
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

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.04 }} className="mb-6">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ boxShadow: [`0 0 0px ${rank.glowColor}`, `0 0 20px ${rank.glowColor}`, `0 0 0px ${rank.glowColor}`] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-sans font-bold flex-shrink-0"
              style={{ background: `${rank.color}18`, border: `1px solid ${rank.color}30`, color: rank.color, fontSize: "22px", fontFamily: DISPLAY_FONT }}
            >
              {displayName[0]?.toUpperCase() ?? "?"}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h1 className="font-sans font-bold text-white" style={{ fontSize: "22px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em" }}>
                Explorer Profile
              </h1>
              <p className="font-sans truncate" style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontFamily: FONT }}>
                {displayName}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="rounded-3xl p-5 mb-4"
          style={{
            background:  `linear-gradient(135deg, ${rank.color}08 0%, rgba(28,28,30,0.6) 100%)`,
            border:      `1px solid ${rank.color}22`,
            boxShadow:   `0 0 40px ${rank.glowColor.replace("0.4", "0.08")}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, marginBottom: 4 }}>EXPLORER RANK</p>
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="grid grid-cols-4 gap-2.5 mb-4"
        >
          {[
            { label: "Explored",  value: explored.length,  icon: <Compass className="w-3.5 h-3.5" />,  color: "#4ade80" },
            { label: "Saved",     value: saved.length,     icon: <Bookmark className="w-3.5 h-3.5" />, color: "#60a5fa" },
            { label: "Submitted", value: submitted.length, icon: <MapPin className="w-3.5 h-3.5" />,   color: "#A855F7" },
            { label: "Danger",    value: dangerScore,      icon: <Zap className="w-3.5 h-3.5" />,      color: "#f43f5e" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl px-3 py-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="rounded-2xl p-4 mb-6"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="font-sans font-semibold" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>Rank Ladder</span>
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="flex gap-1.5 mb-5 flex-wrap"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-150"
              style={{
                fontSize: "13px", fontWeight: 500, fontFamily: FONT, letterSpacing: "-0.01em", cursor: "pointer",
                background: tab === t.id ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.04)",
                border:     tab === t.id ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.07)",
                color:      tab === t.id ? "#A855F7" : "rgba(255,255,255,0.4)",
              }}
            >
              {t.icon}
              {t.label}
              <span
                className="font-sans font-semibold rounded-full px-1.5"
                style={{ fontSize: "10px", background: tab === t.id ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.06)", color: tab === t.id ? "#A855F7" : "rgba(255,255,255,0.25)" }}
              >
                {fetching && t.id !== "achievements" ? "·" : t.count ?? 0}
              </span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "achievements" ? (
              <AchievementsGrid stored={achStored} />
            ) : (
              <div className="flex flex-col gap-2.5">
                {fetching ? (
                  <div className="flex justify-center py-14">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(255,255,255,0.18)" }} />
                  </div>
                ) : locationDataMap[tab].length === 0 ? (
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
                  locationDataMap[tab].map((loc, i) => (
                    <ProfileCard key={String(loc.id)} location={loc} index={i} />
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AchievementsGrid({ stored }: { stored: Record<string, string> }) {
  const rarityOrder: ExplorationRarity[] = ["legendary", "epic", "rare", "common"];
  const sorted = [...ACHIEVEMENT_DEFS].sort((a, b) => {
    const ai = rarityOrder.indexOf(a.rarity);
    const bi = rarityOrder.indexOf(b.rarity);
    if (ai !== bi) return ai - bi;
    const au = stored[a.id] ? 0 : 1;
    const bu = stored[b.id] ? 0 : 1;
    return au - bu;
  });

  const unlockedCount = Object.keys(stored).length;
  const total         = ACHIEVEMENT_DEFS.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-sans" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
          {unlockedCount} / {total} unlocked
        </p>
        <div className="flex gap-2">
          {(["legendary","epic","rare","common"] as ExplorationRarity[]).map((r) => {
            const meta = RARITY_META[r];
            const count = ACHIEVEMENT_DEFS.filter((d) => d.rarity === r && stored[d.id]).length;
            const total = ACHIEVEMENT_DEFS.filter((d) => d.rarity === r).length;
            return (
              <div key={r} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <span className="font-sans" style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
                  {count}/{total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {sorted.map((def, i) => {
          const unlocked  = !!stored[def.id];
          const unlockedAt = stored[def.id];
          const meta      = RARITY_META[def.rarity];

          return (
            <motion.div
              key={def.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.03 }}
              className="rounded-2xl px-4 py-4 relative overflow-hidden"
              style={{
                background: unlocked ? `${meta.color}08` : "rgba(255,255,255,0.02)",
                border:     unlocked ? `1px solid ${meta.color}25` : "1px solid rgba(255,255,255,0.06)",
                opacity:    unlocked ? 1 : 0.5,
              }}
            >
              {unlocked && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${meta.color}10 0%, transparent 70%)` }}
                />
              )}

              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    background: unlocked ? `${meta.color}14` : "rgba(255,255,255,0.04)",
                    border:     unlocked ? `1px solid ${meta.color}25` : "1px solid rgba(255,255,255,0.07)",
                    filter:     unlocked ? "none" : "grayscale(1)",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{unlocked ? def.icon : "🔒"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="font-sans font-semibold"
                      style={{ fontSize: "9px", color: meta.color, fontFamily: FONT, letterSpacing: "0.05em", textTransform: "uppercase" }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="font-sans font-semibold" style={{ fontSize: "12px", color: unlocked ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)", fontFamily: FONT, letterSpacing: "-0.01em" }}>
                    {def.name}
                  </p>
                  <p className="font-sans mt-0.5" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: FONT, lineHeight: 1.5 }}>
                    {def.description}
                  </p>
                  {unlocked && unlockedAt && (
                    <p className="font-sans mt-1" style={{ fontSize: "9px", color: meta.color, fontFamily: FONT, opacity: 0.6 }}>
                      {new Date(unlockedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileCard({ location, index }: { location: Location; index: number }) {
  const meta         = CATEGORY_META[location.category];
  const riskStyle    = RISK_COLORS[location.riskLevel];
  const isExtreme    = location.riskLevel === "extreme";
  const pointsEarned = isExtreme ? 10 : location.riskLevel === "high" ? 5 : location.riskLevel === "medium" ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{
        background: isExtreme ? "rgba(244,63,94,0.03)" : "rgba(255,255,255,0.03)",
        border:     isExtreme ? "1px solid rgba(244,63,94,0.15)" : "1px solid rgba(255,255,255,0.07)",
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
          <span className="font-sans capitalize" style={{ fontSize: "12px", color: riskStyle.color, fontFamily: FONT }}>{riskStyle.label} risk</span>
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
