import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, MapPin, Loader2 } from "lucide-react";
import type { Location, LocationCategory, RiskLevel } from "@/types/location";
import { CATEGORY_META, RISK_COLORS } from "@/lib/mapUtils";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const CATEGORIES: LocationCategory[] = ["factory", "hospital", "mall", "school", "tunnel", "industrial"];
const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "extreme"];

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<Location, "id">) => Promise<void>;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, damping: 30, stiffness: 300, mass: 0.8 } },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.15 } },
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  color: "rgba(255,255,255,0.9)",
  fontSize: "14px",
  padding: "11px 13px",
  outline: "none",
  fontFamily: FONT,
  width: "100%",
  caretColor: "#A855F7",
  letterSpacing: "-0.01em",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-sans" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: FONT, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function AddLocationModal({ isOpen, onClose, onSubmit }: AddLocationModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<LocationCategory>("factory");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("medium");
  const [abandonmentScore, setAbandonmentScore] = useState("50");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName(""); setCategory("factory"); setLatitude(""); setLongitude("");
    setDescription(""); setRiskLevel("medium"); setAbandonmentScore("50"); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const score = parseInt(abandonmentScore, 10);
    if (!name.trim()) return setError("Name is required.");
    if (isNaN(lat) || lat < -90 || lat > 90) return setError("Latitude must be between −90 and 90.");
    if (isNaN(lng) || lng < -180 || lng > 180) return setError("Longitude must be between −180 and 180.");
    if (!description.trim()) return setError("Description is required.");
    if (isNaN(score) || score < 0 || score > 100) return setError("Score must be 0–100.");
    setError(null); setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(), category, latitude: lat, longitude: lng,
        description: description.trim(), riskLevel, abandonmentScore: score,
        lastVisited: new Date().toISOString().slice(0, 7),
        createdAt: new Date().toISOString(),
      });
      reset(); onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add location.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 z-[1100]"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
            onClick={handleClose}
          />

          <motion.div
            variants={modalVariants}
            initial="hidden" animate="visible" exit="exit"
            className="fixed z-[1200] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full"
            style={{ maxWidth: "480px", padding: "0 16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full rounded-3xl overflow-hidden"
              style={{
                background: "rgba(28,28,30,0.96)",
                backdropFilter: "blur(48px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div className="h-[1.5px] w-full" style={{ background: "linear-gradient(90deg, #A855F7 0%, #A855F755 60%, transparent 100%)" }} />

              <div className="px-6 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>
                      <MapPin className="w-4 h-4" style={{ color: "#A855F7" }} />
                    </div>
                    <div>
                      <h2 className="font-sans font-bold text-white" style={{ fontSize: "16px", fontFamily: FONT, letterSpacing: "-0.02em" }}>Add Location</h2>
                      <p className="font-sans mt-0.5" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>Submit a new site to GhostMap</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={handleClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Field label="Location name">
                    <input type="text" placeholder="e.g. Abandoned Steel Mill" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Category">
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => {
                        const meta = CATEGORY_META[cat];
                        const isActive = category === cat;
                        return (
                          <button key={cat} type="button" onClick={() => setCategory(cat)}
                            className="px-3.5 py-1.5 rounded-full transition-all duration-120"
                            style={{
                              fontSize: "12px", fontWeight: 500, fontFamily: FONT,
                              background: isActive ? `${meta.color}18` : "rgba(255,255,255,0.05)",
                              border: isActive ? `1px solid ${meta.color}44` : "1px solid rgba(255,255,255,0.09)",
                              color: isActive ? meta.color : "rgba(255,255,255,0.4)", cursor: "pointer",
                            }}>
                            {meta.emoji} {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Latitude">
                      <input type="number" step="any" placeholder="48.8566" value={latitude} onChange={(e) => setLatitude(e.target.value)} style={inputStyle} />
                    </Field>
                    <Field label="Longitude">
                      <input type="number" step="any" placeholder="2.3522" value={longitude} onChange={(e) => setLongitude(e.target.value)} style={inputStyle} />
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea placeholder="Describe what makes this site special…" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none", lineHeight: "1.65" }} />
                  </Field>

                  <Field label="Danger level">
                    <div className="grid grid-cols-4 gap-1.5">
                      {RISK_LEVELS.map((level) => {
                        const rs = RISK_COLORS[level];
                        const isActive = riskLevel === level;
                        return (
                          <button key={level} type="button" onClick={() => setRiskLevel(level)}
                            className="py-2.5 rounded-xl capitalize font-sans font-medium transition-all duration-120"
                            style={{
                              fontSize: "11px", fontFamily: FONT, letterSpacing: "-0.01em",
                              background: isActive ? rs.bg : "rgba(255,255,255,0.04)",
                              border: isActive ? `1px solid ${rs.border}55` : "1px solid rgba(255,255,255,0.08)",
                              color: isActive ? rs.color : "rgba(255,255,255,0.35)", cursor: "pointer",
                            }}>
                            {rs.label}
                          </button>
                        );
                      })}
                    </div>
                    {riskLevel === "extreme" && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="font-sans text-xs mt-1"
                        style={{ color: "#f43f5e", fontFamily: FONT }}>
                        ⚠ Extreme danger — requires Ghost rank or above to view
                      </motion.p>
                    )}
                  </Field>

                  <Field label={`Abandonment score — ${abandonmentScore}`}>
                    <div className="flex items-center gap-3 px-1">
                      <input type="range" min={0} max={100} value={abandonmentScore}
                        onChange={(e) => setAbandonmentScore(e.target.value)}
                        className="flex-1" style={{ accentColor: "#A855F7" }} />
                      <span className="font-sans font-bold tabular-nums w-8 text-right"
                        style={{
                          fontSize: "15px", fontFamily: FONT,
                          color: parseInt(abandonmentScore) >= 80 ? "#A855F7" : parseInt(abandonmentScore) >= 55 ? "#c084fc" : "#4ade80",
                        }}>
                        {abandonmentScore}
                      </span>
                    </div>
                  </Field>

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="font-sans text-sm" style={{ color: "#f43f5e", fontFamily: FONT }}>
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button type="submit" disabled={submitting}
                    whileHover={!submitting ? { scale: 1.01 } : {}}
                    whileTap={!submitting ? { scale: 0.99 } : {}}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl mt-1"
                    style={{
                      fontSize: "14px", fontWeight: 600, fontFamily: FONT, letterSpacing: "-0.01em",
                      background: submitting ? "rgba(168,85,247,0.08)" : "rgba(168,85,247,0.14)",
                      border: "1px solid rgba(168,85,247,0.3)", color: "#A855F7",
                      opacity: submitting ? 0.55 : 1, cursor: submitting ? "not-allowed" : "pointer",
                    }}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {submitting ? "Submitting…" : "Add to GhostMap"}
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
