import { motion } from "framer-motion";

const blobVariants = {
  initial: { scale: 0.8, opacity: 0.35 },
  animate: {
    scale: [0.8, 1.25, 0.95, 1.15],
    opacity: [0.35, 0.6, 0.45, 0.55],
    transition: { duration: 14, repeat: Infinity, ease: "easeInOut" },
  },
};

const floatVariants = {
  animate: {
    y: [0, -20, 0],
    x: [0, 12, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs - more visible */}
      <motion.div
        className="absolute -top-1/2 -left-1/4 w-[80vw] h-[80vw] rounded-full bg-primary-600/25 blur-[100px]"
        variants={blobVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="absolute top-1/3 -right-1/4 w-[65vw] h-[65vw] rounded-full bg-purple-500/20 blur-[90px]"
        variants={blobVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 2, duration: 16 }}
      />
      <motion.div
        className="absolute -bottom-1/4 left-1/3 w-[55vw] h-[55vw] rounded-full bg-primary-700/15 blur-[80px]"
        variants={blobVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 4, duration: 12 }}
      />
      {/* Extra floating orb for depth */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[40vw] h-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/10 blur-[60px]"
        variants={floatVariants}
        animate="animate"
      />
      {/* Subtle moving gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(147, 51, 234, 0.08) 0%, transparent 50%)",
        }}
        animate={{ opacity: [0.2, 0.35, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
