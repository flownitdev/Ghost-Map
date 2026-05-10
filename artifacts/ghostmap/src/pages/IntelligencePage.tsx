import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Brain, Zap, CheckCircle2, XCircle, Loader2,
  MapPin, ChevronDown, ChevronUp, RefreshCcw, Clock, Filter,
  Cpu, AlertTriangle, Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_EMAILS } from "@/types/rank";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

interface Candidate {
  id: string;
  name: string;
  locationHint: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  confidenceScore: number;
  aiReasoning: string;
  sourceSignals: string[];
  status: "pending" | "approved" | "rejected";
  scannedAt: string;
}

function confidenceColor(score: number): string {
  if (score >= 80) return "#4ade80";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#f43f5e";
}

function confidenceLabel(score: number): string {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  if (score >= 40) return "Low";
  return "Speculative";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ConfidenceBar({ score }: { score: number }) {
  const color = confidenceColor(score);
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span
        className="font-sans font-semibold tabular-nums"
        style={{ fontSize: "11px", color, fontFamily: FONT, minWidth: 28, textAlign: "right" }}
      >
        {score}%
      </span>
    </div>
  );
}

function CandidateCard({
  candidate, onReview,
}: {
  candidate: Candidate;
  onReview: (id: string, status: "approved" | "rejected") => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const color = confidenceColor(candidate.confidenceScore);

  async function handle(status: "approved" | "rejected") {
    setLoading(true);
    try { await onReview(candidate.id, status); } finally { setLoading(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, height: 0, overflow: "hidden" }}
      layout
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}44 ${candidate.confidenceScore}%, transparent 100%)` }}
      />
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className="font-sans font-semibold text-white truncate"
                style={{ fontSize: "14px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em" }}
              >
                {candidate.name}
              </span>
              <span
                className="px-2 py-0.5 rounded-full capitalize"
                style={{ fontSize: "10px", fontFamily: FONT, color: "#A855F7", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
              >
                {candidate.category}
              </span>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{ fontSize: "10px", fontFamily: FONT, color, background: `${color}12`, border: `1px solid ${color}28` }}
              >
                {confidenceLabel(candidate.confidenceScore)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
              <p className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
                {candidate.locationHint}
                {candidate.latitude && candidate.longitude
                  ? ` · ${candidate.latitude.toFixed(4)}, ${candidate.longitude.toFixed(4)}`
                  : ""}
                {" · "}{timeAgo(candidate.scannedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", cursor: "pointer", border: "none" }}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Confidence bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-sans" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Confidence Score
            </p>
          </div>
          <ConfidenceBar score={candidate.confidenceScore} />
        </div>

        {/* AI Reasoning — always visible */}
        <div
          className="rounded-xl p-3 mb-3"
          style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.12)" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Brain className="w-3 h-3" style={{ color: "#A855F7" }} />
            <p className="font-sans" style={{ fontSize: "10px", color: "rgba(168,85,247,0.7)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              AI Reasoning
            </p>
          </div>
          <p className="font-sans" style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.55)", fontFamily: FONT, lineHeight: 1.7 }}>
            {candidate.aiReasoning}
          </p>
        </div>

        {/* Expanded: source signals */}
        <AnimatePresence>
          {expanded && candidate.sourceSignals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 overflow-hidden"
            >
              <p className="font-sans mb-2" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Detected Signals
              </p>
              <div className="flex flex-wrap gap-1.5">
                {candidate.sourceSignals.map((signal, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-lg"
                    style={{ fontSize: "10.5px", fontFamily: FONT, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {candidate.status === "pending" && (
          <div className="flex gap-2">
            <motion.button
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              onClick={() => handle("approved")}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
              style={{
                fontSize: "12px", fontWeight: 500, fontFamily: FONT,
                background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.22)",
                color: "#4ade80", opacity: loading ? 0.4 : 1, cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Approve
            </motion.button>
            <motion.button
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              onClick={() => handle("rejected")}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
              style={{
                fontSize: "12px", fontWeight: 500, fontFamily: FONT,
                background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.22)",
                color: "#f43f5e", opacity: loading ? 0.4 : 1, cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <XCircle className="w-3 h-3" />
              Reject
            </motion.button>
          </div>
        )}

        {candidate.status !== "pending" && (
          <div
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl"
            style={{
              fontSize: "12px", fontFamily: FONT,
              color: candidate.status === "approved" ? "#4ade80" : "rgba(255,255,255,0.25)",
              background: candidate.status === "approved" ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${candidate.status === "approved" ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            {candidate.status === "approved" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {candidate.status === "approved" ? "Approved" : "Rejected"}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Scan Panel ───────────────────────────────────────────────────────────────

function ScanPanel({ onScanned }: { onScanned: () => void }) {
  const [query, setQuery] = useState("dead malls, closed factories, abandoned hospitals");
  const [region, setRegion] = useState("USA, UK, France, Germany, Eastern Europe");
  const [count, setCount] = useState(6);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    setScanning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/intelligence/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, region, count }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { count: number };
      setResult(data);
      onScanned();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  const fieldStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "12px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    padding: "9px 12px",
    outline: "none",
    fontFamily: FONT,
    width: "100%",
    caretColor: "#A855F7",
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.14)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(168,85,247,0.15)" }}
        >
          <Cpu className="w-3.5 h-3.5" style={{ color: "#A855F7" }} />
        </div>
        <div>
          <p className="font-sans font-semibold text-white" style={{ fontSize: "13px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em" }}>
            AI Intelligence Scan
          </p>
          <p className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
            Gemini analyzes patterns to surface potential abandoned places
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="font-sans mb-1.5" style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Search Focus
          </p>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="dead malls, closed factories, abandoned hospitals…"
            style={fieldStyle}
          />
        </div>
        <div>
          <p className="font-sans mb-1.5" style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Region
          </p>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="USA, UK, Eastern Europe…"
            style={fieldStyle}
          />
        </div>
        <div>
          <p className="font-sans mb-1.5" style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Candidates to generate: {count}
          </p>
          <input
            type="range" min={3} max={12} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#A855F7" }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 mb-3 p-3 rounded-xl" style={{ background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.18)" }}>
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#f43f5e" }} />
          <p className="font-sans" style={{ fontSize: "12px", color: "#f43f5e", fontFamily: FONT }}>{error}</p>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 mb-3 p-3 rounded-xl"
          style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)" }}
        >
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4ade80" }} />
          <p className="font-sans" style={{ fontSize: "12px", color: "#4ade80", fontFamily: FONT }}>
            {result.count} candidate{result.count !== 1 ? "s" : ""} added for review
          </p>
        </motion.div>
      )}

      <motion.button
        whileHover={!scanning ? { scale: 1.01 } : {}}
        whileTap={!scanning ? { scale: 0.99 } : {}}
        onClick={handleScan}
        disabled={scanning}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl"
        style={{
          fontSize: "13px", fontWeight: 600, fontFamily: FONT,
          background: scanning ? "rgba(168,85,247,0.07)" : "rgba(168,85,247,0.14)",
          border: "1px solid rgba(168,85,247,0.3)",
          color: "#A855F7", opacity: scanning ? 0.6 : 1,
          cursor: scanning ? "not-allowed" : "pointer",
        }}
      >
        {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
        {scanning ? "Scanning intelligence sources…" : "Run AI Scan"}
      </motion.button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type StatusFilter = "pending" | "approved" | "rejected" | "all";

export default function IntelligencePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  const loadCandidates = useCallback(async (status: StatusFilter = statusFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/intelligence/candidates?status=${status}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setCandidates(await res.json() as Candidate[]);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadCandidates(statusFilter);
  }, [statusFilter]);

  async function handleReview(id: string, status: "approved" | "rejected") {
    await fetch(`/api/intelligence/candidates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewedBy: user?.email ?? user?.id }),
    });
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  }

  const pendingCount = candidates.filter((c) => c.status === "pending").length;
  const highConfidence = candidates.filter((c) => c.confidenceScore >= 75).length;

  return (
    <div className="min-h-screen" style={{ background: "#0c0b11" }}>
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(168,85,247,0.05) 0%, transparent 70%)" }} />

      <div className="relative max-w-2xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center justify-center w-9 h-9 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" style={{ color: "#A855F7" }} />
              <h1 className="font-sans font-bold text-white" style={{ fontSize: "20px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em" }}>
                AI Intelligence
              </h1>
              {pendingCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-white font-sans font-semibold"
                  style={{ fontSize: "10px", background: "#A855F7", fontFamily: FONT }}
                >
                  {pendingCount}
                </span>
              )}
            </div>
            <p className="font-sans" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
              AI-surfaced abandoned places awaiting moderator review
            </p>
          </div>
        </div>

        {/* Stats row */}
        {candidates.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Pending Review", value: pendingCount, color: "#A855F7" },
              { label: "High Confidence", value: highConfidence, color: "#4ade80" },
              { label: "Total Scanned", value: candidates.length, color: "rgba(255,255,255,0.4)" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-2xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="font-sans font-bold" style={{ fontSize: "22px", color, fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em" }}>
                  {value}
                </p>
                <p className="font-sans" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Scan panel (admins only) */}
        {isAdmin && (
          <div className="mb-6">
            <ScanPanel onScanned={() => loadCandidates(statusFilter)} />
          </div>
        )}

        {/* Filter + candidates */}
        <div className="mb-4 flex items-center justify-between">
          <p className="font-sans font-semibold text-white" style={{ fontSize: "13px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em" }}>
            Candidates
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadCandidates(statusFilter)}
              className="flex items-center justify-center w-7 h-7 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="appearance-none pl-3 pr-7 py-2 rounded-xl outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: FONT }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "rgba(255,255,255,0.2)" }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#A855F7" }} />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-16">
            <Eye className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="font-sans" style={{ fontSize: "14px", color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>
              No candidates yet
            </p>
            <p className="font-sans mt-1" style={{ fontSize: "12px", color: "rgba(255,255,255,0.15)", fontFamily: FONT }}>
              {isAdmin ? "Run a scan above to surface potential abandoned places." : "Check back after an admin runs a scan."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {candidates.map((c) => (
                <CandidateCard key={c.id} candidate={c} onReview={handleReview} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
