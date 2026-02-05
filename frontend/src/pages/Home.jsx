import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  LayoutGrid,
  Shield,
  ArrowRight,
  FileText,
  Image,
  Code2,
  Database,
  Briefcase,
  Megaphone,
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
    icon: LayoutGrid,
    title: "BROWSE THE CATALOG",
    description: "Access Text, Image, Code, and Data Tools from a Single Dashboard.",
  },
  {
    icon: Sparkles,
    title: "USE ANY TOOL",
    description: "Switch Between Models and Tools without Managing Separate APIs or Keys.",
  },
  {
    icon: Shield,
    title: "STAY SECURE",
    description: "Enterprise-Grade Security and Compliance. Your Data Stays Yours.",
  },
];

const homeTools = [
  { icon: FileText, title: "Text & Writing", description: "Summarization, Translation, Copywriting, and Long-Form Generation.", category: "Text" },
  { icon: Image, title: "Image Generation", description: "Create and Edit Images with Leading Vision and Diffusion Models.", category: "Image" },
  { icon: Code2, title: "Code & Dev", description: "Code Completion, Refactoring, and Documentation across Languages.", category: "Code" },
  { icon: Database, title: "Data & Analysis", description: "Query, Analyze, and Visualize Data with Natural Language.", category: "Data" },
  { icon: Briefcase, title: "Resume & Career", description: "Tailored Resumes, Cover Letters, and Interview Prep.", category: "Career" },
  { icon: Megaphone, title: "Marketing", description: "Ad Copy, Social Posts, and Campaign Ideas in Seconds.", category: "Marketing" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl -translate-y-10 text-center sm:-translate-y-12">
          <h1
            className="flex flex-col gap-1 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="block">
              <span className="text-white">One Subscription. </span>
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">Unlimited AI</span>
            </span>
            <span className="block bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Power.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            MCCARTHY is your all-in-one platform for AI tools and language models. One login, one bill, no API key chaos.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <span
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 transition-colors"
              >
                EXPLORE TOOLS <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link to="/signup">
              <span
                className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                GET STARTED
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold text-white"
          >
            HOW IT WORKS
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mt-2 max-w-2xl text-center text-zinc-400"
          >
            GET FROM SIGNUP TO FIRST API CALL IN MINUTES.
          </motion.p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center rounded-2xl bg-white/[0.03] p-6 text-center hover:bg-white/[0.05] transition-colors"
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
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold text-white"
          >
            AI TOOLS FOR EVERY USE CASE
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mt-2 max-w-2xl text-center text-zinc-400"
          >
            ONE SUBSCRIPTION UNLOCKS THE FULL CATALOG.
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

      {/* Vendor section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-primary-500/30 bg-gradient-to-br from-primary-500/10 to-transparent p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white">BUILD ON MCCARTHY</h2>
            <p className="mt-2 text-zinc-400">
              Have an AI Model or Tool? List It on Our Platform and Reach Thousands of Teams.
            </p>
            <Link to="/vendor-register">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 inline-block rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-500 transition-colors"
              >
                REGISTER AS VENDOR
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
