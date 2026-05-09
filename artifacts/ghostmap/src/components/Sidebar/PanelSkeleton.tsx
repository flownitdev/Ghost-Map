import { motion } from "framer-motion";

function Bone({ className }: { className: string }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.6s ease-in-out infinite",
      }}
    />
  );
}

export function PanelSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col flex-1 overflow-hidden p-7"
    >
      {/* Label + title */}
      <div className="mb-5">
        <Bone className="h-2.5 w-24 mb-3" />
        <Bone className="h-7 w-4/5 mb-1.5" />
        <Bone className="h-5 w-3/5" />
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-7">
        <Bone className="h-7 w-24 rounded-lg" />
        <Bone className="h-7 w-28 rounded-lg" />
      </div>

      {/* Divider */}
      <Bone className="h-px w-full mb-7" />

      {/* Description lines */}
      <div className="flex-1 space-y-2.5">
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-11/12" />
        <Bone className="h-3.5 w-4/5" />
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-3/4" />
      </div>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
        <Bone className="h-3.5 w-40" />
        <Bone className="h-10 w-full rounded-lg" />
      </div>
    </motion.div>
  );
}
