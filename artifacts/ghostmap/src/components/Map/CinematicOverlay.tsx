import { motion } from "framer-motion";

export function CinematicOverlay() {
  return (
    <>
      {/* Top vignette */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 z-[10] h-32"
        style={{
          background: "linear-gradient(to bottom, rgba(12,11,17,0.65) 0%, transparent 100%)",
        }}
      />

      {/* Bottom vignette */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-[10] h-32"
        style={{
          background: "linear-gradient(to top, rgba(12,11,17,0.55) 0%, transparent 100%)",
        }}
      />

      {/* Left edge vignette */}
      <div
        className="pointer-events-none fixed top-0 left-0 bottom-0 z-[10] w-20"
        style={{
          background: "linear-gradient(to right, rgba(12,11,17,0.4) 0%, transparent 100%)",
        }}
      />

      {/* Right edge vignette */}
      <div
        className="pointer-events-none fixed top-0 right-0 bottom-0 z-[10] w-20"
        style={{
          background: "linear-gradient(to left, rgba(12,11,17,0.4) 0%, transparent 100%)",
        }}
      />

      {/* Subtle ambient pulse — very faint purple */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[9]"
        animate={{ opacity: [0, 0.04, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(168,85,247,1) 0%, transparent 70%)",
        }}
      />

      {/* Scanline texture */}
      <div
        className="pointer-events-none fixed inset-0 z-[8]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
          opacity: 0.5,
        }}
      />
    </>
  );
}
