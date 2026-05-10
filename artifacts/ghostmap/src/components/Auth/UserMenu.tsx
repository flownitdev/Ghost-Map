import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, BookmarkCheck, Compass, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function UserMenu() {
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
      {/* Avatar / trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: "linear-gradient(135deg, rgba(20,19,22,0.90) 0%, rgba(15,14,17,0.85) 100%)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: open
            ? "1px solid rgba(250,72,23,0.3)"
            : "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
          transition: "border-color 0.15s",
        }}
        data-testid="user-menu-trigger"
      >
        {user ? (
          <>
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-title font-bold"
              style={{
                background: "rgba(250,72,23,0.18)",
                border: "1px solid rgba(250,72,23,0.3)",
                color: "#FA4817",
                fontSize: "11px",
              }}
            >
              {initial}
            </div>
            <span
              className="font-sans hidden sm:block max-w-[120px] truncate"
              style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}
            >
              {user.email}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} />
            <span
              className="font-sans"
              style={{ fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)" }}
            >
              Sign In
            </span>
          </div>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 rounded-xl overflow-hidden"
            style={{
              minWidth: 200,
              background: "linear-gradient(160deg, rgba(22,21,25,0.97) 0%, rgba(16,15,18,0.97) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
              backdropFilter: "blur(28px)",
            }}
          >
            {user ? (
              <>
                {/* User info */}
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <p className="font-sans text-xs font-medium text-white truncate">{user.email}</p>
                  <p
                    className="font-sans mt-0.5"
                    style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)" }}
                  >
                    Explorer
                  </p>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <MenuItem
                    icon={<Compass className="w-3.5 h-3.5" />}
                    label="My Profile"
                    onClick={() => { navigate("/profile"); setOpen(false); }}
                  />
                  <MenuItem
                    icon={<BookmarkCheck className="w-3.5 h-3.5" />}
                    label="Saved & Explored"
                    onClick={() => { navigate("/profile"); setOpen(false); }}
                  />
                </div>

                <div
                  className="p-1.5 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
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
                <MenuItem
                  icon={<LogIn className="w-3.5 h-3.5" />}
                  label="Sign In"
                  onClick={() => { navigate("/login"); setOpen(false); }}
                />
                <MenuItem
                  icon={<UserPlus className="w-3.5 h-3.5" />}
                  label="Create Account"
                  onClick={() => { navigate("/signup"); setOpen(false); }}
                />
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
      whileHover={{ backgroundColor: danger ? "rgba(250,72,23,0.08)" : "rgba(255,255,255,0.04)" }}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left"
      style={{
        color: danger ? "#FA4817" : "rgba(255,255,255,0.55)",
        fontSize: "12px",
        fontFamily: "inherit",
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
    >
      <span style={{ opacity: 0.7 }}>{icon}</span>
      {label}
    </motion.button>
  );
}
