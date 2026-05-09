import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, MapPin, Loader2 } from "lucide-react";
import type { Location, LocationCategory, RiskLevel } from "@/types/location";
import { CATEGORY_META, RISK_COLORS } from "@/lib/mapUtils";

const CATEGORIES: LocationCategory[] = ["factory", "hospital", "mall", "school", "tunnel", "industrial"];
const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high"];

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<Location, "id">) => Promise<void>;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 28, stiffness: 280, mass: 0.8 } },
  exit: { opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="font-sans uppercase"
        style={{ fontSize: "9px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "rgba(255,255,255,0.85)",
  fontSize: "13px",
  padding: "10px 12px",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  caretColor: "#FA4817",
};

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
    setDescription(""); setRiskLevel("medium"); setAbandonmentScore("50");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const score = parseInt(abandonmentScore, 10);

    if (!name.trim()) return setError("Name is required.");
    if (isNaN(lat) || lat < -90 || lat > 90) return setError("Latitude must be between -90 and 90.");
    if (isNaN(lng) || lng < -180 || lng > 180) return setError("Longitude must be between -180 and 180.");
    if (!description.trim()) return setError("Description is required.");
    if (isNaN(score) || score < 0 || score > 100) return setError("Abandonment score must be 0–100.");

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        category,
        latitude: lat,
        longitude: lng,
        description: description.trim(),
        riskLevel,
        abandonmentScore: score,
        lastVisited: new Date().toISOString().slice(0, 7),
      });
      reset();
      onClose();
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
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[1100]"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed z-[1200] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full"
            style={{ maxWidth: "480px", padding: "0 16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, rgba(22,21,25,0.97) 0%, rgba(16,15,18,0.97) 100%)",
                backdropFilter: "blur(32px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(250,72,23,0.08)",
              }}
            >
              {/* Header strip */}
              <div
                className="h-[2px] w-full"
                style={{
                  background: "linear-gradient(90deg, #FA4817 0%, #FA481755 60%, transparent 100%)",
                  boxShadow: "0 0 10px #FA481780",
                }}
              />

              <div className="px-7 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(250,72,23,0.12)", border: "1px solid rgba(250,72,23,0.25)" }}
                    >
                      <MapPin className="w-3.5 h-3.5" style={{ color: "#FA4817" }} />
                    </div>
                    <div>
                      <h2
                        className="font-title font-bold text-white leading-none"
                        style={{ fontSize: "14px", letterSpacing: "0.06em" }}
                      >
                        Add Location
                      </h2>
                      <p
                        className="font-sans mt-1 leading-none"
                        style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em" }}
                      >
                        Submit a new site to GhostMap
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleClose}
                    className="w-7 h-7 flex items-center justify-center rounded-lg"
                    style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Name */}
                  <Field label="Location Name">
                    <input
                      type="text"
                      placeholder="e.g. Abandoned Steel Mill"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={inputStyle}
                    />
                  </Field>

                  {/* Category */}
                  <Field label="Category">
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => {
                        const meta = CATEGORY_META[cat];
                        const isActive = category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className="px-3 py-1.5 rounded-full transition-all duration-120"
                            style={{
                              fontSize: "10.5px",
                              fontWeight: 500,
                              letterSpacing: "0.04em",
                              background: isActive ? `${meta.color}22` : "rgba(255,255,255,0.04)",
                              border: isActive ? `1px solid ${meta.color}66` : "1px solid rgba(255,255,255,0.07)",
                              color: isActive ? meta.color : "rgba(255,255,255,0.35)",
                              boxShadow: isActive ? `0 0 10px ${meta.color}33` : "none",
                            }}
                          >
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {/* Lat / Lng */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Latitude">
                      <input
                        type="number"
                        step="any"
                        placeholder="48.8566"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        style={inputStyle}
                      />
                    </Field>
                    <Field label="Longitude">
                      <input
                        type="number"
                        step="any"
                        placeholder="2.3522"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        style={inputStyle}
                      />
                    </Field>
                  </div>

                  {/* Description */}
                  <Field label="Description">
                    <textarea
                      placeholder="Describe what makes this site special…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
                    />
                  </Field>

                  {/* Risk Level */}
                  <Field label="Risk Level">
                    <div className="flex gap-2">
                      {RISK_LEVELS.map((level) => {
                        const rStyle = RISK_COLORS[level];
                        const isActive = riskLevel === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setRiskLevel(level)}
                            className="flex-1 py-2 rounded-lg capitalize text-xs font-semibold transition-all duration-120"
                            style={{
                              background: isActive ? rStyle.bg : "rgba(255,255,255,0.04)",
                              border: isActive ? `1px solid ${rStyle.border}66` : "1px solid rgba(255,255,255,0.07)",
                              color: isActive ? rStyle.color : "rgba(255,255,255,0.35)",
                              boxShadow: isActive ? `0 0 10px ${rStyle.bg}` : "none",
                            }}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {/* Abandonment Score */}
                  <Field label={`Abandonment Score — ${abandonmentScore}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={abandonmentScore}
                        onChange={(e) => setAbandonmentScore(e.target.value)}
                        className="flex-1 accent-[#FA4817]"
                        style={{ accentColor: "#FA4817" }}
                      />
                      <span
                        className="font-title font-bold tabular-nums w-8 text-right"
                        style={{
                          fontSize: "13px",
                          color:
                            parseInt(abandonmentScore) >= 80
                              ? "#FA4817"
                              : parseInt(abandonmentScore) >= 55
                              ? "#92a5d1"
                              : "#4ade80",
                        }}
                      >
                        {abandonmentScore}
                      </span>
                    </div>
                  </Field>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="font-sans text-xs"
                        style={{ color: "#FA4817" }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={!submitting ? { scale: 1.015, boxShadow: "0 0 24px rgba(250,72,23,0.28)" } : {}}
                    whileTap={!submitting ? { scale: 0.985 } : {}}
                    transition={{ duration: 0.15 }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-1"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.14em",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: submitting ? "rgba(250,72,23,0.08)" : "rgba(250,72,23,0.14)",
                      border: "1px solid rgba(250,72,23,0.32)",
                      color: "#FA4817",
                      opacity: submitting ? 0.6 : 1,
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
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
