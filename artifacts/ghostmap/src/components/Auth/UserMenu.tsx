import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Compass, LogIn, UserPlus, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

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
                background: "rgba(168,85,247,0.18)",
                color: "#A855F7",
                fontSize: "12px",
                fontFamily: FONT,
              }}
            >
              {initial}
            </div>
            <span
              className="font-sans hidden sm:block max-w-[130px] truncate"
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", fontFamily: FONT, letterSpacing: "-0.01em" }}
            >
              {user.email}
            </span>
            <ChevronDown
              className="w-3.5 h-3.5"
              style={{
                color: "rgba(255,255,255,0.28)",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <User className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.35)" }} />
            </div>
            <span
              className="font-sans"
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontFamily: FONT, letterSpacing: "-0.01em" }}
            >
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
            transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute left-0 mt-2 rounded-2xl overflow-hidden"
            style={{
              minWidth: 220,
              background: "rgba(28,28,30,0.94)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)",
              backdropFilter: "blur(48px)",
            }}
          >
            {user ? (
              <>
                {/* Account info */}
                <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p
                    className="font-sans font-semibold text-white truncate"
                    style={{ fontSize: "13px", fontFamily: FONT, letterSpacing: "-0.01em" }}
                  >
                    {user.email}
                  </p>
                  <p
                    className="font-sans mt-0.5"
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}
                  >
                    Explorer account
                  </p>
                </div>

                {/* Actions */}
                <div className="p-1.5">
                  <MenuItem
                    icon={<Compass className="w-3.5 h-3.5" />}
                    label="My Profile"
                    onClick={() => { navigate("/profile"); setOpen(false); }}
                  />
                </div>

                <div className="p-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
      whileHover={{ backgroundColor: danger ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.06)" }}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left"
      style={{
        color: danger ? "#A855F7" : "rgba(255,255,255,0.65)",
        fontSize: "13px",
        fontFamily: FONT,
        letterSpacing: "-0.01em",
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
    >
      <span style={{ opacity: 0.65 }}>{icon}</span>
      {label}
    </motion.button>
  );
}
