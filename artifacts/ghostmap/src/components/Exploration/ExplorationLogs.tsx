import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, Camera, Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import type { ExplorationLog } from "@/types/exploration";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

interface ExplorationLogsProps {
  logs:          ExplorationLog[];
  loading:       boolean;
  onAddLog:      () => void;
  onDeleteLog:   (id: string) => void;
}

export function ExplorationLogs({ logs, loading, onAddLog, onDeleteLog }: ExplorationLogsProps) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? logs : logs.slice(0, 2);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.25)" }} />
          <span
            className="font-sans font-semibold"
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: FONT, letterSpacing: "-0.01em" }}
          >
            Exploration Logs
          </span>
          {logs.length > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full font-sans font-semibold"
              style={{ fontSize: "9.5px", background: "rgba(168,85,247,0.15)", color: "#A855F7" }}
            >
              {logs.length}
            </span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAddLog}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
          style={{
            background: "rgba(168,85,247,0.1)",
            border:     "1px solid rgba(168,85,247,0.25)",
            color:      "#A855F7",
            fontSize:   "11px",
            fontFamily: FONT,
            cursor:     "pointer",
          }}
        >
          <Plus className="w-3 h-3" />
          Add Log
        </motion.button>
      </div>

      {loading ? (
        <div className="py-4 text-center">
          <span className="font-sans" style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>
            Loading logs…
          </span>
        </div>
      ) : logs.length === 0 ? (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onAddLog}
          className="w-full py-5 rounded-xl flex flex-col items-center gap-2"
          style={{
            background: "rgba(255,255,255,0.02)",
            border:     "1px dashed rgba(255,255,255,0.1)",
            cursor:     "pointer",
          }}
        >
          <BookOpen className="w-5 h-5" style={{ color: "rgba(255,255,255,0.15)" }} />
          <span className="font-sans" style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", fontFamily: FONT }}>
            No logs yet — add your first field notes
          </span>
        </motion.button>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {visible.map((log, i) => (
              <LogEntry key={log.id} log={log} index={i} onDelete={() => onDeleteLog(log.id)} />
            ))}
          </AnimatePresence>

          {logs.length > 2 && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border:     "1px solid rgba(255,255,255,0.07)",
                color:      "rgba(255,255,255,0.35)",
                fontSize:   "11px",
                fontFamily: FONT,
                cursor:     "pointer",
              }}
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Show less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> {logs.length - 2} more log{logs.length - 2 > 1 ? "s" : ""}</>
              )}
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}

function LogEntry({
  log, index, onDelete,
}: {
  log: ExplorationLog;
  index: number;
  onDelete: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const date = new Date(log.visitedAt).toLocaleDateString("en", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {log.photoUrl && (
        <div className="relative" style={{ height: "100px" }}>
          <img
            src={log.photoUrl}
            alt="Exploration photo"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(14,13,20,0.8) 100%)" }}
          />
        </div>
      )}

      <div className="px-3.5 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" style={{ color: "rgba(255,255,255,0.2)" }} />
            <span className="font-sans" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: FONT }}>
              {date}
            </span>
            {log.photoUrl && (
              <Camera className="w-3 h-3" style={{ color: "rgba(168,85,247,0.5)" }} />
            )}
          </div>

          <AnimatePresence>
            {showDelete && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onDelete}
                className="w-6 h-6 flex items-center justify-center rounded-lg"
                style={{
                  background: "rgba(244,63,94,0.1)",
                  border:     "1px solid rgba(244,63,94,0.2)",
                  color:      "#f43f5e",
                  cursor:     "pointer",
                }}
              >
                <Trash2 className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {log.notes && (
          <p
            className="font-sans leading-relaxed"
            style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.5)", fontFamily: FONT, lineHeight: "1.7" }}
          >
            {log.notes}
          </p>
        )}
      </div>
    </motion.div>
  );
}
