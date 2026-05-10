import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScanState } from "@/hooks/useSatScanner";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

interface SatScannerOverlayProps {
  scanState: ScanState;
}

export function SatScannerOverlay({ scanState }: SatScannerOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const angleRef = useRef(0);

  useEffect(() => {
    if (scanState !== "scanning") {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.42;

      ctx.clearRect(0, 0, W, H);

      // Dark overlay
      ctx.fillStyle = "rgba(6, 5, 12, 0.45)";
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "rgba(74,222,128,0.06)";
      ctx.lineWidth = 0.5;
      const gridStep = 60;
      for (let x = 0; x < W; x += gridStep) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Radar rings
      const rings = [R * 0.25, R * 0.5, R * 0.75, R];
      rings.forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(74,222,128,${0.12 - i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Crosshairs
      ctx.strokeStyle = "rgba(74,222,128,0.15)";
      ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(cx, cy - R - 20); ctx.lineTo(cx, cy + R + 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - R - 20, cy); ctx.lineTo(cx + R + 20, cy); ctx.stroke();

      // Radar sweep (filled sector)
      const sweepAngle = (80 * Math.PI) / 180;
      const startAngle = angleRef.current;
      const endAngle = startAngle + sweepAngle;

      const grad = ctx.createConicalGradient
        ? undefined
        : null;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startAngle, endAngle, false);
      ctx.closePath();

      const sweepGrad = ctx.createLinearGradient(cx, cy - R, cx, cy + R);
      sweepGrad.addColorStop(0, "rgba(74,222,128,0)");
      sweepGrad.addColorStop(0.5, "rgba(74,222,128,0.12)");
      sweepGrad.addColorStop(1, "rgba(74,222,128,0)");
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Sweep leading edge line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const ex = cx + R * Math.cos(endAngle);
      const ey = cy + R * Math.sin(endAngle);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = "rgba(74,222,128,0.7)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#4ade80";
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.restore();

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#4ade80";
      ctx.shadowColor = "#4ade80";
      ctx.shadowBlur = 10;
      ctx.fill();

      // Corner brackets
      const bx = cx - R * 0.72;
      const by = cy - R * 0.72;
      const bSize = 16;
      const bGap = 6;
      const corners = [
        [bx, by],
        [cx + R * 0.72, by],
        [bx, cy + R * 0.72],
        [cx + R * 0.72, cy + R * 0.72],
      ] as [number, number][];

      ctx.strokeStyle = "rgba(74,222,128,0.55)";
      ctx.lineWidth = 1.5;
      corners.forEach(([bx2, by2], i) => {
        const sx = i % 2 === 0 ? 1 : -1;
        const sy = i < 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(bx2 + sx * bGap, by2);
        ctx.lineTo(bx2 + sx * (bGap + bSize), by2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx2, by2 + sy * bGap);
        ctx.lineTo(bx2, by2 + sy * (bGap + bSize));
        ctx.stroke();
      });

      angleRef.current += 0.02;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [scanState]);

  return (
    <AnimatePresence>
      {scanState === "scanning" && (
        <motion.div
          key="radar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[900] pointer-events-none"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: "block" }}
          />

          {/* HUD label top-center */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                background: "rgba(6,5,12,0.75)",
                border: "1px solid rgba(74,222,128,0.22)",
                backdropFilter: "blur(16px)",
                fontFamily: FONT,
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
              />
              <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 600, letterSpacing: "0.08em" }}>
                SATELLITE SCAN IN PROGRESS
              </span>
            </div>
            <p style={{ fontSize: "10px", color: "rgba(74,222,128,0.45)", fontFamily: FONT, letterSpacing: "0.04em" }}>
              Analyzing imagery for abandonment signals
            </p>
          </motion.div>

          {/* Bottom scan data strip */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-5 py-2.5 rounded-xl"
            style={{
              background: "rgba(6,5,12,0.75)",
              border: "1px solid rgba(74,222,128,0.15)",
              backdropFilter: "blur(16px)",
              fontFamily: FONT,
            }}
          >
            {[
              { label: "SIGNAL", value: "GEMINI VISION" },
              { label: "MODE", value: "SAT-RGB" },
              { label: "RESOLUTION", value: "0.5m/px" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p style={{ fontSize: "9px", color: "rgba(74,222,128,0.4)", letterSpacing: "0.07em" }}>{label}</p>
                <p style={{ fontSize: "11px", color: "rgba(74,222,128,0.8)", fontWeight: 600, letterSpacing: "0.03em" }}>{value}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
