import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Mail, FileText, Send, Shield } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

export default function VendorRegister() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: "",
    contact: "",
    product: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
          <h2 className="mt-4 text-xl font-bold text-white">Request received</h2>
          <p className="mt-2 text-zinc-400">
            Our team will review your vendor application and get back to you within 2–3 business days.
          </p>
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
              <h1 className="text-2xl font-bold text-white">Register as a vendor</h1>
              <p className="text-zinc-400">List your AI model or tool on MCCARTHY.</p>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
            <Shield className="h-5 w-5 shrink-0 text-primary-400 mt-0.5" />
            <div className="text-sm text-zinc-300">
              We work with trusted providers. You keep ownership of your model; we handle billing, discovery, and support. All applications are reviewed manually.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="vendor-company" className="block text-sm font-medium text-zinc-300">
                Company / Provider name
              </label>
              <div className="relative mt-1.5">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="vendor-company"
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Acme AI"
                />
              </div>
            </div>
            <div>
              <label htmlFor="vendor-contact" className="block text-sm font-medium text-zinc-300">
                Contact email
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="vendor-contact"
                  type="email"
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="partnerships@company.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="vendor-product" className="block text-sm font-medium text-zinc-300">
                Product / Model name
              </label>
              <div className="relative mt-1.5">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="vendor-product"
                  type="text"
                  value={form.product}
                  onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g. MyModel v1"
                />
              </div>
            </div>
            <div>
              <label htmlFor="vendor-description" className="block text-sm font-medium text-zinc-300">
                Short description
              </label>
              <textarea
                id="vendor-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="What does your model or tool do? Who is it for?"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-500 transition-colors"
            >
              Submit application
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
