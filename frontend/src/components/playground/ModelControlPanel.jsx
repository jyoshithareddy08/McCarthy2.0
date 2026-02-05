import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Zap } from "lucide-react";

export default function ModelControlPanel({
  mode,
  onModeChange,
  model,
  onModelChange,
  tools = [],
  modelUsed,
  loading,
}) {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isManual = mode === "manual";
  const toolsForManual = useMemo(
    () =>
      tools.map((t) => ({
        id: t._id,
        label: t.title,
        description: t.description || "",
        keywords: t.keywords || [],
      })),
    [tools]
  );

  const filteredTools = useMemo(() => {
    if (!search.trim()) return toolsForManual;
    const q = search.toLowerCase();
    return toolsForManual.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.keywords && t.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  }, [search, toolsForManual]);

  const current = toolsForManual.find((t) => t.id === model);
  const displayLabel =
    isManual && (!current || model === "auto")
      ? "Select model"
      : current?.label ?? "Select model";
  const displayDescription =
    isManual && (!current || model === "auto") ? null : current?.description;

  return (
    <div className="flex flex-col gap-4">
      {/* Automatic / Manual Toggle */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Model selection
        </span>
        <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => onModeChange("automatic")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === "automatic"
                ? "bg-primary-500/20 text-primary-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Automatic
          </button>
          <button
            type="button"
            onClick={() => onModeChange("manual")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              mode === "manual"
                ? "bg-primary-500/20 text-primary-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Zap className="h-4 w-4" />
            Manual
          </button>
        </div>
      </div>

      {/* Model dropdown + search (manual only) */}
      <div className="relative">
        <span className="mb-2 block text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Model
        </span>
        <div className="relative">
          <motion.button
            type="button"
            onClick={() => isManual && setDropdownOpen((o) => !o)}
            disabled={!isManual}
            className={`flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-sm transition-all ${
              isManual
                ? "hover:border-white/20 hover:bg-white/[0.06] cursor-pointer"
                : "opacity-60 cursor-not-allowed"
            } ${isManual && (!current || model === "auto") ? "text-zinc-500" : ""}`}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-primary-400" />
            <span className="flex-1 truncate">{displayLabel}</span>
            {displayDescription && (
              <span className="hidden truncate text-xs text-zinc-500 sm:inline">
                {displayDescription}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && isManual && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 z-20 mt-2 rounded-xl border border-white/10 bg-[#18181c]/98 py-2 shadow-xl backdrop-blur-xl"
                >
                  <div className="px-2 pb-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search models..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-primary-500/40 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredTools.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          onModelChange(t.id);
                          setDropdownOpen(false);
                          setSearch("");
                        }}
                        className={`flex w-full flex-col items-start px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${
                          model === t.id ? "text-primary-400" : "text-zinc-300"
                        }`}
                      >
                        <span className="font-medium">{t.label}</span>
                        {t.description && (
                          <span className="text-xs text-zinc-500">{t.description}</span>
                        )}
                      </button>
                    ))}
                    {filteredTools.length === 0 && (
                      <div className="px-4 py-4 text-center text-sm text-zinc-500">
                        {tools.length === 0
                          ? "No models in database"
                          : `No models match "${search}"`}
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Model used / chosen - displayed after send or when selected */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
        <span className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
          {loading ? "Choosing model..." : "Model used"}
        </span>
        <p className="text-sm font-medium text-primary-400">
          {loading ? "..." : modelUsed || (isManual && current?.label) || "—"}
        </p>
      </div>
    </div>
  );
}
