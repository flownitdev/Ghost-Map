import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#0c0b11" }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(168,85,247,0.07) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full mx-4"
        style={{ maxWidth: 420 }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(16,15,22,0.97) 0%, rgba(12,11,17,0.97) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="h-[2px] w-full"
            style={{
              background: "linear-gradient(90deg, #A855F7 0%, #A855F755 60%, transparent 100%)",
              boxShadow: "0 0 10px #A855F780",
            }}
          />

          <div className="px-8 py-9 flex flex-col items-center text-center">
            <div className="mb-8">
              <h1
                className="font-title font-bold text-white mb-1"
                style={{ fontSize: "22px", letterSpacing: "0.14em" }}
              >
                GHOSTMAP
              </h1>
              <p className="font-sans text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Sign in to save & explore locations
              </p>
            </div>

            <motion.a
              href="/__replauth"
              whileHover={{ scale: 1.015, boxShadow: "0 0 24px rgba(168,85,247,0.28)" }}
              whileTap={{ scale: 0.985 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{
                fontSize: "11px",
                letterSpacing: "0.14em",
                fontWeight: 700,
                textTransform: "uppercase",
                fontFamily: "inherit",
                background: "rgba(168,85,247,0.14)",
                border: "1px solid rgba(168,85,247,0.32)",
                color: "#A855F7",
                textDecoration: "none",
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
              Log In
            </motion.a>
          </div>
        </div>

        <p className="mt-5 text-center font-sans text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          <button
            onClick={() => navigate("/")}
            className="hover:underline transition-all"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            ← Back to map
          </button>
        </p>
      </motion.div>
    </div>
  );
}
