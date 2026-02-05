import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import LLMs from "./pages/LLMs";
import Playground from "./pages/Playground";
import Pipelines from "./pages/Pipelines";
import SharedPipeline from "./pages/SharedPipeline";
import VendorRegister from "./pages/VendorRegister";
import NotFound from "./pages/NotFound";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = { duration: 0.25, ease: "easeOut" };

function PageTransition({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const isPlayground = location.pathname === "/playground";

  return (
    <div
      className={`flex flex-col ${isPlayground ? "h-screen overflow-hidden" : "min-h-screen"}`}
    >
      <Navbar />
      <main
        className={`flex-1 ${isPlayground ? "min-h-0 overflow-hidden" : ""}`}
      >
        <PageTransition>{children}</PageTransition>
      </main>
      {!isPlayground && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/signup" element={<Layout><Signup /></Layout>} />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route path="/llms" element={<Layout><LLMs /></Layout>} />
          <Route path="/playground" element={<Layout><Playground /></Layout>} />
          <Route 
            path="/pipelines" 
            element={
              <Layout>
                <ProtectedRoute>
                  <Pipelines />
                </ProtectedRoute>
              </Layout>
            } 
          />
          <Route path="/pipelines/shared/:shareToken" element={<Layout><SharedPipeline /></Layout>} />
          <Route path="/vendor-register" element={<Layout><VendorRegister /></Layout>} />
          <Route path="/404" element={<Layout><NotFound /></Layout>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
