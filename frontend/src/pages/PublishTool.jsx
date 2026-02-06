import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Key, Link as LinkIcon, Code, Tag, Target, Image as ImageIcon, Plus, X, Loader2, Send, Shield } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function PublishTool() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    apiKey: "",
    apiEndpoint: "",
    apiMethod: "POST",
    provider: "custom",
    models: [""],
    keywords: [""],
    useCases: [""],
    image: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!form.title || !form.description || !form.apiKey || !form.apiEndpoint) {
        throw new Error("Title, description, API key, and API endpoint are required");
      }

      if (!form.models || form.models.length === 0 || form.models.every(m => !m.trim())) {
        throw new Error("At least one model is required");
      }

      // Prepare data
      const toolData = {
        title: form.title.trim(),
        description: form.description.trim(),
        apiKey: form.apiKey.trim(),
        apiEndpoint: form.apiEndpoint.trim(),
        apiMethod: form.apiMethod,
        provider: form.provider,
        models: form.models.filter(m => m.trim()),
        keywords: form.keywords.filter(k => k.trim()),
        useCases: form.useCases.filter(u => u.trim()),
        image: form.image.trim() || undefined,
      };

      const response = await api.request("/api/tools", {
        method: "POST",
        body: JSON.stringify(toolData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to create tool" }));
        throw new Error(errorData.error || "Failed to create tool");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Error creating tool:", err);
      setError(err.message || "Failed to publish tool. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addField = (fieldName) => {
    setForm((f) => ({
      ...f,
      [fieldName]: [...f[fieldName], ""],
    }));
  };

  const removeField = (fieldName, index) => {
    setForm((f) => ({
      ...f,
      [fieldName]: f[fieldName].filter((_, i) => i !== index),
    }));
  };

  const updateField = (fieldName, index, value) => {
    setForm((f) => {
      const newArray = [...f[fieldName]];
      newArray[index] = value;
      return { ...f, [fieldName]: newArray };
    });
  };

  // Check if user is a vendor
  const isVendor = isAuthenticated && user?.role === "vendor";

  if (submitted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-md rounded-2xl border border-white/10 bg-[#18181c]/90 backdrop-blur-xl p-8 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/20">
            <Send className="h-7 w-7 text-primary-400" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Tool Published!</h2>
          <p className="mt-2 text-zinc-400">
            Your tool has been successfully published and is now available on MCCARTHY.
          </p>
          <motion.button
            onClick={() => {
              setSubmitted(false);
              setForm({
                title: "",
                description: "",
                apiKey: "",
                apiEndpoint: "",
                apiMethod: "POST",
                provider: "custom",
                models: [""],
                keywords: [""],
                useCases: [""],
                image: "",
              });
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 rounded-xl bg-primary-600 px-6 py-2.5 font-semibold text-white hover:bg-primary-500 transition-colors"
          >
            Publish Another Tool
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // If not authenticated or not a vendor, show access denied
  if (!isAuthenticated || !isVendor) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-md rounded-2xl border border-white/10 bg-[#18181c]/90 backdrop-blur-xl p-8 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/20">
            <Shield className="h-7 w-7 text-primary-400" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">
            {!isAuthenticated ? "Authentication Required" : "Vendor Access Required"}
          </h2>
          <p className="mt-2 text-zinc-400">
            {!isAuthenticated
              ? "Please log in to publish tools."
              : "You need vendor access to publish tools. Contact support to become a vendor."}
          </p>
          {!isAuthenticated && (
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 rounded-xl bg-primary-600 px-6 py-2.5 font-semibold text-white hover:bg-primary-500 transition-colors"
            >
              Go to Login
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-[#18181c]/80 backdrop-blur-sm p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20">
              <FileText className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Publish New Tool</h1>
              <p className="text-zinc-400">Add your AI model or tool to MCCARTHY.</p>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
            <Shield className="h-5 w-5 shrink-0 text-primary-400 mt-0.5" />
            <div className="text-sm text-zinc-300">
              Provide your tool details, API configuration, and models. Your tool will be available immediately after publishing.
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Basic Information</h3>
              
              <div>
                <label htmlFor="tool-title" className="block text-sm font-medium text-zinc-300">
                  Tool Title <span className="text-red-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="tool-title"
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. GPT-4 Chat Assistant"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tool-description" className="block text-sm font-medium text-zinc-300">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="tool-description"
                  required
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Describe what your tool does, its capabilities, and who it's for..."
                />
              </div>

              <div>
                <label htmlFor="tool-image" className="block text-sm font-medium text-zinc-300">
                  Image URL (optional)
                </label>
                <div className="relative mt-1.5">
                  <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="tool-image"
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* API Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">API Configuration</h3>
              
              <div>
                <label htmlFor="tool-api-endpoint" className="block text-sm font-medium text-zinc-300">
                  API Endpoint <span className="text-red-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="tool-api-endpoint"
                    type="url"
                    required
                    value={form.apiEndpoint}
                    onChange={(e) => setForm((f) => ({ ...f, apiEndpoint: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="https://api.example.com/v1/chat/completions"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tool-api-key" className="block text-sm font-medium text-zinc-300">
                  API Key <span className="text-red-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="tool-api-key"
                    type="password"
                    required
                    value={form.apiKey}
                    onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="sk-..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tool-api-method" className="block text-sm font-medium text-zinc-300">
                    HTTP Method
                  </label>
                  <select
                    id="tool-api-method"
                    value={form.apiMethod}
                    onChange={(e) => setForm((f) => ({ ...f, apiMethod: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-8 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tool-provider" className="block text-sm font-medium text-zinc-300">
                    Provider
                  </label>
                  <select
                    id="tool-provider"
                    value={form.provider}
                    onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-8 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="custom">Custom</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Models */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 flex-1">
                  Models <span className="text-red-400">*</span>
                </h3>
              </div>
              {form.models.map((model, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <Code className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      required={index === 0}
                      value={model}
                      onChange={(e) => updateField("models", index, e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder={`Model ${index + 1} (e.g. gpt-4, claude-3-opus)`}
                    />
                  </div>
                  {form.models.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField("models", index)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField("models")}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Model
              </button>
            </div>

            {/* Keywords */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Keywords (optional)</h3>
              {form.keywords.map((keyword, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => updateField("keywords", index, e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder={`Keyword ${index + 1}`}
                    />
                  </div>
                  {form.keywords.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField("keywords", index)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField("keywords")}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Keyword
              </button>
            </div>

            {/* Use Cases */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Use Cases (optional)</h3>
              {form.useCases.map((useCase, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={useCase}
                      onChange={(e) => updateField("useCases", index, e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder={`Use case ${index + 1}`}
                    />
                  </div>
                  {form.useCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField("useCases", index)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField("useCases")}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Use Case
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Publish Tool
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

