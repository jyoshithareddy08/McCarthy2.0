import SegmentRun from '../models/SegmentRun.js';

/**
 * Get all segment runs for a pipeline
 * GET /pipelines/:pipelineId/runs
 */
export const getSegmentRuns = async (req, res) => {
  try {
    const { pipelineId } = req.params;

    const segmentRuns = await SegmentRun.find({ pipelineId })
      .sort({ order: 1 })
      .lean();

    res.json(segmentRuns);
  } catch (error) {
    console.error('Error fetching segment runs:', error);
    res.status(500).json({ error: 'Failed to fetch segment runs' });
  }
};

/**
 * Get single segment run by ID
 * GET /segment-runs/:segmentRunId
 */
export const getSegmentRun = async (req, res) => {
  try {
    const { segmentRunId } = req.params;

    const segmentRun = await SegmentRun.findById(segmentRunId);

    if (!segmentRun) {
      return res.status(404).json({ error: 'Segment run not found' });
    }

    res.json({
      inputText: segmentRun.inputText,
      inputFiles: segmentRun.inputFiles,
      outputText: segmentRun.outputText,
      outputFiles: segmentRun.outputFiles,
      status: segmentRun.status,
      error: segmentRun.error,
      order: segmentRun.order,
      createdAt: segmentRun.createdAt,
      updatedAt: segmentRun.updatedAt
    });
  } catch (error) {
    console.error('Error fetching segment run:', error);
    res.status(500).json({ error: 'Failed to fetch segment run' });
  }
};

