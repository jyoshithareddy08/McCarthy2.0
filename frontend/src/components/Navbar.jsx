import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut } from "lucide-react";
import { Menu as HeadlessMenu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

const transition = { duration: 0.2 };

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/llms", label: "LLMs" },
  { to: "/playground", label: "PLAYGROUND" },
  { to: "/pipelines", label: "Pipelines" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-[#0f0f12]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">MCCARTHY</span>
        </Link>

        {/* Center nav - desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className="relative px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search - desktop */}
        <div className="hidden lg:block flex-1 max-w-xs mx-4">
          <SearchBar compact placeholder="Search..." />
        </div>

        {/* Right: Auth or user menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <HeadlessMenu as="div" className="relative">
              <MenuButton className="flex items-center gap-2 rounded-full p-1.5 ring-1 ring-white/10 hover:ring-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline text-sm text-zinc-300">{user?.name}</span>
              </MenuButton>
              <MenuItems
                as={motion.div}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={transition}
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-white/10 bg-[#18181c] py-1 shadow-xl focus:outline-none"
              >
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => navigate("/dashboard")}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${focus ? "bg-white/5" : ""} text-zinc-300`}
                    >
                      <User className="h-4 w-4" /> Dashboard
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={handleLogout}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${focus ? "bg-white/5" : ""} text-red-400`}
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  )}
                </MenuItem>
              </MenuItems>
            </HeadlessMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#0f0f12]/95 backdrop-blur-xl"
          >
            <div className="space-y-1 px-4 py-4">
              <SearchBar placeholder="Search..." className="mb-4" />
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                    location.pathname === to ? "bg-primary-500/20 text-primary-300" : "text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
