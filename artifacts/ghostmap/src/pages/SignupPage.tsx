import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const { signUp } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#111012" }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(250,72,23,0.07) 0%, transparent 70%)",
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
            background: "linear-gradient(160deg, rgba(22,21,25,0.97) 0%, rgba(16,15,18,0.97) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="h-[2px] w-full"
            style={{
              background: "linear-gradient(90deg, #FA4817 0%, #FA481755 60%, transparent 100%)",
              boxShadow: "0 0 10px #FA481780",
            }}
          />

          <div className="px-8 py-9">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-4"
                >
                  <CheckCircle2 className="w-10 h-10 mb-4" style={{ color: "#4ade80" }} />
                  <h2
                    className="font-title font-bold text-white mb-2"
                    style={{ fontSize: "18px", letterSpacing: "0.08em" }}
                  >
                    Account Created
                  </h2>
                  <p className="font-sans text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Check your email to confirm your account, then sign in.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="font-sans font-semibold text-sm"
                    style={{ color: "#FA4817" }}
                  >
                    Go to Sign In →
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-8">
                    <h1
                      className="font-title font-bold text-white mb-1"
                      style={{ fontSize: "22px", letterSpacing: "0.14em" }}
                    >
                      JOIN GHOSTMAP
                    </h1>
                    <p className="font-sans text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Create an account to save and explore sites
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl font-sans text-sm outline-none transition-all duration-150"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.85)",
                          caretColor: "#FA4817",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(250,72,23,0.35)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                      />
                    </div>

                    <div className="relative">
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-11 py-3 rounded-xl font-sans text-sm outline-none transition-all duration-150"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.85)",
                          caretColor: "#FA4817",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(250,72,23,0.35)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-sans"
                        style={{ color: "#FA4817" }}
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.015, boxShadow: "0 0 24px rgba(250,72,23,0.28)" } : {}}
                      whileTap={!loading ? { scale: 0.985 } : {}}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-1"
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.14em",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontFamily: "inherit",
                        background: loading ? "rgba(250,72,23,0.08)" : "rgba(250,72,23,0.14)",
                        border: "1px solid rgba(250,72,23,0.32)",
                        color: "#FA4817",
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {loading ? "Creating account…" : "Create Account"}
                    </motion.button>
                  </form>

                  <p className="mt-6 text-center font-sans text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
                    Already have an account?{" "}
                    <button
                      onClick={() => navigate("/login")}
                      className="font-medium"
                      style={{ color: "#FA4817" }}
                    >
                      Sign in
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-5 text-center">
          <button
            onClick={() => navigate("/")}
            className="font-sans text-xs hover:underline"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            ← Back to map
          </button>
        </p>
      </motion.div>
    </div>
  );
}
