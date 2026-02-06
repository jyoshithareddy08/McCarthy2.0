import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  GitBranch, 
  ArrowLeft, 
  ArrowDown,
  Cpu, 
  Loader2,
  Download,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import AnimatedBackground from "../components/AnimatedBackground";

export default function SharedPipeline() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [pipeline, setPipeline] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [importedPipelineId, setImportedPipelineId] = useState(null);

  useEffect(() => {
    fetchSharedPipeline();
  }, [shareToken]);

  const fetchSharedPipeline = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pipelines/shared/${shareToken}`
      );
      // Note: Shared pipelines don't require auth, so using regular fetch

      if (!response.ok) {
        if (response.status === 404) {
          setError('Shared pipeline not found or link has been revoked');
        } else {
          setError('Failed to load shared pipeline');
        }
        return;
      }

      const data = await response.json();
      setPipeline(data.pipeline);
      setSegments(data.segments);
    } catch (err) {
      console.error('Error fetching shared pipeline:', err);
      setError('Failed to load shared pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!pipeline) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user?.id) {
      navigate('/login', { state: { from: { pathname: `/pipelines/shared/${shareToken}` } } });
      return;
    }

    try {
      setImporting(true);
      const response = await api.request(`/api/pipelines/shared/${shareToken}/import`, {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          name: `${pipeline.name} (Imported)`,
          description: pipeline.description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to import pipeline');
      }

      const data = await response.json();
      setImported(true);
      setImportedPipelineId(data.pipelineId);
    } catch (err) {
      console.error('Error importing pipeline:', err);
      alert('Failed to import pipeline. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-400 mx-auto mb-4" />
              <p className="text-zinc-400">Loading shared pipeline...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-white mb-2">Pipeline Not Found</h2>
                <p className="text-zinc-400 mb-6">{error}</p>
                <Link
                  to="/pipelines"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white hover:bg-primary-500 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Pipelines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (imported) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 max-w-md mx-auto">
                <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Pipeline Imported!</h2>
                <p className="text-zinc-400 mb-6">
                  The pipeline has been successfully imported to your account.
                </p>
                <Link
                  to="/pipelines"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white hover:bg-primary-500 transition-colors"
                >
                  View My Pipelines
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const sortedSegments = [...segments].sort((a, b) => a.order - b.order);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <Link
            to="/pipelines"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pipelines
          </Link>
          <h1 className="text-3xl font-bold text-white">Shared Pipeline</h1>
          <p className="text-zinc-400">
            View and import this shared pipeline
          </p>
        </motion.div>

        {/* Pipeline Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 rounded-2xl border border-primary-500/30 bg-primary-500/10 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{pipeline.name}</h2>
              {pipeline.description && (
                <p className="mt-1 text-zinc-400">{pipeline.description}</p>
              )}
              <p className="mt-2 text-sm text-zinc-500">
                Shared on {new Date(pipeline.sharedAt || pipeline.createdAt).toLocaleDateString()}
              </p>
            </div>
            <motion.button
              type="button"
              onClick={handleImport}
              disabled={importing}
              whileHover={!importing ? { scale: 1.02 } : {}}
              whileTap={!importing ? { scale: 0.98 } : {}}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Import Pipeline
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 rounded-2xl border border-white/10 bg-[#18181c]/80 p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-6">
            <GitBranch className="h-4 w-4" />
            Pipeline Steps ({segments.length})
          </div>

          <div className="flex flex-col gap-4">
            {sortedSegments.map((segment, i) => (
              <div key={segment.id} className="flex items-start gap-4">
                <div className="flex flex-1 flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/20">
                      <Cpu className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">
                          {segment.name || `Step ${segment.order + 1}`}
                        </p>
                        <span className="text-xs text-zinc-500">#{segment.order + 1}</span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">{segment.toolName}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Model: {segment.model || 'Default'}
                      </p>
                      {segment.prompt && (
                        <p className="text-xs text-zinc-600 mt-2 line-clamp-3">
                          {segment.prompt}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {i < sortedSegments.length - 1 && (
                  <div className="hidden sm:flex shrink-0 items-center justify-center pt-6 text-zinc-600">
                    <ArrowDown className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

