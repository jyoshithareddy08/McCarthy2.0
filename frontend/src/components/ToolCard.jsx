import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

export default function ToolCard({
  icon: Icon,
  title,
  description,
  category,
  usage,
  ctaLabel = "Use Tool",
  onCta,
  index = 0,
  showUsage = false,
}) {
  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6
        hover:border-primary-500/30 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-primary-500/5
        transition-colors duration-300 overflow-hidden"
    >
      {/* Gradient border on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          padding: "1px",
          background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(147,51,234,0.1))",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="relative">
        {category && (
          <span className="text-xs font-medium text-primary-400 uppercase tracking-wider">
            {category}
          </span>
        )}
        <div className="mt-2 flex items-start gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-zinc-100">{title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </div>
        </div>
        {showUsage && usage != null && (
          <p className="mt-3 text-xs text-zinc-500">
            Usage this month: <span className="text-zinc-400">{usage}</span>
          </p>
        )}
        <motion.button
          type="button"
          onClick={onCta}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white
            hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[#0f0f12]"
        >
          {ctaLabel}
        </motion.button>
      </div>
    </motion.article>
  );
}
