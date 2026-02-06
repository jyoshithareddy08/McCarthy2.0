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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [refreshSessions, setRefreshSessions] = useState(0);
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
      const isNewSession = !sid;
      if (!sid) {
        console.log("[Playground] Creating new session...");
        try {
          const session = await api.post("/api/playground/session", {});
          sid = session._id;
          setSessionId(sid);
          console.log("[Playground] Session created:", sid);
          // Trigger session list refresh
          setRefreshSessions((prev) => prev + 1);
        } catch (sessionErr) {
          console.error("[Playground] Error creating session:", sessionErr);
          // Show detailed error for session creation failure
          const sessionErrorDetails = [];
          sessionErrorDetails.push(`❌ Failed to create chat session`);
          sessionErrorDetails.push("");
          sessionErrorDetails.push(`Error: ${sessionErr.message}`);
          
          if (sessionErr.status) {
            sessionErrorDetails.push(`Status Code: ${sessionErr.status}`);
          }
          
          if (sessionErr.backendError || sessionErr.backendMessage) {
            sessionErrorDetails.push("");
            sessionErrorDetails.push("🔍 Backend Response:");
            if (sessionErr.backendError) {
              sessionErrorDetails.push(`   Error: ${sessionErr.backendError}`);
            }
            if (sessionErr.backendMessage) {
              sessionErrorDetails.push(`   Message: ${sessionErr.backendMessage}`);
            }
          }
          
          if (sessionErr.backendDetails && typeof sessionErr.backendDetails === 'object') {
            sessionErrorDetails.push("");
            sessionErrorDetails.push("📋 Details:");
            Object.entries(sessionErr.backendDetails).forEach(([key, value]) => {
              sessionErrorDetails.push(`   ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
            });
          }
          
          // Check authentication
          if (sessionErr.status === 401 || sessionErr.message?.includes("User context") || sessionErr.message?.includes("X-User-Id")) {
            const user = localStorage.getItem("mccarthy_user");
            let userId = null;
            try {
              if (user) {
                const parsed = JSON.parse(user);
                userId = parsed?.id || parsed?._id;
              }
            } catch (e) {}
            
            sessionErrorDetails.push("");
            sessionErrorDetails.push("🔐 Authentication Status:");
            const tokens = localStorage.getItem("mccarthy_tokens");
            let hasToken = false;
            try {
              if (tokens) {
                const parsed = JSON.parse(tokens);
                hasToken = !!parsed?.accessToken;
              }
            } catch (e) {}
            sessionErrorDetails.push(`   - JWT Token: ${hasToken ? "✅ Found" : "❌ NOT FOUND"}`);
            sessionErrorDetails.push("");
            sessionErrorDetails.push("💡 Solution: Please log in to use the playground");
          }
          
          setMessages((m) => [
            ...m,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: sessionErrorDetails.join("\n"),
            },
          ]);
          setIsTyping(false);
          return; // Stop here, don't try to send message
        }
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
      
      // Refresh sessions list after first message to update title
      if (isNewSession) {
        setTimeout(() => setRefreshSessions((prev) => prev + 1), 500);
      }
    } catch (err) {
      console.error("[Playground] Error in handleSend:", err);
      const errorDetails = [];
      
      // Main error message
      errorDetails.push(`❌ Error: ${err.message}`);
      errorDetails.push("");
      
      // Status code
      if (err.status) {
        errorDetails.push(`📊 Status Code: ${err.status}`);
      }
      
      // Backend error details
      if (err.backendError || err.backendMessage) {
        errorDetails.push("");
        errorDetails.push("🔍 Backend Response:");
        if (err.backendError) {
          errorDetails.push(`   Error: ${err.backendError}`);
        }
        if (err.backendMessage) {
          errorDetails.push(`   Message: ${err.backendMessage}`);
        }
      }
      
      // Detailed backend information
      if (err.backendDetails && typeof err.backendDetails === 'object') {
        errorDetails.push("");
        errorDetails.push("📋 Detailed Information:");
        Object.entries(err.backendDetails).forEach(([key, value]) => {
          if (typeof value === 'object') {
            errorDetails.push(`   ${key}:`);
            Object.entries(value).forEach(([subKey, subValue]) => {
              errorDetails.push(`     - ${subKey}: ${subValue}`);
            });
          } else {
            errorDetails.push(`   ${key}: ${value}`);
          }
        });
      }
      
      // Endpoint information
      if (err.details?.path) {
        errorDetails.push("");
        errorDetails.push(`🌐 Endpoint: ${err.details.path}`);
      }
      
      // Check if user ID is missing
      if (err.message?.includes("User context") || err.message?.includes("X-User-Id") || err.status === 401) {
        const user = localStorage.getItem("mccarthy_user");
        let userId = null;
        try {
          if (user) {
            const parsed = JSON.parse(user);
            userId = parsed?.id || parsed?._id;
          }
        } catch (e) {
          console.error("Error parsing user:", e);
        }
        
        errorDetails.push("");
        errorDetails.push("🔐 Authentication Debug:");
        const tokens = localStorage.getItem("mccarthy_tokens");
        let hasToken = false;
        try {
          if (tokens) {
            const parsed = JSON.parse(tokens);
            hasToken = !!parsed?.accessToken;
          }
        } catch (e) {}
        errorDetails.push(`   - JWT Token: ${hasToken ? "✅ Found" : "❌ NOT FOUND"}`);
        if (hasToken) {
          errorDetails.push(`   - Token may be expired or invalid`);
        }
        errorDetails.push("");
        errorDetails.push("💡 Solution:");
        errorDetails.push("   Please log in to use the playground");
      }
      
      // Check for validation errors
      if (err.status === 400 && err.backendDetails) {
        errorDetails.push("");
        errorDetails.push("⚠️ Validation Error:");
        if (err.backendDetails.hasSessionId === false) {
          errorDetails.push("   - Session ID is missing");
        }
        if (err.backendDetails.hasPrompt === false) {
          errorDetails.push("   - Prompt is missing");
        }
        if (err.backendDetails.providedSessionId) {
          errorDetails.push(`   - Invalid Session ID format: ${err.backendDetails.providedSessionId}`);
        }
        if (err.backendDetails.providedToolId) {
          errorDetails.push(`   - Invalid Tool ID format: ${err.backendDetails.providedToolId}`);
        }
      }
      
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: errorDetails.join("\n"),
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
        currentSessionId={sessionId}
        refreshTrigger={refreshSessions}
        onNewChat={() => {
          setMessages([]);
          setHasStartedChat(false);
          setSessionId(null);
          setModelUsed(null);
          setSidebarOpen(false);
        }}
        onSelectSession={async (selectedSessionId) => {
          try {
            // Ensure sessionId is a string
            const sessionIdStr = String(selectedSessionId);
            console.log("Loading session:", sessionIdStr);
            // Clear previous messages and set loading state
            setMessages([]);
            setSessionId(sessionIdStr);
            setHasStartedChat(true);
            setIsTyping(true);
            
            const history = await api.get(`/api/playground/history/${sessionIdStr}`);
            console.log("History received:", history);
            
            if (!Array.isArray(history)) {
              console.error("History is not an array:", history);
              setMessages([]);
              setIsTyping(false);
              return;
            }
            
            if (history.length === 0) {
              console.log("No messages found for this session");
              setMessages([]);
              setIsTyping(false);
              return;
            }
            
            const formattedMessages = [];
            history.forEach((msg, index) => {
              if (msg.prompt) {
                formattedMessages.push({
                  id: `user-${msg._id || index}`,
                  role: "user",
                  content: msg.prompt,
                });
              }
              if (msg.response) {
                formattedMessages.push({
                  id: `assistant-${msg._id || index}`,
                  role: "assistant",
                  content: msg.response,
                });
              }
            });
            
            console.log("Formatted messages:", formattedMessages);
            setMessages(formattedMessages);
            setSidebarOpen(false);
            // Refresh sessions list to ensure titles are up to date
            setRefreshSessions((prev) => prev + 1);
          } catch (err) {
            console.error("[Playground] Error loading session:", err);
            const errorDetails = [];
            errorDetails.push(`Error loading chat history: ${err.message}`);
            
            if (err.status) {
              errorDetails.push(`Status Code: ${err.status}`);
            }
            
            if (err.details) {
              if (err.details.error) {
                errorDetails.push(`Backend Error: ${err.details.error}`);
              }
              if (err.details.message) {
                errorDetails.push(`Message: ${err.details.message}`);
              }
              if (err.details.path) {
                errorDetails.push(`Endpoint: ${err.details.path}`);
              }
            }
            
            // Check if authentication is missing
            if (err.message?.includes("Authentication") || err.message?.includes("User context") || err.status === 401) {
              const tokens = localStorage.getItem("mccarthy_tokens");
              let hasToken = false;
              try {
                if (tokens) {
                  const parsed = JSON.parse(tokens);
                  hasToken = !!parsed?.accessToken;
                }
              } catch (e) {}
              errorDetails.push(`\n🔐 Authentication Debug:`);
              errorDetails.push(`- JWT Token: ${hasToken ? "✅ Found" : "❌ NOT FOUND"}`);
              if (hasToken) {
                errorDetails.push(`- Token may be expired or invalid`);
              }
              errorDetails.push(`\n💡 Solution: Please log in to use the playground`);
            }
            
            setMessages([{
              id: "error",
              role: "assistant",
              content: errorDetails.join("\n"),
            }]);
            setHasStartedChat(true);
          } finally {
            setIsTyping(false);
          }
        }}
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
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
                  {/* Input bar: anchored to bottom of page */}
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
                /* Empty state: text + input centered in viewport (compensate for sidebar offset on desktop) */
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
                  <div className="w-full max-w-3xl px-4">
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
