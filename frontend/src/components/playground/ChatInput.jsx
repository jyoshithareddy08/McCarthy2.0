import { useRef } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ModelSelector from "./ModelSelector";

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  model,
  onModelChange,
  disabled,
  placeholder = "Type your message...",
}) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <motion.div
        layout
        className="relative flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 shadow-lg backdrop-blur-xl focus-within:border-primary-500/40 focus-within:shadow-primary-500/10 transition-all duration-300"
      >
        <div className="absolute left-3 bottom-2.5 flex items-center gap-2">
          <ModelSelector value={model} onChange={onModelChange} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[44px] flex-1 bg-transparent pl-28 pr-12 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
        />
        <motion.button
          type="submit"
          disabled={!value.trim() || disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-2 bottom-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <Send className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </form>
  );
}
