import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

const MODELS = [
  { id: "auto", label: "Auto", description: "Best model for your prompt" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
];

export default function ModelSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = MODELS.find((m) => m.id === value) || MODELS[0];

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ opacity: 0.9 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary-400" />
        <span>{current.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 z-20 mb-2 w-48 rounded-xl border border-white/10 bg-[#18181c]/95 py-1 shadow-xl backdrop-blur-xl"
            >
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
                    value === m.id ? "text-primary-400" : "text-zinc-300"
                  }`}
                >
                  <span className="font-medium">{m.label}</span>
                  {m.description && (
                    <span className="text-xs text-zinc-500">{m.description}</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
