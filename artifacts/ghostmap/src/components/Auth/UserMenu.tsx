import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Compass, LogIn, UserPlus, ChevronDown, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RankBadge } from "@/components/Rank/RankBadge";
import type { UserStats } from "@/types/rank";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

interface UserMenuProps {
  stats?: UserStats;
}

export function UserMenu({ stats }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div ref={ref} className="fixed top-5 left-5 z-[1001]">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl"
        style={{
          background: "rgba(28,28,30,0.82)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: open ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
          transition: "border-color 0.2s",
        }}
        data-testid="user-menu-trigger"
      >
        {user ? (
          <>
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 font-sans font-bold"
              style={{
                background: stats?.rank ? `${stats.rank.color}1a` : "rgba(168,85,247,0.18)",
                color: stats?.rank?.color ?? "#A855F7",
                fontSize: "12px",
                fontFamily: FONT,
              }}
            >
              {initial}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span
                className="max-w-[110px] truncate font-sans"
                style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontFamily: FONT, letterSpacing: "-0.01em", lineHeight: 1.2 }}
              >
                {user.email}
              </span>
              {stats && (
                <span style={{ fontSize: "10px", color: stats.rank.color, fontFamily: FONT, lineHeight: 1.2 }}>
                  {stats.rank.emoji} {stats.rank.label}
                </span>
              )}
            </div>
            <ChevronDown
              className="w-3.5 h-3.5"
              style={{ color: "rgba(255,255,255,0.28)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
              <User className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.35)" }} />
            </div>
            <span className="font-sans" style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontFamily: FONT }}>
              Sign In
            </span>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.22)" }} />
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 rounded-2xl overflow-hidden"
            style={{
              minWidth: 230,
              background: "rgba(28,28,30,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)",
              backdropFilter: "blur(48px)",
            }}
          >
            {user ? (
              <>
                {/* User info + rank */}
                <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-sans font-semibold text-white truncate" style={{ fontSize: "13px", fontFamily: FONT, letterSpacing: "-0.01em" }}>
                      {user.email}
                    </p>
                    {stats?.isAdmin && (
                      <span className="flex items-center gap-1" style={{ fontSize: "10px", color: "#f59e0b" }}>
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    )}
                  </div>
                  {stats && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <RankBadge rank={stats.rank} size="sm" animated={false} />
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
                        {stats.totalPoints} pts
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats mini row */}
                {stats && (
                  <div
                    className="grid grid-cols-3 gap-0 px-4 py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {[
                      { label: "Explored", value: stats.exploredCount },
                      { label: "Saved", value: stats.savedCount },
                      { label: "Danger", value: stats.dangerScore },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="font-sans font-bold text-white" style={{ fontSize: "15px", fontFamily: FONT }}>{s.value}</p>
                        <p className="font-sans" style={{ fontSize: "9px", color: "rgba(255,255,255,0.28)", fontFamily: FONT }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-1.5">
                  <MenuItem icon={<Compass className="w-3.5 h-3.5" />} label="My Profile" onClick={() => { navigate("/profile"); setOpen(false); }} />
                </div>

                <div className="p-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <MenuItem icon={<LogOut className="w-3.5 h-3.5" />} label="Sign Out" danger onClick={async () => { await signOut(); setOpen(false); }} />
                </div>
              </>
            ) : (
              <div className="p-1.5">
                <MenuItem icon={<LogIn className="w-3.5 h-3.5" />} label="Sign In" onClick={() => { navigate("/login"); setOpen(false); }} />
                <MenuItem icon={<UserPlus className="w-3.5 h-3.5" />} label="Create Account" onClick={() => { navigate("/signup"); setOpen(false); }} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <motion.button
      whileHover={{ backgroundColor: danger ? "rgba(244,63,94,0.08)" : "rgba(255,255,255,0.06)" }}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left"
      style={{ color: danger ? "#f43f5e" : "rgba(255,255,255,0.65)", fontSize: "13px", fontFamily: FONT, background: "transparent", border: "none", cursor: "pointer", letterSpacing: "-0.01em" }}
    >
      <span style={{ opacity: 0.65 }}>{icon}</span>
      {label}
    </motion.button>
  );
}
