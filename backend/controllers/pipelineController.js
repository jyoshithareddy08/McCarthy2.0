import crypto from 'crypto';
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
    // Use userId from authenticated user (from auth middleware)
    // req.userId is set by the authenticate middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User ID is required. Please ensure you are authenticated.' 
      });
    }

    const pipeline = await Pipeline.create({
      userId,
      name: req.body.name || null,
      description: req.body.description || null
    });

    res.status(201).json({
      pipelineId: pipeline._id,
      createdAt: pipeline.createdAt
    });
  } catch (error) {
    console.error('Error creating pipeline:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid data format',
        message: `Invalid ${error.path}: ${error.value}`
      });
    }

    res.status(500).json({ 
      error: 'Failed to create pipeline',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * List all pipelines for a user
 * GET /pipelines?userId=xxx
 */
export const listPipelines = async (req, res) => {
  try {
    // Use userId from authenticated user (from auth middleware)
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User ID is required. Please ensure you are authenticated.' 
      });
    }

    const pipelines = await Pipeline.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get segment counts for each pipeline
    const pipelinesWithCounts = await Promise.all(
      pipelines.map(async (pipeline) => {
        const segmentCount = await Segment.countDocuments({ pipelineId: pipeline._id });
        return {
          id: pipeline._id.toString(),
          name: pipeline.name,
          description: pipeline.description,
          createdAt: pipeline.createdAt,
          isShared: pipeline.isShared || false,
          shareToken: pipeline.shareToken || null,
          sharedAt: pipeline.sharedAt || null,
          segmentCount
        };
      })
    );

    res.json({
      count: pipelinesWithCounts.length,
      pipelines: pipelinesWithCounts
    });
  } catch (error) {
    console.error('Error listing pipelines:', error);
    res.status(500).json({ error: 'Failed to list pipelines' });
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

/**
 * Generate share token for a pipeline
 * POST /pipelines/:pipelineId/share
 */
export const sharePipeline = async (req, res) => {
  try {
    const { pipelineId } = req.params;

    // Validate pipelineId format (MongoDB ObjectId)
    if (!pipelineId || !pipelineId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        error: 'Invalid pipeline ID format',
        message: 'Pipeline ID must be a valid MongoDB ObjectId'
      });
    }

    const pipeline = await Pipeline.findById(pipelineId);

    if (!pipeline) {
      return res.status(404).json({ 
        error: 'Pipeline not found',
        message: `No pipeline found with ID: ${pipelineId}`
      });
    }

    // Generate a unique share token (retry if duplicate)
    let shareToken;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      shareToken = crypto.randomBytes(32).toString('hex');
      const existing = await Pipeline.findOne({ shareToken });
      if (!existing) break;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return res.status(500).json({ 
        error: 'Failed to generate unique share token',
        message: 'Please try again'
      });
    }

    // Update pipeline with sharing info
    pipeline.isShared = true;
    pipeline.shareToken = shareToken;
    pipeline.sharedAt = new Date();
    await pipeline.save();

    res.json({
      shareToken,
      shareUrl: `${req.protocol}://${req.get('host')}/pipelines/shared/${shareToken}`
    });
  } catch (error) {
    console.error('Error sharing pipeline:', error);
    
    // Handle duplicate key error (shareToken uniqueness)
    if (error.code === 11000 || error.name === 'MongoServerError') {
      return res.status(500).json({ 
        error: 'Share token conflict',
        message: 'Please try again'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to share pipeline',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * Get shared pipeline by share token
 * GET /pipelines/shared/:shareToken
 */
export const getSharedPipeline = async (req, res) => {
  try {
    const { shareToken } = req.params;

    const pipeline = await Pipeline.findOne({ shareToken, isShared: true });

    if (!pipeline) {
      return res.status(404).json({ error: 'Shared pipeline not found or link has been revoked' });
    }

    // Get segments for this pipeline
    const segments = await Segment.find({ pipelineId: pipeline._id })
      .sort({ order: 1 })
      .populate('toolId', 'title models')
      .lean();

    // Format segments for response
    const formattedSegments = segments.map(segment => ({
      id: segment._id.toString(),
      order: segment.order,
      toolId: segment.toolId._id.toString(),
      toolName: segment.toolId.title,
      model: segment.model,
      prompt: segment.prompt,
      name: segment.name,
      inputSource: segment.inputSource
    }));

    res.json({
      pipeline: {
        id: pipeline._id.toString(),
        name: pipeline.name,
        description: pipeline.description,
        createdAt: pipeline.createdAt,
        sharedAt: pipeline.sharedAt
      },
      segments: formattedSegments
    });
  } catch (error) {
    console.error('Error fetching shared pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch shared pipeline' });
  }
};

/**
 * Import a shared pipeline
 * POST /pipelines/shared/:shareToken/import
 */
export const importSharedPipeline = async (req, res) => {
  try {
    const { shareToken } = req.params;
    // Use userId from authenticated user (from auth middleware)
    const userId = req.userId || req.body.userId;
    const { name, description } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get the shared pipeline
    const sharedPipeline = await Pipeline.findOne({ shareToken, isShared: true });

    if (!sharedPipeline) {
      return res.status(404).json({ error: 'Shared pipeline not found or link has been revoked' });
    }

    // Get segments from shared pipeline
    const sharedSegments = await Segment.find({ pipelineId: sharedPipeline._id })
      .sort({ order: 1 })
      .lean();

    // Create new pipeline for the importing user
    const newPipeline = await Pipeline.create({
      userId,
      name: name || `${sharedPipeline.name} (Imported)`,
      description: description || sharedPipeline.description
    });

    // Create segments for the new pipeline
    const newSegments = await Promise.all(
      sharedSegments.map(segment =>
        Segment.create({
          pipelineId: newPipeline._id,
          toolId: segment.toolId,
          prompt: segment.prompt,
          order: segment.order,
          name: segment.name,
          inputSource: segment.inputSource,
          model: segment.model
        })
      )
    );

    res.status(201).json({
      pipelineId: newPipeline._id,
      name: newPipeline.name,
      segmentsCount: newSegments.length,
      createdAt: newPipeline.createdAt
    });
  } catch (error) {
    console.error('Error importing shared pipeline:', error);
    res.status(500).json({ error: 'Failed to import shared pipeline' });
  }
};

/**
 * Revoke sharing for a pipeline
 * DELETE /pipelines/:pipelineId/share
 */
export const revokeShare = async (req, res) => {
  try {
    const { pipelineId } = req.params;

    const pipeline = await Pipeline.findById(pipelineId);

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Revoke sharing
    pipeline.isShared = false;
    pipeline.shareToken = null;
    pipeline.sharedAt = null;
    await pipeline.save();

    res.json({ message: 'Pipeline sharing revoked successfully' });
  } catch (error) {
    console.error('Error revoking share:', error);
    res.status(500).json({ error: 'Failed to revoke sharing' });
  }
};

