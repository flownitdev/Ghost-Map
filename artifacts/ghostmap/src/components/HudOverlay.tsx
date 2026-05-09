import { Radar } from "lucide-react";

export function HudOverlay() {
  return (
    <div 
      className="fixed top-6 left-6 z-[1000] p-4 rounded-xl border border-white/10 bg-[#111012]/75 backdrop-blur-[20px] shadow-2xl flex items-center gap-4 pointer-events-none"
      data-testid="hud-overlay"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 text-accent">
        <Radar className="w-5 h-5 animate-[spin_4s_linear_infinite]" />
      </div>
      <div>
        <h1 className="font-title text-xl font-bold tracking-wider text-white m-0 leading-none">GHOSTMAP</h1>
        <p className="font-sans text-xs text-muted-foreground mt-1 uppercase tracking-widest">Urban Exploration Intelligence</p>
      </div>
    </div>
  );
}
