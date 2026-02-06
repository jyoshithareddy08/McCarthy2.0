import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Cpu, MessageSquare, Star, Heart, Loader2 } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import { api } from "../utils/api";

const SORT_OPTIONS = ["Name", "Provider", "Newest", "Price"];
const PROVIDERS = ["All", "OpenAI", "Anthropic", "Google", "Mistral", "Meta", "Stability"];
const CAPABILITIES = ["All", "Chat", "Completion", "Vision", "Function calling"];
const CATEGORIES = [
  "Text", "Image", "Business", "Finance", "3D Modelling", "Code", "Data", "Marketing", "Research",
  "Legal", "Healthcare", "Education", "Creative Writing", "Translation", "Summarization", "Analytics",
  "Customer Support", "Sales", "Design", "Video", "Audio", "Scientific", "Gaming",
];
const INITIAL_CATEGORIES_VISIBLE = 6;
const PRICE_OPTIONS = ["All", "Free", "Basic", "Pro", "Enterprise"];

const FAVOURITES_KEY = "llm-favourites";

// Helper function to capitalize provider name
const capitalizeProvider = (provider) => {
  if (!provider) return "Custom";
  const providerMap = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    mistral: "Mistral",
    meta: "Meta",
    stability: "Stability",
    custom: "Custom"
  };
  return providerMap[provider.toLowerCase()] || provider.charAt(0).toUpperCase() + provider.slice(1);
};

// Helper function to extract capabilities from useCases and keywords
const extractCapabilities = (useCases = [], keywords = []) => {
  const allText = [...useCases, ...keywords].join(" ").toLowerCase();
  const capabilities = [];
  
  if (allText.includes("chat") || allText.includes("conversation") || allText.includes("message")) {
    capabilities.push("Chat");
  }
  if (allText.includes("image") || allText.includes("vision") || allText.includes("visual")) {
    capabilities.push("Vision");
  }
  if (allText.includes("function") || allText.includes("tool")) {
    capabilities.push("Function calling");
  }
  if (allText.includes("completion") || allText.includes("text generation")) {
    capabilities.push("Completion");
  }
  
  return capabilities.length > 0 ? capabilities.join(", ") : "Chat";
};

// Helper function to extract category from keywords and useCases
const extractCategory = (keywords = [], useCases = []) => {
  const allText = [...keywords, ...useCases].join(" ").toLowerCase();
  
  if (allText.includes("image") || allText.includes("visual") || allText.includes("art")) return "Image";
  if (allText.includes("finance") || allText.includes("financial")) return "Finance";
  if (allText.includes("code") || allText.includes("programming")) return "Code";
  if (allText.includes("business") || allText.includes("enterprise")) return "Business";
  if (allText.includes("data") || allText.includes("analytics")) return "Data";
  if (allText.includes("marketing") || allText.includes("advertising")) return "Marketing";
  if (allText.includes("research") || allText.includes("academic")) return "Research";
  
  return "Text";
};

// Helper function to determine tier/price from model name or provider
const determineTier = (title = "", provider = "") => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("mini") || titleLower.includes("haiku") || titleLower.includes("basic")) {
    return "Basic";
  }
  if (titleLower.includes("enterprise") || titleLower.includes("pro max")) {
    return "Enterprise";
  }
  if (titleLower.includes("pro") || titleLower.includes("opus") || titleLower.includes("sonnet")) {
    return "Pro";
  }
  return "Basic";
};

// Helper function to extract context size from model name or use default
const extractContext = (models = []) => {
  if (!models || models.length === 0) return "—";
  const modelStr = models.join(" ").toLowerCase();
  if (modelStr.includes("1m") || modelStr.includes("1000000")) return "1M";
  if (modelStr.includes("200k") || modelStr.includes("200000")) return "200K";
  if (modelStr.includes("128k") || modelStr.includes("128000")) return "128K";
  if (modelStr.includes("32k") || modelStr.includes("32000")) return "32K";
  if (modelStr.includes("8k") || modelStr.includes("8000")) return "8K";
  return "128K";
};

export default function LLMs() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Name");
  const [provider, setProvider] = useState("All");
  const [capability, setCapability] = useState("All");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [price, setPrice] = useState("All");
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favourites, setFavourites] = useState(() => {
    try {
      const raw = localStorage.getItem(FAVOURITES_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleFavourite = (modelId) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId);
      else next.add(modelId);
      try {
        localStorage.setItem(FAVOURITES_KEY, JSON.stringify([...next]));
      } catch (_) {}
      return next;
    });
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Transform database tools to UI model format
  const transformTools = (tools) => {
    return tools.map((tool) => ({
      id: tool._id || tool.id,
      name: tool.title || "Untitled Model",
      provider: capitalizeProvider(tool.provider),
      context: extractContext(tool.models),
      capability: extractCapabilities(tool.useCases, tool.keywords),
      tier: determineTier(tool.title, tool.provider),
      category: extractCategory(tool.keywords, tool.useCases),
      price: determineTier(tool.title, tool.provider), // Using tier as price for now
      createdAt: tool.createdAt || new Date()
    }));
  };

  // Fetch models from API - use search endpoint if search query exists, otherwise get all
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (search.trim()) {
          // Use search endpoint with FastAPI similarity service
          response = await api.request("/api/llms/search", {
            method: "POST",
            body: JSON.stringify({ query: search.trim() })
          });
        } else {
          // Get all models
          response = await api.request("/api/llms");
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        
        const data = await response.json();
        const tools = data.results || [];
        
        const transformedModels = transformTools(tools);
        setModels(transformedModels);
      } catch (err) {
        console.error("Error fetching models:", err);
        setError("Failed to load models. Please try again.");
        setModels([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchModels();
    }, search.trim() ? 300 : 0); // Only debounce when there's a search query
    
    return () => clearTimeout(timeoutId);
  }, [search]);

  // Apply dropdown filters and sorting (client-side for UI-specific filters)
  const filtered = useMemo(() => {
    let list = [...models];
    
    // Apply dropdown filters
    if (provider !== "All") list = list.filter((m) => m.provider === provider);
    if (capability !== "All")
      list = list.filter((m) => m.capability.toLowerCase().includes(capability.toLowerCase()));
    if (selectedCategories.length > 0)
      list = list.filter((m) => selectedCategories.includes(m.category));
    if (price !== "All") list = list.filter((m) => m.price === price);
    
    // Apply sorting
    if (sort === "Name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "Provider") list.sort((a, b) => a.provider.localeCompare(b.provider));
    if (sort === "Newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "Price") list.sort((a, b) => PRICE_OPTIONS.indexOf(a.price) - PRICE_OPTIONS.indexOf(b.price));
    
    return list;
  }, [models, sort, provider, capability, selectedCategories, price]);

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
          {/* Sidebar filters - Category on top with multi-select + Show more */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-64 shrink-0 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {(categoriesExpanded ? CATEGORIES : CATEGORIES.slice(0, INITIAL_CATEGORIES_VISIBLE)).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCategory(c)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      selectedCategories.includes(c)
                        ? "bg-primary-500/30 text-primary-200 border border-primary-500/50"
                        : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-zinc-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCategoriesExpanded((e) => !e)}
                className="mt-2 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
              >
                {categoriesExpanded ? "Show less" : "Show more"}
              </button>
              {selectedCategories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="mt-1 ml-0 block text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Clear selection
                </button>
              )}
            </div>
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
              {loading ? (
                <div className="col-span-2 flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
                  <span className="ml-3 text-zinc-400">Loading models...</span>
                </div>
              ) : error ? (
                <div className="col-span-2 flex items-center justify-center py-12">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="col-span-2 flex items-center justify-center py-12">
                  <p className="text-zinc-400">No models found matching your filters.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filtered.map((model, i) => (
                  <motion.div
                    key={model.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      to={`/llms/${model.id}`}
                      className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-primary-500/30 hover:bg-white/[0.06] transition-colors hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/20">
                            <Cpu className="h-5 w-5 text-primary-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-white">{model.name}</h3>
                            <p className="text-sm text-zinc-500">{model.provider}</p>
                            {model.description && (
                              <p className="mt-1 text-xs text-zinc-500 line-clamp-1" title={model.description}>{model.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-start gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavourite(model.id); }}
                            className={`p-1 rounded-lg transition-colors ${favourites.has(model.id) ? "text-red-400" : "text-zinc-500 hover:text-red-400"} hover:bg-white/5`}
                            aria-label={favourites.has(model.id) ? "Remove from favourites" : "Add to favourites"}
                          >
                            <Heart
                              className="h-5 w-5"
                              fill={favourites.has(model.id) ? "currentColor" : "none"}
                              strokeWidth={1.5}
                            />
                          </button>
                          <span className="rounded-full bg-primary-500/20 px-2.5 py-0.5 text-xs font-medium text-primary-300">
                            {model.tier}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-medium text-zinc-300">{model.rating ?? "—"}</span>
                        </div>
                        {model.reviewCount != null && (
                          <span className="text-zinc-500">({model.reviewCount.toLocaleString()} reviews)</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" /> {model.capability}
                        </span>
                      </div>
                      <Link
                        to="/playground"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-4 block w-full rounded-lg border border-white/10 py-2 text-center text-sm font-medium text-zinc-300 hover:border-primary-500/50 hover:text-primary-400 transition-colors"
                      >
                        Use in Playground
                      </Link>
                    </Link>
                  </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
