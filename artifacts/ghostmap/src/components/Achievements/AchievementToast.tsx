import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Achievement } from "@/types/exploration";
import { RARITY_META } from "@/types/exploration";

const FONT         = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss:   () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const meta = achievement ? RARITY_META[achievement.rarity] : null;

  useEffect(() => {
    if (!achievement) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && meta && (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: -20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{   opacity: 0, y: -16,  scale: 0.94 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="fixed z-[1200] flex items-center gap-4 px-5 py-4 rounded-2xl"
          style={{
            top:            "20px",
            left:           "50%",
            transform:      "translateX(-50%)",
            background:     `linear-gradient(135deg, ${meta.color}10 0%, rgba(18,17,26,0.96) 100%)`,
            border:         `1px solid ${meta.color}30`,
            backdropFilter: "blur(40px)",
            boxShadow:      `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${meta.color}15, 0 0 40px ${meta.glow}`,
            maxWidth:       "380px",
            width:          "calc(100vw - 32px)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="w-12 h-12 flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}25` }}
          >
            <span style={{ fontSize: "22px" }}>{achievement.icon}</span>
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-sans font-bold"
                style={{ fontSize: "10px", color: meta.color, fontFamily: FONT, letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                Achievement Unlocked · {RARITY_META[achievement.rarity].label}
              </motion.span>
            </div>
            <p
              className="font-sans font-bold text-white"
              style={{ fontSize: "15px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em" }}
            >
              {achievement.icon} {achievement.name}
            </p>
            <p
              className="font-sans mt-0.5"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: FONT }}
            >
              {achievement.description}
            </p>
          </div>

          <button
            onClick={onDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.06)",
              border:     "none",
              color:      "rgba(255,255,255,0.3)",
              cursor:     "pointer",
            }}
          >
            <X className="w-3 h-3" />
          </button>

          <motion.div
            className="absolute bottom-0 left-0 h-[2px] rounded-b-2xl"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 5, ease: "linear" }}
            style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}44)` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
