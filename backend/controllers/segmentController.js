import Segment from '../models/Segment.js';
import Pipeline from '../models/Pipeline.js';

/**
 * Create a new segment
 * POST /pipelines/:pipelineId/segments
 */
export const createSegment = async (req, res) => {
  try {
    const { pipelineId } = req.params;
    const { prompt, toolId, order, name, inputSource } = req.body;

    // Validate required fields
    if (!prompt || !toolId || order === undefined) {
      return res.status(400).json({ 
        error: 'prompt, toolId, and order are required' 
      });
    }

    // Validate pipeline exists
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    const segment = await Segment.create({
      pipelineId,
      prompt,
      toolId,
      order,
      name: name || null,
      inputSource: inputSource || 'previous'
    });

    res.status(201).json({
      segmentId: segment._id
    });
  } catch (error) {
    console.error('Error creating segment:', error);
    res.status(500).json({ error: 'Failed to create segment' });
  }
};

/**
 * Update segment
 * PUT /segments/:segmentId
 */
export const updateSegment = async (req, res) => {
  try {
    const { segmentId } = req.params;
    const { prompt, toolId, order, name, inputSource } = req.body;

    const updateData = {};
    if (prompt !== undefined) updateData.prompt = prompt;
    if (toolId !== undefined) updateData.toolId = toolId;
    if (order !== undefined) updateData.order = order;
    if (name !== undefined) updateData.name = name;
    if (inputSource !== undefined) updateData.inputSource = inputSource;

    const segment = await Segment.findByIdAndUpdate(
      segmentId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json(segment);
  } catch (error) {
    console.error('Error updating segment:', error);
    res.status(500).json({ error: 'Failed to update segment' });
  }
};

/**
 * Get all segments for a pipeline (ordered)
 * GET /pipelines/:pipelineId/segments
 */
export const getSegments = async (req, res) => {
  try {
    const { pipelineId } = req.params;

    const segments = await Segment.find({ pipelineId })
      .sort({ order: 1 })
      .lean();

    res.json(segments);
  } catch (error) {
    console.error('Error fetching segments:', error);
    res.status(500).json({ error: 'Failed to fetch segments' });
  }
};

/**
 * Delete segment
 * DELETE /segments/:segmentId
 */
export const deleteSegment = async (req, res) => {
  try {
    const { segmentId } = req.params;

    const segment = await Segment.findByIdAndDelete(segmentId);

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json({ message: 'Segment deleted successfully' });
  } catch (error) {
    console.error('Error deleting segment:', error);
    res.status(500).json({ error: 'Failed to delete segment' });
  }
};

