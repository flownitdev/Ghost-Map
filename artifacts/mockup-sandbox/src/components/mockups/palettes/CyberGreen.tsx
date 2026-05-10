export function CyberGreen() {
  const accent = "#00D084";
  const accentDim = "rgba(0,208,132,0.18)";
  const accentBorder = "rgba(0,208,132,0.35)";
  const accentGlow = "rgba(0,208,132,0.2)";
  const bg = "#09090b";
  const surface = "rgba(10,12,10,0.92)";
  const primary = "#1a3d2e";

  const categories = ["All", "Factory", "Hospital", "Mall", "School", "Tunnel"];
  const categoryColors = [accent, "#4ade80", "#34d399", "#6ee7b7", "#a7f3d0", "#6ee7b7"];

  return (
    <div className="relative w-full min-h-screen overflow-hidden" style={{ background: bg, fontFamily: "'Inter', sans-serif" }}>
      {/* Simulated dark map background */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse at 60% 40%, rgba(0,208,132,0.04) 0%, transparent 60%), 
                     linear-gradient(180deg, #09090b 0%, #0b0f0d 50%, #090c0a 100%)`,
      }}>
        {/* Grid lines simulating map tiles */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-cg" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00D084" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-cg)" />
        </svg>
        {/* Map roads simulation */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="280" x2="900" y2="260" stroke="#00D084" strokeWidth="3"/>
          <line x1="100" y1="0" x2="150" y2="620" stroke="#00D084" strokeWidth="2"/>
          <line x1="0" y1="420" x2="900" y2="410" stroke="#00D084" strokeWidth="1.5"/>
          <line x1="400" y1="0" x2="380" y2="620" stroke="#00D084" strokeWidth="2.5"/>
          <line x1="600" y1="0" x2="620" y2="620" stroke="#00D084" strokeWidth="1.5"/>
          <line x1="0" y1="170" x2="900" y2="180" stroke="#00D084" strokeWidth="1"/>
          <line x1="250" y1="0" x2="270" y2="620" stroke="#00D084" strokeWidth="1"/>
          <line x1="750" y1="0" x2="740" y2="620" stroke="#00D084" strokeWidth="1"/>
        </svg>
      </div>

      {/* Map markers */}
      {[
        { x: "22%", y: "38%", risk: "high", label: "ZONE-7" },
        { x: "55%", y: "52%", risk: "med", label: "SITE-3" },
        { x: "70%", y: "30%", risk: "low", label: "DELTA-1" },
        { x: "38%", y: "65%", risk: "med", label: "NEST-B" },
        { x: "82%", y: "60%", risk: "high", label: "ECHO-9" },
      ].map((m) => (
        <div key={m.label} className="absolute flex flex-col items-center gap-1" style={{ left: m.x, top: m.y, transform: "translate(-50%,-50%)", zIndex: 10 }}>
          <div className="relative">
            <div className="w-3 h-3 rounded-full border-2" style={{
              background: m.risk === "high" ? "rgba(0,208,132,0.25)" : m.risk === "med" ? "rgba(0,208,132,0.12)" : "rgba(0,208,132,0.06)",
              borderColor: m.risk === "high" ? accent : m.risk === "med" ? "rgba(0,208,132,0.5)" : "rgba(0,208,132,0.25)",
              boxShadow: m.risk === "high" ? `0 0 12px ${accentGlow}` : "none",
            }} />
            {m.risk === "high" && (
              <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: accentDim }} />
            )}
          </div>
          <span style={{ fontSize: "7px", letterSpacing: "0.1em", color: m.risk === "high" ? accent : "rgba(0,208,132,0.4)", fontFamily: "monospace" }}>{m.label}</span>
        </div>
      ))}

      {/* User menu */}
      <div className="absolute top-5 left-5 z-50">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{
          background: surface,
          backdropFilter: "blur(28px)",
          border: `1px solid ${accentBorder}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold" style={{
            background: accentDim,
            border: `1px solid ${accentBorder}`,
            color: accent,
            fontSize: "11px",
          }}>G</div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>explorer@ghost.map</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2" style={{ width: "min(580px, calc(100% - 48px))" }}>
        <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl" style={{
          background: surface,
          backdropFilter: "blur(28px) saturate(1.6)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "rgba(255,255,255,0.25)" }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", flex: 1 }}>Search locations…</span>
          <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.07)" }} />
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>12<span style={{ color: "rgba(255,255,255,0.15)" }}>/24</span></span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {categories.map((cat, i) => (
            <button key={cat} style={{
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "10.5px",
              letterSpacing: "0.05em",
              background: i === 0 ? accentDim : "rgba(9,9,11,0.82)",
              border: `1px solid ${i === 0 ? accentBorder : "rgba(255,255,255,0.07)"}`,
              color: i === 0 ? accent : "rgba(255,255,255,0.35)",
              backdropFilter: "blur(20px)",
              boxShadow: i === 0 ? `0 0 12px ${accentGlow}` : "none",
              cursor: "default",
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-24 left-5 z-50 flex flex-col overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        {["+", "−"].map((s, i) => (
          <div key={s} className="flex items-center justify-center" style={{
            width: 36, height: 36,
            background: "rgba(9,9,11,0.85)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 18,
            borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
            cursor: "default",
          }}>{s}</div>
        ))}
      </div>

      {/* Location sidebar */}
      <div className="absolute top-0 right-0 bottom-0 w-72 z-40 flex flex-col" style={{
        background: "linear-gradient(160deg, rgba(11,14,11,0.97) 0%, rgba(9,11,9,0.98) 100%)",
        borderLeft: `1px solid rgba(0,208,132,0.1)`,
        backdropFilter: "blur(28px)",
      }}>
        <div className="p-4 border-b" style={{ borderColor: "rgba(0,208,132,0.08)" }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{
              background: accentDim,
              border: `1px solid ${accentBorder}`,
            }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: accent }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'Space Grotesk', sans-serif" }}>ZONE-7 Factory Complex</h3>
              <p style={{ fontSize: "11px", color: accent, marginTop: 2 }}>HIGH RISK · Industrial</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {["Explore", "Save"].map((label, i) => (
              <button key={label} style={{
                flex: i === 0 ? 1 : undefined,
                padding: "6px 14px",
                borderRadius: 10,
                fontSize: "11px",
                background: i === 0 ? accentDim : "rgba(255,255,255,0.04)",
                border: `1px solid ${i === 0 ? accentBorder : "rgba(255,255,255,0.07)"}`,
                color: i === 0 ? accent : "rgba(255,255,255,0.5)",
                cursor: "default",
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2">
          {[
            { name: "Abandoned Smelter", risk: "high", cat: "Industrial" },
            { name: "West Gate Tunnel", risk: "med", cat: "Tunnel" },
            { name: "Riverside Mall", risk: "low", cat: "Mall" },
            { name: "Medical Block C", risk: "med", cat: "Hospital" },
            { name: "Old Elementary", risk: "low", cat: "School" },
          ].map((loc) => (
            <div key={loc.name} className="flex items-center gap-3 p-2.5 rounded-xl cursor-default" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                background: loc.risk === "high" ? accent : loc.risk === "med" ? "rgba(0,208,132,0.4)" : "rgba(0,208,132,0.2)",
              }} />
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500, truncate: "true" }}>{loc.name}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{loc.cat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Palette swatch legend */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-full" style={{
        background: surface,
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}>
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>CYBER GREEN</span>
        {[bg, primary, accent].map((c) => (
          <div key={c} className="w-4 h-4 rounded-full border" style={{ background: c, borderColor: "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
    </div>
  );
}
