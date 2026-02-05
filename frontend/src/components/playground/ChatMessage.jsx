import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

const messageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const transition = { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] };

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      layout
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/20 backdrop-blur-sm">
          <Bot className="h-5 w-5 text-primary-400" />
        </div>
      )}
      <div
        className={`max-w-[92%] min-w-[200px] rounded-2xl px-5 py-4 shadow-lg
          ${isUser
            ? "bg-primary-600/90 text-white shadow-primary-500/20 backdrop-blur-md"
            : "bg-white/[0.06] text-zinc-200 shadow-black/20 backdrop-blur-md"
          }`}
        style={{
          boxShadow: isUser
            ? "0 4px 24px -4px rgba(147, 51, 234, 0.25)"
            : "0 4px 24px -4px rgba(0,0,0,0.2)",
        }}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
          <User className="h-5 w-5 text-zinc-400" />
        </div>
      )}
    </motion.div>
  );
}
