import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

export default function SearchBar({ onSearch, placeholder = "Search tools, models, pipelines...", compact = false }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const handleClear = () => {
    setValue("");
    onSearch?.("");
  };

  return (
    <motion.div
      className={`
        flex items-center gap-2 rounded-xl border transition-colors
        ${compact ? "px-3 py-2" : "px-4 py-2.5"}
        ${focused ? "border-primary-500/50 bg-white/5" : "border-white/10 bg-white/[0.04]"}
      `}
      initial={false}
      animate={{ scale: focused ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Search className="w-4 h-4 text-zinc-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch?.(e.target.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`
          bg-transparent border-none outline-none text-zinc-200 placeholder:text-zinc-500
          ${compact ? "text-sm w-32" : "text-sm w-48 sm:w-64"}
        `}
      />
      <AnimatePresence>
        {value && (
          <motion.button
            type="button"
            onClick={handleClear}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="p-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
