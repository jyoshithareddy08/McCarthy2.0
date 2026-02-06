import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { 
  GitBranch, 
  Plus, 
  ArrowRight, 
  FileInput, 
  Cpu, 
  FileOutput, 
  X, 
  GripVertical,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Trash2,
  ArrowLeft,
  Share2,
  Link as LinkIcon
} from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

// Execution states
const EXECUTION_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export default function Pipelines() {
  const { user } = useAuth();
  
  // Data state
  const [pipelines, setPipelines] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const [selectedPipelineSegments, setSelectedPipelineSegments] = useState([]);
  const [isCreatePipelineModalOpen, setIsCreatePipelineModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  // Pipeline execution state (scoped to selected pipeline)
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [segmentExecutionStates, setSegmentExecutionStates] = useState({});
  const [segmentOutputs, setSegmentOutputs] = useState({});
  const [finalOutput, setFinalOutput] = useState(null);
  const [expandedOutputs, setExpandedOutputs] = useState({});
  const [draggedSegment, setDraggedSegment] = useState(null);

  // Segment editor state
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const segments = selectedPipelineSegments;

  // Fetch pipelines and tools on mount
  useEffect(() => {
    fetchPipelines();
    fetchTools();
  }, []);

  // Fetch segments when pipeline is selected
  useEffect(() => {
    if (selectedPipelineId) {
      fetchSegments(selectedPipelineId);
    } else {
      setSelectedPipelineSegments([]);
    }
  }, [selectedPipelineId]);

  // Fetch pipelines from API
  const fetchPipelines = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Don't send userId in query - it comes from the auth token
      const response = await api.request(`/api/pipelines`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pipelines');
      }

      const data = await response.json();
      setPipelines(data.pipelines || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching pipelines:', err);
      setError('Failed to load pipelines. Please try again.');
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tools from API
  const fetchTools = async () => {
    try {
      const response = await api.request('/api/tools');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }

      const data = await response.json();
      // Format tools to match expected structure
      const formattedTools = (data.tools || []).map(tool => ({
        id: tool.id,
        name: tool.title,
        models: tool.models || []
      }));
      setTools(formattedTools);
    } catch (err) {
      console.error('Error fetching tools:', err);
      setTools([]);
    }
  };

  // Fetch segments for a pipeline
  const fetchSegments = async (pipelineId) => {
    try {
      const response = await api.request(`/api/pipelines/${pipelineId}/segments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch segments');
      }

      const segmentsData = await response.json();
      setSelectedPipelineSegments(segmentsData || []);
    } catch (err) {
      console.error('Error fetching segments:', err);
      setSelectedPipelineSegments([]);
    }
  };

  // Create new pipeline
  const handleCreatePipeline = async (pipelineData) => {
    if (!user?.id) {
      alert('You must be logged in to create a pipeline. Please login first.');
      return;
    }
    
    try {
      // Don't send userId in body - it comes from the auth token
      const response = await api.request('/api/pipelines', {
        method: 'POST',
        body: JSON.stringify({
          name: pipelineData.name,
          description: pipelineData.description || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: 'Failed to create pipeline',
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          alert('Your session has expired. Please login again.');
          window.location.href = '/login';
          return;
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to create pipeline');
      }

      const data = await response.json();
      
      // Add new pipeline to state
      const newPipeline = {
        id: data.pipelineId,
        name: pipelineData.name,
        description: pipelineData.description || null,
        createdAt: data.createdAt,
        isShared: false,
        shareToken: null,
        segmentCount: 0
      };
      
      setPipelines([...pipelines, newPipeline]);
      setSelectedPipelineId(newPipeline.id);
      setIsCreatePipelineModalOpen(false);
      
      // Refresh pipelines list
      await fetchPipelines();
    } catch (error) {
      console.error('Error creating pipeline:', error);
      alert(`Failed to create pipeline: ${error.message}`);
    }
  };

  // Delete pipeline
  const handleDeletePipeline = async (pipelineId) => {
    if (!window.confirm("Are you sure you want to delete this pipeline?")) {
      return;
    }

    try {
      const response = await api.request(`/api/pipelines/${pipelineId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete pipeline');
      }

      // Remove from state
      setPipelines(pipelines.filter(p => p.id !== pipelineId));
      
      if (selectedPipelineId === pipelineId) {
        setSelectedPipelineId(null);
        setSelectedPipelineSegments([]);
        // Reset execution state
        setIsRunningPipeline(false);
        setSegmentExecutionStates({});
        setSegmentOutputs({});
        setFinalOutput(null);
      }
      
      // Refresh pipelines list
      await fetchPipelines();
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      alert(`Failed to delete pipeline: ${error.message}`);
    }
  };

  // Share pipeline
  const handleSharePipeline = async () => {
    if (!selectedPipelineId || !selectedPipeline) return;
    
    // If already shared, just open the modal with existing share URL
    if (selectedPipeline?.isShared && selectedPipeline?.shareToken) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/pipelines/shared/${selectedPipeline.shareToken}`);
      setIsShareModalOpen(true);
      return;
    }
    
    setIsSharing(true);
    try {
      // Share the pipeline
      const response = await api.request(`/api/pipelines/${selectedPipelineId}/share`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to share pipeline' }));
        throw new Error(errorData.message || errorData.error || 'Failed to share pipeline');
      }

      const data = await response.json();
      setShareToken(data.shareToken);
      // Use the shareUrl from backend or construct it
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/pipelines/shared/${data.shareToken}`);
      setIsShareModalOpen(true);
      // Update pipeline to mark as shared
      handleUpdatePipeline(selectedPipelineId, { 
        isShared: true, 
        shareToken: data.shareToken
      });
      
      // Refresh pipelines to get updated share status
      await fetchPipelines();
    } catch (error) {
      console.error('Error sharing pipeline:', error);
      const errorMessage = error.message || 'Failed to share pipeline. Please try again.';
      alert(`Failed to share pipeline: ${errorMessage}`);
    } finally {
      setIsSharing(false);
    }
  };

  // Revoke share
  const handleRevokeShare = async () => {
    if (!selectedPipelineId) return;
    
    try {
      const response = await api.request(`/api/pipelines/${selectedPipelineId}/share`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to revoke share');
      }

      setShareToken(null);
      setShareUrl(null);
      setIsShareModalOpen(false);
      handleUpdatePipeline(selectedPipelineId, { isShared: false, shareToken: null });
      
      // Refresh pipelines to get updated share status
      await fetchPipelines();
    } catch (error) {
      console.error('Error revoking share:', error);
      alert('Failed to revoke share. Please try again.');
    }
  };

  // Update pipeline (local state only, for UI updates)
  const handleUpdatePipeline = (pipelineId, updates) => {
    setPipelines(pipelines.map(p => 
      p.id === pipelineId ? { ...p, ...updates } : p
    ));
  };

  // Add new segment
  const handleAddSegment = async () => {
    if (!selectedPipelineId || tools.length === 0) return;
    
    const defaultTool = tools[0];
    const newSegment = {
      id: 'new', // Temporary ID
      order: segments.length,
      toolId: defaultTool.id,
      toolName: defaultTool.name,
      model: defaultTool.models && defaultTool.models.length > 0 ? defaultTool.models[0] : null,
      prompt: "",
      name: `Step ${segments.length + 1}`
    };
    
    setSelectedSegment(newSegment);
    setIsSegmentModalOpen(true);
  };

  // Edit segment
  const handleEditSegment = (segment) => {
    setSelectedSegment(segment);
    setIsSegmentModalOpen(true);
  };

  // Save segment
  const handleSaveSegment = async (updatedSegment) => {
    if (!selectedPipelineId || !selectedSegment) return;

    try {
      const isNewSegment = selectedSegment.id === 'new';
      
      if (isNewSegment) {
        // Create new segment
        const response = await api.request(`/api/pipelines/${selectedPipelineId}/segments`, {
          method: 'POST',
          body: JSON.stringify({
            prompt: updatedSegment.prompt || '',
            toolId: updatedSegment.toolId,
            order: updatedSegment.order !== undefined ? updatedSegment.order : segments.length,
            name: updatedSegment.name || null,
            inputSource: updatedSegment.inputSource || 'previous',
            model: updatedSegment.model || null
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to create segment' }));
          throw new Error(errorData.message || errorData.error || 'Failed to create segment');
        }
      } else {
        // Update existing segment
        const response = await api.request(`/api/segments/${selectedSegment.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            prompt: updatedSegment.prompt,
            toolId: updatedSegment.toolId,
            order: updatedSegment.order,
            name: updatedSegment.name,
            inputSource: updatedSegment.inputSource || 'previous',
            model: updatedSegment.model
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to update segment' }));
          throw new Error(errorData.message || errorData.error || 'Failed to update segment');
        }
      }

      // Refresh segments
      await fetchSegments(selectedPipelineId);
      setIsSegmentModalOpen(false);
      setSelectedSegment(null);
    } catch (error) {
      console.error('Error saving segment:', error);
      alert(`Failed to save segment: ${error.message}`);
    }
  };

  // Delete segment
  const handleDeleteSegment = async (segmentId) => {
    if (!selectedPipelineId) return;

    try {
      const response = await api.request(`/api/segments/${segmentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete segment');
      }

      // Refresh segments
      await fetchSegments(selectedPipelineId);
      
      if (selectedSegment?.id === segmentId) {
        setIsSegmentModalOpen(false);
        setSelectedSegment(null);
      }
    } catch (error) {
      console.error('Error deleting segment:', error);
      alert(`Failed to delete segment: ${error.message}`);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, segment) => {
    if (isRunningPipeline) return;
    setDraggedSegment(segment);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetSegment) => {
    e.preventDefault();
    if (!draggedSegment || draggedSegment.id === targetSegment.id || isRunningPipeline || !selectedPipelineId) return;

    const draggedIndex = segments.findIndex(s => s.id === draggedSegment.id);
    const targetIndex = segments.findIndex(s => s.id === targetSegment.id);

    const newSegments = [...segments];
    const [removed] = newSegments.splice(draggedIndex, 1);
    newSegments.splice(targetIndex, 0, removed);

    // Update order in database
    try {
      await Promise.all(
        newSegments.map((segment, index) =>
          api.request(`/api/segments/${segment.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              order: index,
              prompt: segment.prompt,
              toolId: segment.toolId,
              name: segment.name,
              inputSource: segment.inputSource,
              model: segment.model
            })
          })
        )
      );
      
      // Refresh segments
      await fetchSegments(selectedPipelineId);
    } catch (error) {
      console.error('Error reordering segments:', error);
      alert('Failed to reorder segments. Please try again.');
    }
    
    setDraggedSegment(null);
  };

  // Run pipeline
  const handleRunPipeline = async () => {
    if (!selectedPipelineId || segments.length === 0 || isRunningPipeline) return;

    setIsRunningPipeline(true);
    setSegmentExecutionStates({});
    setSegmentOutputs({});
    setFinalOutput(null);

    // Reset all segments to idle
    const initialState = {};
    segments.forEach(s => {
      initialState[s.id] = EXECUTION_STATES.IDLE;
    });
    setSegmentExecutionStates(initialState);

    try {
      // Call the backend API to run the pipeline
      const response = await api.request(`/api/pipelines/${selectedPipelineId}/run`, {
        method: 'POST',
        body: JSON.stringify({
          initialInput: "Initial input text for processing...",
          inputFiles: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Pipeline execution failed' }));
        throw new Error(errorData.message || errorData.error || 'Pipeline execution failed');
      }

      const result = await response.json();
      
      // Set final output
      setFinalOutput({
        outputText: result.outputText || 'Pipeline completed successfully',
        outputFiles: result.outputFiles || []
      });

      // Mark all segments as completed
      const completedStates = {};
      segments.forEach(segment => {
        completedStates[segment.id] = EXECUTION_STATES.COMPLETED;
      });
      setSegmentExecutionStates(completedStates);
    } catch (error) {
      console.error('Error running pipeline:', error);
      alert(`Pipeline execution failed: ${error.message}`);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  // Toggle output expansion
  const toggleOutput = (segmentId) => {
    setExpandedOutputs(prev => ({
      ...prev,
      [segmentId]: !prev[segmentId]
    }));
  };

  // Get execution icon
  const getExecutionIcon = (state) => {
    switch (state) {
      case EXECUTION_STATES.RUNNING:
        return <Loader2 className="h-4 w-4 animate-spin text-primary-400" />;
      case EXECUTION_STATES.COMPLETED:
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case EXECUTION_STATES.FAILED:
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  // Get execution status text
  const getExecutionStatus = (state) => {
    switch (state) {
      case EXECUTION_STATES.RUNNING:
        return "Running...";
      case EXECUTION_STATES.COMPLETED:
        return "Completed";
      case EXECUTION_STATES.FAILED:
        return "Failed";
      default:
        return "Pending";
    }
  };

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
          <h1 className="text-3xl font-bold text-white">Pipelines</h1>
          <p className="text-zinc-400">
            Chain models and tools into repeatable workflows. Drag steps to reorder.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-400 mx-auto mb-4" />
              <p className="text-zinc-400">Loading pipelines...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-red-400">{error}</p>
            <motion.button
              type="button"
              onClick={fetchPipelines}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 rounded-xl bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
            >
              Retry
            </motion.button>
          </div>
        )}

        {/* Pipeline List View */}
        {!loading && !error && !selectedPipelineId && (
          <PipelineListView
            pipelines={pipelines}
            onSelectPipeline={setSelectedPipelineId}
            onCreatePipeline={() => setIsCreatePipelineModalOpen(true)}
            onDeletePipeline={handleDeletePipeline}
          />
        )}

        {/* Pipeline Editor View */}
        {!loading && !error && selectedPipelineId && (
          /* Pipeline Editor View */
          <div>
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              type="button"
              onClick={() => {
                setSelectedPipelineId(null);
                setIsRunningPipeline(false);
                setSegmentExecutionStates({});
                setSegmentOutputs({});
                setFinalOutput(null);
              }}
              className="mt-6 flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Pipelines
            </motion.button>

            {/* Pipeline Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 flex items-start justify-between gap-4"
            >
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedPipeline.name}</h2>
                {selectedPipeline.description && (
                  <p className="mt-1 text-zinc-400">{selectedPipeline.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  onClick={handleSharePipeline}
                  disabled={isSharing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-lg border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-400 hover:bg-primary-500/20 transition-colors disabled:opacity-50"
                >
                  {isSharing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  {selectedPipeline.isShared ? 'Update Share' : 'Share'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => handleDeletePipeline(selectedPipelineId)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>

            {/* Run Pipeline Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 flex items-center gap-4"
            >
              <motion.button
                type="button"
                onClick={handleRunPipeline}
                disabled={isRunningPipeline || segments.length === 0}
                whileHover={!isRunningPipeline && segments.length > 0 ? { scale: 1.02 } : {}}
                whileTap={!isRunningPipeline && segments.length > 0 ? { scale: 0.98 } : {}}
                className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunningPipeline ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Running Pipeline...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Run Pipeline
                  </>
                )}
              </motion.button>
              {isRunningPipeline && (
                <span className="text-sm text-zinc-400">
                  Executing {sortedSegments.filter(s => segmentExecutionStates[s.id] === EXECUTION_STATES.RUNNING).length > 0 
                    ? `step ${sortedSegments.findIndex(s => segmentExecutionStates[s.id] === EXECUTION_STATES.RUNNING) + 1}`
                    : 'pipeline'}...
                </span>
              )}
            </motion.div>

            {/* Pipeline Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 rounded-2xl border border-white/10 bg-[#18181c]/80 p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-6">
                <GitBranch className="h-4 w-4" />
                {selectedPipeline.name}
              </div>

              <div className="flex flex-col gap-4">
                {sortedSegments.map((segment, i) => {
                  const executionState = segmentExecutionStates[segment.id] || EXECUTION_STATES.IDLE;
                  const output = segmentOutputs[segment.id];
                  const isExpanded = expandedOutputs[segment.id];

                  return (
                    <div key={segment.id} className="flex items-start gap-4">
                      <motion.div
                        draggable={!isRunningPipeline}
                        onDragStart={(e) => handleDragStart(e, segment)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, segment)}
                        whileHover={!isRunningPipeline ? { y: -2 } : {}}
                        className={`flex flex-1 flex-col gap-3 rounded-xl border ${
                          executionState === EXECUTION_STATES.RUNNING
                            ? 'border-primary-500/50 bg-primary-500/10'
                            : executionState === EXECUTION_STATES.COMPLETED
                            ? 'border-green-500/30 bg-green-500/5'
                            : executionState === EXECUTION_STATES.FAILED
                            ? 'border-red-500/30 bg-red-500/5'
                            : 'border-white/10 bg-white/[0.03]'
                        } p-4 hover:border-primary-500/30 transition-colors ${
                          !isRunningPipeline ? 'cursor-grab active:cursor-grabbing' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {!isRunningPipeline && (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] text-zinc-500">
                              <GripVertical className="h-5 w-5" />
                            </div>
                          )}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/20">
                            <Cpu className="h-6 w-6 text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-white">
                                    {segment.name || `Step ${segment.order + 1}`}
                                  </p>
                                  <span className="text-xs text-zinc-500">#{segment.order + 1}</span>
                                  {getExecutionIcon(executionState)}
                                </div>
                                <p className="text-sm text-zinc-400 mt-1">{segment.toolName}</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                  Model: {segment.model}
                                </p>
                                {segment.prompt && (
                                  <p className="text-xs text-zinc-600 mt-2 line-clamp-2">
                                    {segment.prompt}
                                  </p>
                                )}
                                {executionState !== EXECUTION_STATES.IDLE && (
                                  <p className={`text-xs mt-2 ${
                                    executionState === EXECUTION_STATES.COMPLETED ? 'text-green-400' :
                                    executionState === EXECUTION_STATES.FAILED ? 'text-red-400' :
                                    'text-primary-400'
                                  }`}>
                                    {getExecutionStatus(executionState)}
                                  </p>
                                )}
                              </div>
                              {!isRunningPipeline && (
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    type="button"
                                    onClick={() => handleEditSegment(segment)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-primary-500/50 hover:text-primary-400 transition-colors"
                                  >
                                    Edit
                                  </motion.button>
                                  <motion.button
                                    type="button"
                                    onClick={() => handleDeleteSegment(segment.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-red-400 hover:border-red-500/50 transition-colors"
                                  >
                                    Delete
                                  </motion.button>
                                </div>
                              )}
                            </div>

                            {/* Output Viewer */}
                            {output && (
                              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                                <button
                                  type="button"
                                  onClick={() => toggleOutput(segment.id)}
                                  className="flex w-full items-center justify-between text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                  <span>View Output</span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="mt-3 overflow-hidden"
                                    >
                                      {output.error ? (
                                        <p className="text-sm text-red-400">{output.error}</p>
                                      ) : (
                                        <div className="space-y-2">
                                          {output.outputText && (
                                            <div className="rounded-lg bg-white/[0.03] p-3">
                                              <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                                                {output.outputText}
                                              </p>
                                            </div>
                                          )}
                                          {output.outputFiles && output.outputFiles.length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-xs text-zinc-500">Files:</p>
                                              {output.outputFiles.map((file, idx) => (
                                                <a
                                                  key={idx}
                                                  href={file}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="block text-xs text-primary-400 hover:underline"
                                                >
                                                  {file}
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                      {i < sortedSegments.length - 1 && (
                        <div className="hidden sm:flex shrink-0 items-center justify-center pt-6 text-zinc-600">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Step Button */}
                <motion.button
                  type="button"
                  onClick={handleAddSegment}
                  disabled={isRunningPipeline}
                  whileHover={!isRunningPipeline ? { scale: 1.02 } : {}}
                  whileTap={!isRunningPipeline ? { scale: 0.98 } : {}}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-4 px-6 text-zinc-500 hover:border-primary-500/50 hover:text-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-5 w-5" />
                  Add step
                </motion.button>
              </div>
            </motion.div>

            {/* Final Output Panel */}
            <AnimatePresence>
              {finalOutput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/5 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Pipeline Completed</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {finalOutput.outputText && (
                        <motion.button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(finalOutput.outputText)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition-colors"
                          title="Copy output"
                        >
                          <Copy className="h-4 w-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                  {finalOutput.outputText && (
                    <div className="rounded-lg bg-white/[0.03] p-4 mb-4">
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                        {finalOutput.outputText}
                      </p>
                    </div>
                  )}
                  {finalOutput.outputFiles && finalOutput.outputFiles.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-zinc-400 mb-2">Output Files:</p>
                      <div className="space-y-1">
                        {finalOutput.outputFiles.map((file, idx) => (
                          <a
                            key={idx}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-primary-400 hover:underline"
                          >
                            {file}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Create Pipeline Modal */}
        <AnimatePresence>
          {isCreatePipelineModalOpen && (
            <CreatePipelineModal
              onSave={handleCreatePipeline}
              onClose={() => setIsCreatePipelineModalOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Segment Editor Modal */}
        <AnimatePresence>
          {isSegmentModalOpen && selectedSegment && (
            <SegmentEditorModal
              segment={selectedSegment}
              tools={tools}
              onSave={handleSaveSegment}
              onClose={() => {
                setIsSegmentModalOpen(false);
                setSelectedSegment(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Share Pipeline Modal */}
        <AnimatePresence>
          {isShareModalOpen && shareUrl && (
            <SharePipelineModal
              shareUrl={shareUrl}
              pipelineName={selectedPipeline?.name}
              onRevoke={handleRevokeShare}
              onClose={() => setIsShareModalOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Pipeline List View Component
function PipelineListView({ pipelines, onSelectPipeline, onCreatePipeline, onDeletePipeline }) {
  return (
    <>
      {/* Create Pipeline Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-6"
      >
        <motion.button
          type="button"
          onClick={onCreatePipeline}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create New Pipeline
        </motion.button>
      </motion.div>

      {/* Pipelines Grid */}
      {pipelines.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 rounded-2xl border border-white/10 bg-[#18181c]/80 p-12 text-center"
        >
          <GitBranch className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No pipelines exist</h3>
          <p className="text-zinc-400 mb-6">
            Create your first pipeline to start chaining models and tools together.
          </p>
          <motion.button
            type="button"
            onClick={onCreatePipeline}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Pipeline
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {pipelines.map((pipeline, i) => (
              <motion.div
                key={pipeline.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-primary-500/30 hover:bg-white/[0.06] transition-colors cursor-pointer"
                onClick={() => onSelectPipeline(pipeline.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/20">
                    <GitBranch className="h-6 w-6 text-primary-400" />
                  </div>
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePipeline(pipeline.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-white">{pipeline.name}</h3>
                  {pipeline.isShared && (
                    <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-xs font-medium text-primary-300 shrink-0">
                      Shared
                    </span>
                  )}
                </div>
                {pipeline.description && (
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{pipeline.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5" />
                    {pipeline.segmentCount || 0} {(pipeline.segmentCount || 0) === 1 ? 'step' : 'steps'}
                  </span>
                  <span>
                    {new Date(pipeline.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}

// Create Pipeline Modal Component
function CreatePipelineModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    setFormData({ name: "", description: "" });
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-[#18181c]/95 backdrop-blur-xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">
              Create New Pipeline
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pipeline Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Pipeline Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none"
                placeholder="Enter pipeline name"
                required
              />
            </div>

            {/* Pipeline Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none resize-none"
                placeholder="Describe what this pipeline does..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
              >
                Create Pipeline
              </motion.button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Segment Editor Modal Component
function SegmentEditorModal({ segment, tools, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: segment.name || `Step ${segment.order + 1}`,
    toolId: segment.toolId || tools[0].id,
    model: segment.model || tools[0].models[0],
    prompt: segment.prompt || ""
  });

  const selectedTool = tools.find(t => t.id === formData.toolId) || tools[0];
  const availableModels = selectedTool?.models || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const tool = tools.find(t => t.id === formData.toolId);
    onSave({
      ...formData,
      toolName: tool?.name || "",
    });
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#18181c]/95 backdrop-blur-xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">
              {segment.id ? "Edit Segment" : "Add Segment"}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Segment Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Segment Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none"
                placeholder="Enter segment name"
              />
            </div>

            {/* Tool Selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Tool / LLM
              </label>
              <select
                value={formData.toolId}
                onChange={(e) => {
                  const tool = tools.find(t => t.id === e.target.value);
                  setFormData({
                    ...formData,
                    toolId: e.target.value,
                    model: tool?.models[0] || ""
                  });
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none"
              >
                {tools.map(tool => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            {availableModels.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Model
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none"
                >
                  {availableModels.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Prompt
              </label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-primary-500 focus:outline-none resize-none"
                placeholder="Enter the prompt for this segment..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
              >
                Save Segment
              </motion.button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Share Pipeline Modal Component
function SharePipelineModal({ shareUrl, pipelineName, onRevoke, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-[#18181c]/95 backdrop-blur-xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">
              Share Pipeline
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-400 mb-2">
                Share <span className="text-white font-medium">{pipelineName}</span> with others
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                <LinkIcon className="h-4 w-4 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                />
                <motion.button
                  type="button"
                  onClick={handleCopy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 inline mr-1" />
                      Copy
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
              <p className="text-xs text-yellow-400">
                Anyone with this link can view and import this pipeline.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <motion.button
                type="button"
                onClick={onRevoke}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Revoke Share
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
              >
                Done
              </motion.button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
