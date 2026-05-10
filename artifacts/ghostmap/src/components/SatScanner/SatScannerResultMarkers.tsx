import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { ScanTileResult } from "@/hooks/useSatScanner";

function confidenceColor(score: number, tier?: string): string {
  if (tier === "high_decay" || score >= 70) return "#f43f5e";
  if (tier === "suspicious" || score >= 50) return "#f59e0b";
  if (tier === "potentially_neglected" || score >= 32) return "#A855F7";
  return "#4ade80";
}

function tierLabel(score: number, tier?: string): string {
  if (tier === "high_decay" || score >= 70) return "HIGH DECAY";
  if (tier === "suspicious" || score >= 50) return "SUSPICIOUS";
  if (tier === "potentially_neglected" || score >= 32) return "POTENTIALLY ABANDONED";
  return "REQUIRES VERIFICATION";
}

function makeDotIcon(color: string, size: number): L.DivIcon {
  return L.divIcon({
    className: "",
    iconAnchor: [size / 2, size / 2],
    iconSize: [size, size],
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: ${size * 2.2}px;
          height: ${size * 2.2}px;
          border-radius: 50%;
          background: ${color}18;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: sat-pulse 2s ease-in-out infinite;
        "></div>
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${color};
          box-shadow: 0 0 ${size * 1.2}px ${color}, 0 0 ${size * 0.6}px ${color}cc;
          border: 2px solid ${color}dd;
          position: relative;
          z-index: 1;
        "></div>
      </div>
    `,
  });
}

const PULSE_STYLE = `
  @keyframes sat-pulse {
    0%, 100% { opacity: 0.25; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.35); }
  }
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected) return;
  styleInjected = true;
  const el = document.createElement("style");
  el.textContent = PULSE_STYLE;
  document.head.appendChild(el);
}

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

interface SatScannerResultMarkersProps {
  results: ScanTileResult[];
}

export function SatScannerResultMarkers({ results }: SatScannerResultMarkersProps) {
  injectStyle();

  const flagged = results
    .filter((r) => r.confidenceScore >= 20)
    .sort((a, b) => b.confidenceScore - a.confidenceScore);

  return (
    <>
      {flagged.map((result, i) => {
        const color = confidenceColor(result.confidenceScore, result.suspicionTier);
        const label = tierLabel(result.confidenceScore, result.suspicionTier);
        const dotSize = result.confidenceScore >= 70 ? 14 : result.confidenceScore >= 50 ? 12 : 10;
        const icon = makeDotIcon(color, dotSize);

        return (
          <Marker
            key={i}
            position={[result.centerLat, result.centerLng]}
            icon={icon}
          >
            <Tooltip
              direction="top"
              offset={[0, -(dotSize / 2 + 6)]}
              opacity={1}
              className="sat-scanner-tooltip"
            >
              <div
                style={{
                  background: "rgba(8,7,14,0.95)",
                  border: `1px solid ${color}44`,
                  borderRadius: "10px",
                  padding: "8px 10px",
                  minWidth: "160px",
                  fontFamily: FONT,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 12px ${color}22`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 5px ${color}`,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: "9px", color, fontWeight: 700, letterSpacing: "0.07em" }}>
                    {label}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", marginBottom: "4px", lineHeight: 1.5 }}>
                  {result.reasoning || "Suspicious area flagged by satellite scan."}
                </div>
                {result.indicators.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "4px" }}>
                    {result.indicators.slice(0, 3).map((ind, j) => (
                      <span
                        key={j}
                        style={{
                          fontSize: "8.5px",
                          color: "rgba(255,255,255,0.35)",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "5px",
                          padding: "1px 5px",
                        }}
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>
                  Confidence {result.confidenceScore}% · Decay {result.decayLevel}%
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
