import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  LayoutGrid,
  Shield,
  ArrowRight,
  FileText,
  Image,
  Code2,
  Database,
  Briefcase,
  Megaphone,
  Check,
  Star,
} from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import ToolCard from "../components/ToolCard";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const steps = [
  {
    icon: Zap,
    title: "Subscribe once",
    description: "Choose a plan that fits your team. One bill for all AI tools and models.",
  },
  {
    icon: LayoutGrid,
    title: "Browse the catalog",
    description: "Access text, image, code, and data tools from a single dashboard.",
  },
  {
    icon: Sparkles,
    title: "Use any tool",
    description: "Switch between models and tools without managing separate APIs or keys.",
  },
  {
    icon: Shield,
    title: "Stay secure",
    description: "Enterprise-grade security and compliance. Your data stays yours.",
  },
];

const homeTools = [
  { icon: FileText, title: "Text & Writing", description: "Summarization, translation, copywriting, and long-form generation.", category: "Text" },
  { icon: Image, title: "Image Generation", description: "Create and edit images with leading vision and diffusion models.", category: "Image" },
  { icon: Code2, title: "Code & Dev", description: "Code completion, refactoring, and documentation across languages.", category: "Code" },
  { icon: Database, title: "Data & Analysis", description: "Query, analyze, and visualize data with natural language.", category: "Data" },
  { icon: Briefcase, title: "Resume & Career", description: "Tailored resumes, cover letters, and interview prep.", category: "Career" },
  { icon: Megaphone, title: "Marketing", description: "Ad copy, social posts, and campaign ideas in seconds.", category: "Marketing" },
];

const benefits = [
  { icon: Zap, text: "No per-model contracts or vendor lock-in" },
  { icon: LayoutGrid, text: "Unified billing and usage dashboard" },
  { icon: Shield, text: "SOC 2 and GDPR compliant" },
  { icon: Star, text: "New tools and models added every month" },
];

const pricingPlans = [
  { name: "Basic", price: "$29", period: "/mo", description: "For individuals and side projects", features: ["50K tokens/mo", "5 AI tools", "Email support"] },
  { name: "Pro", price: "$99", period: "/mo", description: "For teams and startups", features: ["500K tokens/mo", "All tools", "Priority support", "API access"], highlight: true },
  { name: "Enterprise", price: "Custom", period: "", description: "For large organizations", features: ["Unlimited usage", "Dedicated support", "SSO & audit logs", "SLA"] },
];

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      {/* Hero */}
      <section className="relative px-4 pt-20 pb-32 sm:px-6 lg:px-8 lg:pt-28 lg:pb-40">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            One Subscription.{" "}
            <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Unlimited AI Power.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400"
          >
            MCCARTHY is your all-in-one platform for AI tools and language models. One login, one bill, no API key chaos.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/dashboard">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 transition-colors"
              >
                Explore Tools <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
            <Link to="/signup">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Get Started
              </motion.span>
            </Link>
          </motion.div>
          {/* Floating tool cards */}
          <motion.div
            className="mt-16 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {["Text", "Image", "Code", "Data"].map((label, i) => (
              <motion.div
                key={label}
                whileHover={{ y: -6 }}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-300 backdrop-blur-sm"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold text-white"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mt-2 max-w-2xl text-center text-zinc-400"
          >
            Get from signup to first API call in minutes.
          </motion.p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-primary-500/20 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Grid */}
      <section className="relative border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold text-white"
          >
            AI tools for every use case
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mt-2 max-w-2xl text-center text-zinc-400"
          >
            One subscription unlocks the full catalog.
          </motion.p>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homeTools.map((tool, i) => (
              <ToolCard
                key={tool.title}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                category={tool.category}
                ctaLabel="Use Tool"
                onCta={() => {}}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why MCCARTHY */}
      <section className="relative border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold text-white"
          >
            Why MCCARTHY
          </motion.h2>
          <ul className="mt-12 space-y-4">
            {benefits.map((item, i) => (
              <motion.li
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/20">
                  <item.icon className="h-5 w-5 text-primary-400" />
                </div>
                <span className="text-zinc-300">{item.text}</span>
                <Check className="ml-auto h-5 w-5 text-primary-500 shrink-0" />
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Vendor section */}
      <section className="relative border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-primary-500/30 bg-gradient-to-br from-primary-500/10 to-transparent p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white">Build on MCCARTHY</h2>
            <p className="mt-2 text-zinc-400">
              Have an AI model or tool? List it on our platform and reach thousands of teams.
            </p>
            <Link to="/vendor-register">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 inline-block rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-500 transition-colors"
              >
                Register as Vendor
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="relative border-t border-white/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold text-white"
          >
            Simple pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mt-2 max-w-2xl text-center text-zinc-400"
          >
            Start free, scale as you grow.
          </motion.p>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-primary-500/50 bg-primary-500/10 shadow-lg shadow-primary-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-primary-500/20"
                }`}
              >
                <h3 className="font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
                <p className="mt-4 text-3xl font-bold text-white">
                  {plan.price}
                  <span className="text-base font-normal text-zinc-500">{plan.period}</span>
                </p>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="h-4 w-4 text-primary-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`mt-6 w-full rounded-xl py-2.5 text-sm font-medium ${
                    plan.highlight
                      ? "bg-primary-600 text-white hover:bg-primary-500"
                      : "border border-white/20 text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  Get started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
