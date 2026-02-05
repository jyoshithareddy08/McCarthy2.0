import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Loader2 } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import ChatMessage from "../components/playground/ChatMessage";
import ChatInput from "../components/playground/ChatInput";
import ChatSidebar from "../components/playground/ChatSidebar";
import ModelControlPanel from "../components/playground/ModelControlPanel";
import { api } from "../lib/api.js";

export default function Playground() {
  const [messages, setMessages] = useState([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("automatic");
  const [model, setModel] = useState("auto");
  const [sessionId, setSessionId] = useState(null);
  const [modelUsed, setModelUsed] = useState(null);
  const [tools, setTools] = useState([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api
      .get("/api/playground/tools")
      .then(setTools)
      .catch(() => setTools([]))
      .finally(() => setToolsLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    if (mode === "manual" && (!model || model === "auto")) return;

    const userMsg = { id: Date.now().toString(), role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    if (!hasStartedChat) setHasStartedChat(true);
    setIsTyping(true);

    try {
      let sid = sessionId;
      if (!sid) {
        const session = await api.post("/api/playground/session", {});
        sid = session._id;
        setSessionId(sid);
      }

      const body = {
        sessionId: sid,
        prompt: trimmed,
        mode,
      };
      if (mode === "manual") body.toolId = model;

      const result = await api.post("/api/playground/chat", body);
      setModelUsed(result.modelUsed);
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response || "[No response]",
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${err.message}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden flex-col">
      <AnimatedBackground />

      {/* Sidebar overlay - does not push content */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={() => {
          setMessages([]);
          setHasStartedChat(false);
          setSessionId(null);
          setModelUsed(null);
          setSidebarOpen(false);
        }}
      />

      {/* Main area: flex row - content + right panel */}
      <div className="relative flex flex-1 min-h-0 md:ml-14">
        {/* Mobile only: sidebar toggle */}
        <div className="absolute top-0 left-0 right-0 z-30 flex h-12 items-center px-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white"
            aria-label="Open chat sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Content: chat area (flex-1) + right panel (model controls) */}
        <div className="relative flex flex-1 min-h-0 min-w-0">
          {/* Chat content area */}
          <div className="relative flex flex-1 flex-col min-h-0 min-w-0 px-4 py-4 sm:px-6">
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
                  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-6 pb-4 pt-10 sm:pt-12 w-full max-w-3xl mx-auto scrollbar-hide">
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
                    className="shrink-0 pt-4 pb-8 w-full max-w-3xl mx-auto"
                  >
                    <ChatInput
                      value={input}
                      onChange={setInput}
                      onSubmit={handleSend}
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
                  className="flex w-full flex-1 flex-col items-center justify-center gap-8 py-8 ml-[10.5rem] lg:ml-[15rem] -mt-48"
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
                      disabled={isTyping}
                      placeholder="Ask anything..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>

          {/* Right panel: model selection (visible on lg+ screens) */}
          <aside className={`hidden lg:flex lg:flex-col lg:w-72 xl:w-80 shrink-0 border-l border-white/10 bg-white/[0.02] pl-6 pr-8 py-8 overflow-y-auto ${!hasStartedChat ? "lg:justify-center" : ""}`}>
            <ModelControlPanel
              mode={mode}
              onModeChange={setMode}
              model={model}
              onModelChange={setModel}
              tools={tools}
              modelUsed={modelUsed}
              loading={isTyping}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
