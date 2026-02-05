import Pipeline from '../models/Pipeline.js';
import Segment from '../models/Segment.js';
import SegmentRun from '../models/SegmentRun.js';
import { executePipeline } from '../services/pipelineExecutor.js';

/**
 * Create a new pipeline
 * POST /pipelines
 */
export const createPipeline = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const pipeline = await Pipeline.create({
      userId,
      name: req.body.name || null
    });

    res.status(201).json({
      pipelineId: pipeline._id,
      createdAt: pipeline.createdAt
    });
  } catch (error) {
    console.error('Error creating pipeline:', error);
    res.status(500).json({ error: 'Failed to create pipeline' });
  }
};

/**
 * Get pipeline by ID
 * GET /pipelines/:pipelineId
 */
export const getPipeline = async (req, res) => {
  try {
    const { pipelineId } = req.params;

    const pipeline = await Pipeline.findById(pipelineId);

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    res.json(pipeline);
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
};

/**
 * Delete pipeline and all related data
 * DELETE /pipelines/:pipelineId
 */
export const deletePipeline = async (req, res) => {
  try {
    const { pipelineId } = req.params;

    // Delete all related data
    await Promise.all([
      Pipeline.findByIdAndDelete(pipelineId),
      Segment.deleteMany({ pipelineId }),
      SegmentRun.deleteMany({ pipelineId })
    ]);

    res.json({ message: 'Pipeline deleted successfully' });
  } catch (error) {
    console.error('Error deleting pipeline:', error);
    res.status(500).json({ error: 'Failed to delete pipeline' });
  }
};

/**
 * Run pipeline execution
 * POST /pipelines/:pipelineId/run
 */
export const runPipeline = async (req, res) => {
  try {
    const { pipelineId } = req.params;
    const { initialInput, inputFiles = [] } = req.body;

    if (!initialInput) {
      return res.status(400).json({ error: 'initialInput (text) is required' });
    }

    const result = await executePipeline(pipelineId, initialInput, inputFiles);

    res.json({
      outputText: result.outputText,
      outputFiles: result.outputFiles,
      status: result.status
    });
  } catch (error) {
    console.error('Error running pipeline:', error);
    
    // Check if it's a known error
    if (error.message.includes('not found') || error.message.includes('no segments')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ 
      error: 'Pipeline execution failed',
      message: error.message 
    });
  }
};

