import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Compass, LogIn, UserPlus, ChevronDown, Shield, Settings } from "lucide-react";
import { ADMIN_EMAILS } from "@/types/rank";
import { useAuth } from "@/contexts/AuthContext";
import { RankBadge } from "@/components/Rank/RankBadge";
import type { UserStats } from "@/types/rank";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

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
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl"
        style={{
          background: "rgba(18,17,24,0.78)",
          backdropFilter: "blur(48px)",
          WebkitBackdropFilter: "blur(48px)",
          border: open ? "1px solid rgba(250,72,23,0.2)" : "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "border-color 0.2s",
        }}
        data-testid="user-menu-trigger"
      >
        {user ? (
          <>
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 font-sans font-bold"
              style={{
                background: "rgba(250,72,23,0.12)",
                color: "#FA4817",
                fontSize: "12px",
                fontFamily: DISPLAY_FONT,
              }}
            >
              {initial}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span
                className="max-w-[110px] truncate font-sans"
                style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.55)", fontFamily: FONT, letterSpacing: "-0.01em", lineHeight: 1.2 }}
              >
                {user.email}
              </span>
              {stats && (
                <span style={{ fontSize: "9.5px", color: stats.rank.color, fontFamily: FONT, lineHeight: 1.3 }}>
                  {stats.rank.emoji} {stats.rank.label}
                </span>
              )}
            </div>
            <ChevronDown
              className="w-3 h-3"
              style={{
                color: "rgba(255,255,255,0.22)",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
              <User className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
            <span className="font-sans" style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.38)", fontFamily: FONT }}>
              Sign In
            </span>
            <ChevronDown className="w-3 h-3" style={{ color: "rgba(255,255,255,0.2)" }} />
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 rounded-2xl overflow-hidden"
            style={{
              minWidth: 224,
              background: "rgba(18,17,24,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 56px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
              backdropFilter: "blur(56px)",
            }}
          >
            {user ? (
              <>
                {/* User info */}
                <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p
                      className="font-sans font-semibold text-white truncate"
                      style={{ fontSize: "12.5px", fontFamily: FONT, letterSpacing: "-0.01em" }}
                    >
                      {user.email}
                    </p>
                    {stats?.isAdmin && (
                      <span className="flex items-center gap-1" style={{ fontSize: "9.5px", color: "#f59e0b" }}>
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </span>
                    )}
                  </div>
                  {stats && (
                    <div className="flex items-center gap-2">
                      <RankBadge rank={stats.rank} size="sm" animated={false} />
                      <span style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>
                        {stats.totalPoints} pts
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats mini row */}
                {stats && (
                  <div
                    className="grid grid-cols-3 px-4 py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {[
                      { label: "Explored", value: stats.exploredCount },
                      { label: "Saved", value: stats.savedCount },
                      { label: "Danger", value: stats.dangerScore },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p
                          className="font-sans font-bold text-white"
                          style={{ fontSize: "15px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em" }}
                        >
                          {s.value}
                        </p>
                        <p
                          className="font-sans"
                          style={{ fontSize: "8.5px", color: "rgba(255,255,255,0.25)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.04em" }}
                        >
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-1.5">
                  <MenuItem
                    icon={<Compass className="w-3.5 h-3.5" />}
                    label="My Profile"
                    onClick={() => { navigate("/profile"); setOpen(false); }}
                  />
                  {user?.email && ADMIN_EMAILS.includes(user.email) && (
                    <MenuItem
                      icon={<Settings className="w-3.5 h-3.5" />}
                      label="Ghost Control"
                      onClick={() => { navigate("/admin"); setOpen(false); }}
                    />
                  )}
                </div>

                <div className="p-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <MenuItem
                    icon={<LogOut className="w-3.5 h-3.5" />}
                    label="Sign Out"
                    danger
                    onClick={async () => { await signOut(); setOpen(false); }}
                  />
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

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: danger ? "rgba(244,63,94,0.07)" : "rgba(255,255,255,0.05)" }}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left"
      style={{
        color: danger ? "#f43f5e" : "rgba(255,255,255,0.6)",
        fontSize: "12.5px",
        fontFamily: FONT,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        letterSpacing: "-0.01em",
      }}
    >
      <span style={{ opacity: 0.6 }}>{icon}</span>
      {label}
    </motion.button>
  );
}
