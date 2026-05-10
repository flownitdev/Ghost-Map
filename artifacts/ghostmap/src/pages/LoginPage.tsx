import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#0c0b11" }}
    >
      {/* Ambient glow */}
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
        className="relative w-full mx-5"
        style={{ maxWidth: 400 }}
      >
        {/* Card */}
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
            {/* Brand mark */}
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
                Sign In
              </h1>
              <p className="font-sans mt-1.5" style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)", fontFamily: FONT }}>
                Continue to GhostMap
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Email */}
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl font-sans text-sm outline-none transition-all duration-150"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "15px",
                    fontFamily: FONT,
                    letterSpacing: "-0.01em",
                    caretColor: "#A855F7",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.35)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl font-sans outline-none transition-all duration-150"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "15px",
                    fontFamily: FONT,
                    letterSpacing: "-0.01em",
                    caretColor: "#A855F7",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.35)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(255,255,255,0.22)", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-sans"
                  style={{ color: "#A855F7", fontFamily: FONT }}
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl mt-2"
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: FONT,
                  letterSpacing: "-0.01em",
                  background: loading ? "rgba(168,85,247,0.07)" : "rgba(168,85,247,0.14)",
                  border: "1px solid rgba(168,85,247,0.3)",
                  color: "#A855F7",
                  opacity: loading ? 0.55 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Signing in…" : "Sign In"}
              </motion.button>
            </form>

            <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-center font-sans text-sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="font-semibold transition-colors duration-150"
                  style={{ color: "#A855F7", cursor: "pointer" }}
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center">
          <button
            onClick={() => navigate("/")}
            className="font-sans text-sm"
            style={{ color: "rgba(255,255,255,0.25)", fontFamily: FONT, cursor: "pointer" }}
          >
            ← Back to map
          </button>
        </p>
      </motion.div>
    </div>
  );
}
