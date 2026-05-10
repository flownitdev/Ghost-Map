import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

export default function SignupPage() {
  const { user, signIn, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [user, loading, navigate]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#0c0b11" }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 55% 45% at 50% 40%, rgba(168,85,247,0.06) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full mx-5"
        style={{ maxWidth: 400 }}
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(28,28,30,0.92)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="h-[1.5px] w-full"
            style={{ background: "linear-gradient(90deg, #A855F7 0%, #A855F755 60%, transparent 100%)" }}
          />

          <div className="px-8 py-10">
            <div className="mb-8">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
                style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}
              >
                <span style={{ fontSize: "22px" }}>👻</span>
              </div>
              <h1
                className="font-sans font-bold text-white"
                style={{ fontSize: "24px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em" }}
              >
                Join GhostMap
              </h1>
              <p className="font-sans mt-1.5" style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)", fontFamily: FONT }}>
                Create your account to start exploring
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={signIn}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl"
              style={{
                fontSize: "15px",
                fontWeight: 600,
                fontFamily: FONT,
                letterSpacing: "-0.01em",
                background: "rgba(168,85,247,0.14)",
                border: "1px solid rgba(168,85,247,0.3)",
                color: "#A855F7",
                cursor: "pointer",
              }}
            >
              Log in / Create Account
            </motion.button>

            <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-center font-sans text-sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
                Accounts are managed securely. No password needed.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center">
          <button
            onClick={() => navigate("/")}
            className="font-sans text-sm"
            style={{ color: "rgba(255,255,255,0.25)", fontFamily: FONT, cursor: "pointer", background: "none", border: "none" }}
          >
            ← Back to map
          </button>
        </p>
      </motion.div>
    </div>
  );
}
