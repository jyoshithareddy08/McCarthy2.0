import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MessageSquare, FolderOpen, ChevronRight, ChevronDown, Menu, X } from "lucide-react";

const overlayVariants = {
  hidden: { opacity: 0, pointerEvents: "none" },
  visible: { opacity: 1, pointerEvents: "auto" },
  exit: { opacity: 0, pointerEvents: "none" },
};

const recentChats = [
  { id: "1", title: "Summarize doc" },
  { id: "2", title: "Code review" },
  { id: "3", title: "Marketing copy" },
];

const savedChats = [
  { id: "s1", title: "API design" },
  { id: "s2", title: "Blog outline" },
];

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const m = window.matchMedia(query);
    setMatches(m.matches);
    const handler = (e) => setMatches(e.matches);
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export default function ChatSidebar({ isOpen, onClose, onNewChat }) {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState("");
  const [savedOpen, setSavedOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const showContent = isMobile ? isOpen : expanded;
  const showInnerContent = (isMobile && isOpen) || (!isMobile && expanded);

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : -320) : 0,
          width: isMobile ? 280 : expanded ? 280 : 56,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed left-0 top-0 z-50 flex h-full flex-col border-r border-white/5 bg-[#0f0f12]/50 shadow-xl backdrop-blur-xl md:top-16"
        style={{ height: isMobile ? "100vh" : "calc(100vh - 4rem)" }}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-white/5 px-3 md:h-12">
          <button
            type="button"
            onClick={() => (isMobile ? onClose() : setExpanded((e) => !e))}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label={showContent ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {showInnerContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-1 flex-col overflow-hidden px-3 py-4"
            >
              <motion.button
                type="button"
                onClick={onNewChat}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-primary-500 transition-colors"
              >
                <Plus className="h-4 w-4" /> New Chat
              </motion.button>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH CHATS..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-primary-500/50 focus:outline-none"
                />
              </div>

              <div className="space-y-6 overflow-y-auto">
                <section>
                  <button
                    type="button"
                    onClick={() => setSavedOpen((o) => !o)}
                    className="mb-2 flex w-full items-center gap-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-400"
                  >
                    <FolderOpen className="h-3.5 w-3.5 shrink-0" /> Saved
                    <motion.span
                      animate={{ rotate: savedOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                      className="ml-auto"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {savedOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-0.5 overflow-hidden"
                      >
                        {savedChats.map((chat) => (
                          <li key={chat.id}>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              {chat.title}
                              <ChevronRight className="h-4 w-4 text-zinc-500" />
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </section>
                <section>
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <MessageSquare className="h-3.5 w-3.5" /> Recent
                  </h3>
                  <ul className="space-y-0.5">
                    {recentChats.map((chat) => (
                      <li key={chat.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          {chat.title}
                          <ChevronRight className="h-4 w-4 text-zinc-500" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
