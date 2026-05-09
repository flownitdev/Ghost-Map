import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#111012" }}
    >
      {/* Background radial glow */}
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
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(22,21,25,0.97) 0%, rgba(16,15,18,0.97) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          }}
        >
          {/* Accent strip */}
          <div
            className="h-[2px] w-full"
            style={{
              background: "linear-gradient(90deg, #FA4817 0%, #FA481755 60%, transparent 100%)",
              boxShadow: "0 0 10px #FA481780",
            }}
          />

          <div className="px-8 py-9">
            {/* Brand */}
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(250,72,23,0.35)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
                  }
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(250,72,23,0.35)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
                  }
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

              {/* Error */}
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

              {/* Submit */}
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
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {loading ? "Signing in…" : "Sign In"}
              </motion.button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center font-sans text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="font-medium transition-colors duration-150"
                style={{ color: "#FA4817" }}
              >
                Create one
              </button>
            </p>
          </div>
        </div>

        {/* Back to map */}
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
