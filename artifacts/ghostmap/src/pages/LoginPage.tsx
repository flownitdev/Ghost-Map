import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/__replauth";
    }
  }, [user, loading]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#0c0b11" }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse 55% 45% at 50% 40%, rgba(168,85,247,0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full mx-5 flex flex-col items-center gap-4"
        style={{ maxWidth: 400 }}
      >
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}
        >
          <span style={{ fontSize: "26px" }}>👻</span>
        </div>

        <h1
          className="font-sans font-bold text-white text-center"
          style={{ fontSize: "24px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em" }}
        >
          GhostMap
        </h1>

        <p className="font-sans text-center" style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)", fontFamily: FONT }}>
          Redirecting to sign in…
        </p>

        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#A855F7" }} />

        <button
          onClick={() => navigate("/")}
          className="font-sans text-sm mt-2"
          style={{ color: "rgba(255,255,255,0.25)", fontFamily: FONT, cursor: "pointer", background: "none", border: "none" }}
        >
          ← Back to map
        </button>
      </motion.div>
    </div>
  );
}
