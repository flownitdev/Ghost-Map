import { motion } from "framer-motion";

export function CinematicOverlay() {
  return (
    <>
      {/* Top vignette — heavier to frame UI */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 z-[10] h-48"
        style={{
          background: "linear-gradient(to bottom, rgba(10,9,14,0.72) 0%, rgba(10,9,14,0.2) 60%, transparent 100%)",
        }}
      />

      {/* Bottom vignette */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-[10] h-40"
        style={{
          background: "linear-gradient(to top, rgba(10,9,14,0.65) 0%, rgba(10,9,14,0.15) 60%, transparent 100%)",
        }}
      />

      {/* Left edge */}
      <div
        className="pointer-events-none fixed top-0 left-0 bottom-0 z-[10] w-28"
        style={{
          background: "linear-gradient(to right, rgba(10,9,14,0.35) 0%, transparent 100%)",
        }}
      />

      {/* Right edge */}
      <div
        className="pointer-events-none fixed top-0 right-0 bottom-0 z-[10] w-28"
        style={{
          background: "linear-gradient(to left, rgba(10,9,14,0.35) 0%, transparent 100%)",
        }}
      />

      {/* Very subtle warm atmospheric haze — barely visible */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[9]"
        animate={{ opacity: [0, 0.025, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
        style={{
          background: "radial-gradient(ellipse 55% 38% at 50% 50%, rgba(250,72,23,1) 0%, transparent 70%)",
        }}
      />
    </>
  );
}
