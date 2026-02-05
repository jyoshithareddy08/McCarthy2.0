import { motion } from "framer-motion";
import { GitBranch, Plus, ArrowRight, FileInput, Cpu, FileOutput } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

const pipelineSteps = [
  { id: "1", label: "Input", description: "Upload or paste source data", icon: FileInput },
  { id: "2", label: "Process", description: "Run model or transformation", icon: Cpu },
  { id: "3", label: "Output", description: "Export or send results", icon: FileOutput },
];

export default function Pipelines() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold text-white">Pipelines</h1>
          <p className="text-zinc-400">
            Chain models and tools into repeatable workflows. Drag steps to reorder.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 rounded-2xl border border-white/10 bg-[#18181c]/80 p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-6">
            <GitBranch className="h-4 w-4" />
            Default pipeline
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {pipelineSteps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-4">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex flex-1 cursor-grab items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-primary-500/30 active:cursor-grabbing"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/20">
                    <step.icon className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{step.label}</p>
                    <p className="text-sm text-zinc-500">{step.description}</p>
                  </div>
                </motion.div>
                {i < pipelineSteps.length - 1 && (
                  <div className="hidden sm:flex shrink-0 text-zinc-600">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-4 px-6 text-zinc-500 hover:border-primary-500/50 hover:text-primary-400 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add step
            </motion.button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-sm text-zinc-500"
        >
          Connect your tools and models to build custom workflows. Full drag-and-drop coming soon.
        </motion.p>
      </div>
    </div>
  );
}
