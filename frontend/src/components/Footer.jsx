import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
  Product: [
    { to: "/llms", label: "LLMs" },
    { to: "/playground", label: "Playground" },
    { to: "/pipelines", label: "Pipelines" },
    { to: "/dashboard", label: "Dashboard" },
  ],
  Company: [
    { to: "/vendor-register", label: "Become a Vendor" },
    { to: "#", label: "About" },
    { to: "#", label: "Blog" },
    { to: "#", label: "Careers" },
  ],
  Legal: [
    { to: "#", label: "Privacy" },
    { to: "#", label: "Terms" },
    { to: "#", label: "Security" },
  ],
};

const social = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0f0f12]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="text-xl font-bold tracking-tight text-white">
              MCCARTHY
            </Link>
            <p className="mt-3 max-w-sm text-sm text-zinc-400">
              One subscription. Unlimited AI power. Access the best language models and tools in one place.
            </p>
            <div className="mt-4 flex gap-4">
              {social.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-zinc-500 hover:text-primary-400 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-zinc-200">{heading}</h3>
              <ul className="mt-4 space-y-2">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-zinc-500 hover:text-primary-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} MCCARTHY. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
