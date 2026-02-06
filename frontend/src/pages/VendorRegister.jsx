import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Mail, FileText, Send, Shield, Loader2 } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function VendorRegister() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    company: "",
    contact: "",
    product: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!form.company || !form.contact || !form.product || !form.description) {
        throw new Error("All fields are required");
      }

      // TODO: Send vendor registration request to backend
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting vendor registration:", err);
      setError(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="mt-4 text-xl font-bold text-white">Application Submitted!</h2>
          <p className="mt-2 text-zinc-400">
            Thank you for your interest in becoming a vendor. We'll review your application and get back to you soon.
          </p>
          <motion.button
            onClick={() => {
              setSubmitted(false);
              setForm({
                company: "",
                contact: "",
                product: "",
                description: "",
              });
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 rounded-xl bg-primary-600 px-6 py-2.5 font-semibold text-white hover:bg-primary-500 transition-colors"
          >
            Submit Another Application
          </motion.button>
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
              <Building2 className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Become a Vendor</h1>
              <p className="text-zinc-400">Apply to publish your AI tools on MCCARTHY.</p>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
            <Shield className="h-5 w-5 shrink-0 text-primary-400 mt-0.5" />
            <div className="text-sm text-zinc-300">
              Fill out the form below to apply for vendor status. Once approved, you'll be able to publish and manage your AI tools on MCCARTHY.
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-zinc-300">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="company"
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-zinc-300">
                  Contact Email <span className="text-red-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="contact"
                    type="email"
                    required
                    value={form.contact}
                    onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="product" className="block text-sm font-medium text-zinc-300">
                  Product/Service Name <span className="text-red-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="product"
                    type="text"
                    required
                    value={form.product}
                    onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Name of your AI product or service"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={6}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Tell us about your company, product, and why you want to become a vendor on MCCARTHY..."
                />
              </div>
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
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit Application
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
