import { motion } from "framer-motion";
import {
  FileText,
  Image,
  Code2,
  Database,
  Briefcase,
  Megaphone,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ToolCard from "../components/ToolCard";
import AnimatedBackground from "../components/AnimatedBackground";

const stats = [
  { label: "Tokens used", value: "124.2K", sub: "this month", icon: Zap },
  { label: "Tools used", value: "8", sub: "active", icon: TrendingUp },
];

const dashboardTools = [
  { icon: FileText, title: "Text & Writing", description: "Summarization, translation, and long-form content.", usage: "12.4K tokens" },
  { icon: Image, title: "Image Generation", description: "Create and edit images with leading models.", usage: "24 images" },
  { icon: Code2, title: "Code & Dev", description: "Completion, refactoring, and documentation.", usage: "8.1K tokens" },
  { icon: Database, title: "Data & Analysis", description: "Query and analyze data with natural language.", usage: "3.2K tokens" },
  { icon: Briefcase, title: "Resume & Career", description: "Resumes, cover letters, and interview prep.", usage: "2 docs" },
  { icon: Megaphone, title: "Marketing", description: "Ad copy, social posts, and campaign ideas.", usage: "15 prompts" },
];

function AnimatedCounter({ value, suffix = "" }) {
  const num = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const decimals = value.includes(".") ? value.split(".")[1]?.slice(0, 1) : "";
  const prefix = value.startsWith("$") ? "$" : "";
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {num.toLocaleString()}
      {decimals && `.${decimals}`}
      {suffix}
    </motion.span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name ?? "there"}
          </h1>
          <p className="mt-1 text-zinc-400">Here’s your usage and quick access to tools.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-8 grid gap-4 sm:grid-cols-2"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20">
                <stat.icon className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">{stat.label}</p>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter value={stat.value} suffix={` ${stat.sub}`} />
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tools grid */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 text-xl font-semibold text-white"
        >
          Your tools
        </motion.h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardTools.map((tool, i) => (
            <ToolCard
              key={tool.title}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              usage={tool.usage}
              showUsage
              ctaLabel="Open Tool"
              onCta={() => {}}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
