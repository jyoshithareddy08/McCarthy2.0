import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Loader2 } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import ChatMessage from "../components/playground/ChatMessage";
import ChatInput from "../components/playground/ChatInput";
import ChatSidebar from "../components/playground/ChatSidebar";

export default function Playground() {
  const [messages, setMessages] = useState([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("auto");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    const userMsg = { id: Date.now().toString(), role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    if (!hasStartedChat) setHasStartedChat(true);
    setIsTyping(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "This is a simulated reply. In production, this would stream the model response.",
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <AnimatedBackground />

      {/* Sidebar overlay - does not push content */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={() => {
          setMessages([]);
          setHasStartedChat(false);
          setSidebarOpen(false);
        }}
      />

      {/* Main area: offset from left on desktop for sidebar rail */}
      <div className="relative flex flex-1 flex-col md:ml-14">
        {/* Mobile only: sidebar toggle (no PLAYGROUND header) */}
        <div className="sticky top-0 z-30 flex h-12 items-center px-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white"
            aria-label="Open chat sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Content: centered when empty; when chat started, messages scroll + input at fixed height from bottom */}
        <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6 min-h-0">
          <motion.div
            layout
            className={`flex flex-1 flex-col min-h-0 ${hasStartedChat ? "" : "justify-center items-center"}`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <AnimatePresence mode="wait">
              {hasStartedChat ? (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-1 flex-col min-h-0 overflow-hidden"
                >
                  <div className="flex-1 min-h-0 max-h-[65vh] overflow-y-auto space-y-6 pb-4 pt-10 sm:pt-12 w-full">
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="flex gap-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/20 backdrop-blur-sm">
                            <Loader2 className="h-5 w-5 animate-spin text-primary-400" />
                          </div>
                          <div
                            className="max-w-[92%] min-w-[200px] rounded-2xl px-5 py-4 shadow-lg backdrop-blur-md"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              boxShadow: "0 4px 24px -4px rgba(0,0,0,0.2)",
                            }}
                          >
                            <span className="text-base text-zinc-500">Thinking...</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={bottomRef} />
                  </div>
                  {/* Input bar: comfortable spacing from bottom of viewport */}
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="shrink-0 pt-4 pb-8 w-full"
                  >
                    <ChatInput
                      value={input}
                      onChange={setInput}
                      onSubmit={handleSend}
                      model={model}
                      onModelChange={setModel}
                      disabled={isTyping}
                      placeholder="Ask anything..."
                    />
                  </motion.div>
                </motion.div>
              ) : (
                /* Empty state: motivating text + centered input */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex w-full flex-col items-center justify-center gap-8 py-8"
                >
                  <div className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-white md:text-2xl">
                      READY WHEN YOU ARE..
                    </h2>
                  </div>
                  <div className="w-full max-w-3xl">
                    <ChatInput
                      value={input}
                      onChange={setInput}
                      onSubmit={handleSend}
                      model={model}
                      onModelChange={setModel}
                      disabled={isTyping}
                      placeholder="Ask anything..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
