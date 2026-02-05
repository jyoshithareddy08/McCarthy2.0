import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Cpu, Zap, MessageSquare } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

const SORT_OPTIONS = ["Name", "Provider", "Context size", "Newest", "Price"];
const PROVIDERS = ["All", "OpenAI", "Anthropic", "Google", "Mistral", "Meta", "Stability"];
const CAPABILITIES = ["All", "Chat", "Completion", "Vision", "Function calling"];
const CATEGORIES = ["All", "Text", "Image", "Business", "Finance", "3D Modelling", "Code", "Data", "Marketing", "Research"];
const PRICE_OPTIONS = ["All", "Free", "Basic", "Pro", "Enterprise"];

const mockModels = [
  { id: "1", name: "GPT-4o", provider: "OpenAI", context: "128K", capability: "Chat, Vision", tier: "Pro", category: "Text", price: "Pro" },
  { id: "2", name: "Claude 3.5 Sonnet", provider: "Anthropic", context: "200K", capability: "Chat, Vision", tier: "Pro", category: "Text", price: "Pro" },
  { id: "3", name: "Gemini 1.5 Pro", provider: "Google", context: "1M", capability: "Chat, Vision", tier: "Pro", category: "Text", price: "Pro" },
  { id: "4", name: "GPT-4o mini", provider: "OpenAI", context: "128K", capability: "Chat", tier: "Basic", category: "Text", price: "Basic" },
  { id: "5", name: "Claude 3 Haiku", provider: "Anthropic", context: "200K", capability: "Chat", tier: "Basic", category: "Text", price: "Basic" },
  { id: "6", name: "Llama 3.1 70B", provider: "Meta", context: "128K", capability: "Completion", tier: "Pro", category: "Code", price: "Pro" },
  { id: "7", name: "Mistral Large", provider: "Mistral", context: "128K", capability: "Chat, Function calling", tier: "Pro", category: "Business", price: "Pro" },
  { id: "8", name: "DALL-E 3", provider: "OpenAI", context: "—", capability: "Image", tier: "Pro", category: "Image", price: "Pro" },
  { id: "9", name: "Stable Diffusion", provider: "Stability", context: "—", capability: "Image", tier: "Basic", category: "Image", price: "Basic" },
  { id: "10", name: "Finance GPT", provider: "OpenAI", context: "128K", capability: "Chat", tier: "Pro", category: "Finance", price: "Enterprise" },
];

export default function LLMs() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Name");
  const [provider, setProvider] = useState("All");
  const [capability, setCapability] = useState("All");
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState("All");

  const filtered = useMemo(() => {
    let list = [...mockModels];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q)
      );
    }
    if (provider !== "All") list = list.filter((m) => m.provider === provider);
    if (capability !== "All")
      list = list.filter((m) => m.capability.toLowerCase().includes(capability.toLowerCase()));
    if (category !== "All") list = list.filter((m) => m.category === category);
    if (price !== "All") list = list.filter((m) => m.price === price);
    if (sort === "Name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "Provider") list.sort((a, b) => a.provider.localeCompare(b.provider));
    if (sort === "Context size") list.sort((a, b) => String(b.context).localeCompare(String(a.context)));
    if (sort === "Price") list.sort((a, b) => PRICE_OPTIONS.indexOf(a.price) - PRICE_OPTIONS.indexOf(b.price));
    return list;
  }, [search, sort, provider, capability, category, price]);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Language Models</h1>
            <p className="mt-1 text-zinc-400">Browse and Use All Available Models from One Place.</p>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          {/* Sidebar filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-56 shrink-0 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-zinc-400">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-zinc-200 focus:border-primary-500 focus:outline-none"
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400">Capability</label>
              <select
                value={capability}
                onChange={(e) => setCapability(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-zinc-200 focus:border-primary-500 focus:outline-none"
              >
                {CAPABILITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-zinc-200 focus:border-primary-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400">Price</label>
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-zinc-200 focus:border-primary-500 focus:outline-none"
              >
                {PRICE_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </motion.aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search models..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 py-2.5 pl-4 pr-10 text-zinc-200 focus:border-primary-500 focus:outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    Sort: {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((model, i) => (
                  <motion.div
                    key={model.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ y: -2 }}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-primary-500/30 hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/20">
                          <Cpu className="h-5 w-5 text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{model.name}</h3>
                          <p className="text-sm text-zinc-500">{model.provider}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-primary-500/20 px-2.5 py-0.5 text-xs font-medium text-primary-300">
                        {model.tier}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" /> {model.capability}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" /> {model.context} context
                      </span>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-4 w-full rounded-lg border border-white/10 py-2 text-sm font-medium text-zinc-300 hover:border-primary-500/50 hover:text-primary-400 transition-colors"
                    >
                      Use in Playground
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
