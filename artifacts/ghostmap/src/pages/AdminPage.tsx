import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, Clock, CheckCircle2, XCircle, MapPin, Globe,
  Search, AlertTriangle, Loader2, RefreshCcw, Building2, ChevronDown,
  ChevronUp, Database, ShieldCheck, HelpCircle, Filter, Brain,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_EMAILS } from "@/types/rank";
import {
  fetchSubmissions, approveSubmission, rejectSubmission,
  fetchOSMCandidates, bulkAddLocations, fetchLocations,
  updateVerificationState,
} from "@/data/locationService";
import { VerificationBadge } from "@/components/Location/VerificationBadge";
import { nearbyLocations } from "@/lib/geo";
import type { Submission, VerificationState } from "@/types/location";
import type { OSMCandidate } from "@/data/locationService";
import type { Location } from "@/types/location";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
const DISPLAY_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";

type Tab = "submissions" | "import" | "locations";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const RISK_COLORS: Record<string, string> = {
  low: "#4ade80", medium: "#f59e0b", high: "#f97316", extreme: "#f43f5e",
};

// ─── Submission Card ─────────────────────────────────────────────────────────

function SubmissionCard({
  sub, existingLocations, onApprove, onReject,
}: {
  sub: Submission;
  existingLocations: Location[];
  onApprove: () => void;
  onReject: (note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [loading, setLoading] = useState(false);

  const nearby = useMemo(
    () => nearbyLocations(sub.latitude, sub.longitude, existingLocations, 0.5),
    [sub, existingLocations]
  );

  async function handleApprove() {
    setLoading(true);
    try { await onApprove(); } finally { setLoading(false); }
  }

  async function handleReject() {
    if (!rejectNote.trim()) return;
    setLoading(true);
    try { await onReject(rejectNote); } finally { setLoading(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, height: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className="font-sans font-semibold text-white truncate"
                style={{ fontSize: "14px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em" }}
              >
                {sub.name}
              </span>
              <span
                className="px-2 py-0.5 rounded-full capitalize"
                style={{ fontSize: "10px", fontFamily: FONT, color: RISK_COLORS[sub.riskLevel] ?? "#fff", background: `${RISK_COLORS[sub.riskLevel] ?? "#888"}14`, border: `1px solid ${RISK_COLORS[sub.riskLevel] ?? "#888"}30` }}
              >
                {sub.riskLevel}
              </span>
              {nearby.length > 0 && (
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ fontSize: "10px", fontFamily: FONT, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.22)" }}
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {nearby.length} nearby
                </span>
              )}
            </div>
            <p className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
              {sub.latitude.toFixed(5)}, {sub.longitude.toFixed(5)} · {timeAgo(sub.submittedAt)}
            </p>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", cursor: "pointer", border: "none" }}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p
          className="font-sans mb-3 line-clamp-2"
          style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.4)", fontFamily: FONT, lineHeight: 1.7 }}
        >
          {sub.description}
        </p>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 space-y-2.5"
            >
              {sub.closureDate && (
                <Detail label="Closure date" value={sub.closureDate} />
              )}
              {sub.buildingStatus && sub.buildingStatus !== "unknown" && (
                <Detail label="Building status" value={sub.buildingStatus} />
              )}
              {sub.sourceAttribution && (
                <Detail label="Source" value={sub.sourceAttribution} />
              )}
              {sub.notes && (
                <Detail label="Notes" value={sub.notes} />
              )}
              {nearby.length > 0 && (
                <div>
                  <p className="font-sans mb-1.5" style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Possible duplicates within 500m
                  </p>
                  {nearby.map((loc) => (
                    <div key={loc.id} className="flex items-center gap-2 py-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
                        {loc.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {!rejecting ? (
          <div className="flex gap-2">
            <ActionBtn color="#4ade80" onClick={handleApprove} disabled={loading}>
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Approve
            </ActionBtn>
            <ActionBtn color="#f43f5e" onClick={() => setRejecting(true)} disabled={loading}>
              <XCircle className="w-3 h-3" />
              Reject
            </ActionBtn>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Rejection reason…"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              autoFocus
              className="w-full rounded-xl px-3 py-2 outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontSize: "13px", fontFamily: FONT, caretColor: "#f43f5e" }}
            />
            <div className="flex gap-2">
              <ActionBtn color="#f43f5e" onClick={handleReject} disabled={loading || !rejectNote.trim()}>
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Confirm Reject
              </ActionBtn>
              <ActionBtn color="#6b7280" onClick={() => { setRejecting(false); setRejectNote(""); }} disabled={loading}>
                Cancel
              </ActionBtn>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-sans" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p className="font-sans" style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.5)", fontFamily: FONT }}>
        {value}
      </p>
    </div>
  );
}

function ActionBtn({
  color, onClick, disabled, children,
}: {
  color: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
      style={{
        fontSize: "12px", fontWeight: 500, fontFamily: FONT,
        background: `${color}0f`,
        border: `1px solid ${color}28`,
        color,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

// ─── OSM Import ───────────────────────────────────────────────────────────────

function ImportTab({ onImported }: { onImported: () => void }) {
  const [south, setSouth] = useState("51.4");
  const [west, setWest] = useState("-0.2");
  const [north, setNorth] = useState("51.6");
  const [east, setEast] = useState("0.0");
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<OSMCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch() {
    setError(null);
    setLoading(true);
    setCandidates([]);
    setSelected(new Set());
    setImportedCount(null);
    try {
      const results = await fetchOSMCandidates(Number(south), Number(west), Number(north), Number(east));
      setCandidates(results);
      setSelected(new Set(results.map((r) => r.osmId)));
    } catch {
      setError("Failed to fetch from OpenStreetMap. Check your bounding box and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    const toImport = candidates.filter((c) => selected.has(c.osmId));
    if (!toImport.length) return;
    setImporting(true);
    try {
      const count = await bulkAddLocations(toImport.map((c) => ({
        name: c.name,
        category: c.category as import("@/types/location").LocationCategory,
        latitude: c.latitude,
        longitude: c.longitude,
        description: c.description,
        riskLevel: c.riskLevel as import("@/types/location").RiskLevel,
        abandonmentScore: c.abandonmentScore,
        lastVisited: new Date().toISOString().slice(0, 7),
        closureDate: c.closureDate,
        buildingStatus: c.buildingStatus as import("@/types/location").BuildingStatus,
        verificationState: "community_verified" as import("@/types/location").VerificationState,
        sourceType: "osm" as import("@/types/location").SourceType,
        sourceAttribution: c.sourceAttribution,
      })));
      setImportedCount(count);
      setCandidates([]);
      setSelected(new Set());
      onImported();
    } catch {
      setError("Import failed. Check Supabase RLS policies.");
    } finally {
      setImporting(false);
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
    <div className="space-y-6">
      {/* OSM section */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4" style={{ color: "#A855F7" }} />
          <p className="font-sans font-semibold text-white" style={{ fontSize: "13px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.02em" }}>
            OpenStreetMap Import
          </p>
        </div>
        <p className="font-sans mb-4" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, lineHeight: 1.7 }}>
          Fetch abandoned & disused locations from OSM Overpass within a bounding box.
        </p>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {[
            { label: "South lat", value: south, set: setSouth },
            { label: "West lng", value: west, set: setWest },
            { label: "North lat", value: north, set: setNorth },
            { label: "East lng", value: east, set: setEast },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <p className="font-sans mb-1" style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </p>
              <input type="number" step="any" value={value} onChange={(e) => set(e.target.value)} style={fieldStyle} />
            </div>
          ))}
        </div>

        <motion.button
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
          onClick={handleFetch}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl"
          style={{
            fontSize: "13px", fontWeight: 500, fontFamily: FONT,
            background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)",
            color: "#A855F7", opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          {loading ? "Querying Overpass…" : "Fetch Locations"}
        </motion.button>
      </div>

      {error && (
        <p className="font-sans text-sm" style={{ color: "#f43f5e", fontFamily: FONT }}>{error}</p>
      )}

      {importedCount !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)" }}
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#4ade80" }} />
          <p className="font-sans" style={{ fontSize: "13px", color: "#4ade80", fontFamily: FONT }}>
            Imported {importedCount} location{importedCount !== 1 ? "s" : ""} to GhostMap
          </p>
        </motion.div>
      )}

      {/* Candidates */}
      {candidates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-sans font-semibold text-white" style={{ fontSize: "13px", fontFamily: DISPLAY_FONT }}>
              {candidates.length} locations found
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(new Set(candidates.map((c) => c.osmId)))}
                className="font-sans"
                style={{ fontSize: "11px", color: "#A855F7", fontFamily: FONT, cursor: "pointer", background: "none", border: "none" }}
              >
                Select all
              </button>
              <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px" }}>·</span>
              <button
                onClick={() => setSelected(new Set())}
                className="font-sans"
                style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: FONT, cursor: "pointer", background: "none", border: "none" }}
              >
                None
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {candidates.map((c) => {
              const on = selected.has(c.osmId);
              return (
                <motion.button
                  key={c.osmId}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  onClick={() => setSelected((prev) => {
                    const next = new Set(prev);
                    on ? next.delete(c.osmId) : next.add(c.osmId);
                    return next;
                  })}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                  style={{ background: on ? "rgba(168,85,247,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${on ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.06)"}`, cursor: "pointer" }}
                >
                  <div
                    className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: on ? "#A855F7" : "rgba(255,255,255,0.06)", border: on ? "none" : "1px solid rgba(255,255,255,0.12)" }}
                  >
                    {on && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-white truncate" style={{ fontSize: "12.5px", fontFamily: FONT, fontWeight: 500 }}>
                      {c.name}
                    </p>
                    <p className="font-sans truncate" style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
                      {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)} · {c.category}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.button
            whileHover={!importing && selected.size > 0 ? { scale: 1.01 } : {}}
            whileTap={!importing && selected.size > 0 ? { scale: 0.99 } : {}}
            onClick={handleImport}
            disabled={importing || selected.size === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
            style={{
              fontSize: "13px", fontWeight: 600, fontFamily: FONT,
              background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
              color: "#4ade80", opacity: importing || selected.size === 0 ? 0.4 : 1, cursor: importing || selected.size === 0 ? "not-allowed" : "pointer",
            }}
          >
            {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            {importing ? "Importing…" : `Import ${selected.size} location${selected.size !== 1 ? "s" : ""}`}
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ─── Locations tab ────────────────────────────────────────────────────────────

const VERIFICATION_STATES: VerificationState[] = ["unverified", "community_verified", "demolished", "active_again"];
const STATE_ICONS: Record<VerificationState, React.ReactNode> = {
  unverified: <HelpCircle className="w-3 h-3" />,
  community_verified: <ShieldCheck className="w-3 h-3" />,
  demolished: <Building2 className="w-3 h-3" />,
  active_again: <RefreshCcw className="w-3 h-3" />,
};

function LocationsTab({ locations, onRefresh }: { locations: Location[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState<VerificationState | "all">("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return locations.filter((l) => {
      if (filter !== "all" && l.verificationState !== filter) return false;
      if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [locations, filter, search]);

  async function handleVerify(id: number | string, state: VerificationState) {
    setUpdating(String(id));
    try {
      await updateVerificationState(id, state);
      onRefresh();
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
          <input
            type="text"
            placeholder="Search locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", fontSize: "13px", fontFamily: FONT, caretColor: "#A855F7" }}
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as VerificationState | "all")}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: FONT }}
          >
            <option value="all">All states</option>
            {VERIFICATION_STATES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>

      <p className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>
        {filtered.length} location{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-2 max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {filtered.map((loc) => (
          <div
            key={loc.id}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-sans text-white truncate" style={{ fontSize: "13px", fontFamily: DISPLAY_FONT, fontWeight: 500 }}>
                {loc.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <VerificationBadge state={loc.verificationState ?? "unverified"} size="sm" />
                {loc.sourceType && loc.sourceType !== "user_submission" && (
                  <span style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>
                    {loc.sourceType}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {VERIFICATION_STATES.map((state) => {
                const isActive = (loc.verificationState ?? "unverified") === state;
                const isUpdating = updating === String(loc.id);
                return (
                  <motion.button
                    key={state}
                    whileHover={!isActive && !isUpdating ? { scale: 1.05 } : {}}
                    onClick={() => !isActive && !isUpdating && handleVerify(loc.id, state)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg"
                    style={{
                      background: isActive ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                      border: isActive ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.07)",
                      color: isActive ? "#A855F7" : "rgba(255,255,255,0.2)",
                      cursor: isActive || isUpdating ? "default" : "pointer",
                    }}
                    title={state.replace("_", " ")}
                  >
                    {isUpdating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : STATE_ICONS[state]}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("submissions");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [subFilter, setSubFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, locs] = await Promise.all([
        fetchSubmissions(),
        fetchLocations(),
      ]);
      setSubmissions(subs);
      setLocations(locs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredSubs = useMemo(
    () => submissions.filter((s) => s.status === subFilter),
    [submissions, subFilter]
  );

  async function handleApprove(sub: Submission) {
    if (!user?.email) return;
    await approveSubmission(sub.id, user.email);
    await loadData();
  }

  async function handleReject(sub: Submission, note: string) {
    if (!user?.email) return;
    await rejectSubmission(sub.id, user.email, note);
    await loadData();
  }

  if (!isAdmin) return null;

  const TAB_CONFIG: { id: Tab; label: string; count?: number }[] = [
    { id: "submissions", label: "Submissions", count: submissions.filter((s) => s.status === "pending").length },
    { id: "import", label: "Import" },
    { id: "locations", label: "Locations", count: locations.length },
  ];

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "#0c0b11", fontFamily: FONT }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(168,85,247,0.05) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-2xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/")}
            className="w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </motion.button>

          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-2xl"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <Shield className="w-4 h-4" style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h1
                className="font-sans font-bold text-white"
                style={{ fontSize: "20px", fontFamily: DISPLAY_FONT, letterSpacing: "-0.03em" }}
              >
                Ghost Control
              </h1>
              <p className="font-sans" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
                Location moderation & ingestion
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/intelligence")}
              title="AI Intelligence"
              className="w-8 h-8 flex items-center justify-center rounded-xl"
              style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#A855F7", cursor: "pointer" }}
            >
              <Brain className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={loadData}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-6"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {TAB_CONFIG.map(({ id, label, count }) => (
            <motion.button
              key={id}
              whileHover={tab !== id ? { backgroundColor: "rgba(255,255,255,0.04)" } : {}}
              onClick={() => setTab(id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl"
              style={{
                fontSize: "12.5px", fontWeight: tab === id ? 600 : 400, fontFamily: FONT,
                background: tab === id ? "rgba(255,255,255,0.07)" : "transparent",
                border: tab === id ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                color: tab === id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                cursor: "pointer",
              }}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span
                  className="flex items-center justify-center rounded-full min-w-[18px] h-[18px] px-1"
                  style={{
                    fontSize: "10px", fontWeight: 700,
                    background: id === "submissions" && subFilter === "pending" ? "#f59e0b" : "rgba(255,255,255,0.12)",
                    color: id === "submissions" && subFilter === "pending" ? "#000" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {loading && tab !== "import" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-16"
            >
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgba(255,255,255,0.2)" }} />
            </motion.div>
          ) : tab === "submissions" ? (
            <motion.div key="subs" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Sub-filter */}
              <div className="flex gap-2 mb-4">
                {(["pending", "approved", "rejected"] as const).map((s) => {
                  const cnt = submissions.filter((sub) => sub.status === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => setSubFilter(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full capitalize"
                      style={{
                        fontSize: "11.5px", fontFamily: FONT, fontWeight: subFilter === s ? 600 : 400, cursor: "pointer",
                        background: subFilter === s ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                        border: subFilter === s ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
                        color: subFilter === s ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {s === "pending" && <Clock className="w-2.5 h-2.5" />}
                      {s === "approved" && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {s === "rejected" && <XCircle className="w-2.5 h-2.5" />}
                      {s} ({cnt})
                    </button>
                  );
                })}
              </div>

              {filteredSubs.length === 0 ? (
                <div className="text-center py-16">
                  <p className="font-sans" style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>
                    No {subFilter} submissions
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredSubs.map((sub) => (
                      <SubmissionCard
                        key={sub.id}
                        sub={sub}
                        existingLocations={locations}
                        onApprove={() => handleApprove(sub)}
                        onReject={(note) => handleReject(sub, note)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ) : tab === "import" ? (
            <motion.div key="import" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ImportTab onImported={loadData} />
            </motion.div>
          ) : (
            <motion.div key="locs" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LocationsTab locations={locations} onRefresh={loadData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
