import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Calendar, FileText, Loader2, CheckCircle } from "lucide-react";
import type { Location } from "@/types/location";

const FONT         = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

interface ExploreLogModalProps {
  location: Location;
  isOpen:   boolean;
  onClose:  () => void;
  onSave:   (data: { notes: string; visitedAt: string; photoUrl?: string }) => Promise<void>;
}

export function ExploreLogModal({ location, isOpen, onClose, onSave }: ExploreLogModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [notes,      setNotes]      = useState("");
  const [visitedAt,  setVisitedAt]  = useState(today);
  const [photoUrl,   setPhotoUrl]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

  async function handleSave() {
    if (!notes.trim() && !photoUrl.trim()) return;
    setSaving(true);
    try {
      await onSave({
        notes:      notes.trim(),
        visitedAt,
        photoUrl:   photoUrl.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); setNotes(""); setPhotoUrl(""); }, 900);
    } catch {
      // keep open on error
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1100]"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-4 z-[1101] mx-auto rounded-3xl overflow-hidden"
            style={{
              maxWidth: "460px",
              top:      "50%",
              transform: "translateY(-50%)",
              background: "rgba(18,17,26,0.96)",
              border:     "1px solid rgba(255,255,255,0.1)",
              boxShadow:  "0 24px 64px rgba(0,0,0,0.7)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div>
                <h2
                  className="font-sans font-bold text-white"
                  style={{ fontSize: "17px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.025em" }}
                >
                  Log Exploration
                </h2>
                <p className="font-sans mt-0.5 truncate" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontFamily: FONT, maxWidth: "280px" }}>
                  {location.name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-2" style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: FONT, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  <Calendar className="w-3 h-3" />
                  Visit Date
                </label>
                <input
                  type="date"
                  value={visitedAt}
                  max={today}
                  onChange={(e) => setVisitedAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl font-sans"
                  style={{
                    background:   "rgba(255,255,255,0.05)",
                    border:       "1px solid rgba(255,255,255,0.1)",
                    color:        "rgba(255,255,255,0.8)",
                    fontSize:     "13px",
                    fontFamily:   FONT,
                    outline:      "none",
                    colorScheme:  "dark",
                  }}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2" style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: FONT, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  <FileText className="w-3 h-3" />
                  Field Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you find? Describe the conditions, access, atmosphere..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl font-sans resize-none"
                  style={{
                    background:   "rgba(255,255,255,0.05)",
                    border:       "1px solid rgba(255,255,255,0.1)",
                    color:        "rgba(255,255,255,0.8)",
                    fontSize:     "13px",
                    fontFamily:   FONT,
                    outline:      "none",
                    lineHeight:   "1.7",
                  }}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2" style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: FONT, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  <Camera className="w-3 h-3" />
                  Photo URL <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl font-sans"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border:     "1px solid rgba(255,255,255,0.1)",
                    color:      "rgba(255,255,255,0.8)",
                    fontSize:   "13px",
                    fontFamily: FONT,
                    outline:    "none",
                  }}
                />
              </div>

              {photoUrl.trim() && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl overflow-hidden"
                  style={{ maxHeight: "140px" }}
                >
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full object-cover"
                    style={{ maxHeight: "140px" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </motion.div>
              )}
            </div>

            <div
              className="flex gap-3 px-6 py-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl font-sans font-semibold"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border:     "1px solid rgba(255,255,255,0.08)",
                  color:      "rgba(255,255,255,0.4)",
                  fontSize:   "13px",
                  fontFamily: FONT,
                  cursor:     "pointer",
                }}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSave}
                disabled={saving || (!notes.trim() && !photoUrl.trim())}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-sans font-semibold"
                style={{
                  background: saved ? "rgba(74,222,128,0.15)" : "rgba(168,85,247,0.15)",
                  border:     saved ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(168,85,247,0.3)",
                  color:      saved ? "#4ade80" : "#A855F7",
                  fontSize:   "13px",
                  fontFamily: FONT,
                  cursor:     saving || (!notes.trim() && !photoUrl.trim()) ? "not-allowed" : "pointer",
                  opacity:    !notes.trim() && !photoUrl.trim() ? 0.4 : 1,
                }}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <><CheckCircle className="w-3.5 h-3.5" /> Saved!</>
                ) : (
                  "Save Log"
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
