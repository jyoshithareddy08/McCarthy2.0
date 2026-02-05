import Pipeline from '../models/Pipeline.js';
import Segment from '../models/Segment.js';
import SegmentRun from '../models/SegmentRun.js';
import { executeTool } from './toolAdapter.js';

/**
 * Execute a pipeline sequentially
 * @param {string} pipelineId - Pipeline ID
 * @param {string} initialInput - Initial input text
 * @param {string[]} inputFiles - Initial input files
 * @returns {Promise<{outputText: string|null, outputFiles: string[], status: string}>}
 */
export async function executePipeline(pipelineId, initialInput, inputFiles = []) {
  // 1. Fetch Pipeline
  const pipeline = await Pipeline.findById(pipelineId);
  if (!pipeline) {
    throw new Error(`Pipeline with ID ${pipelineId} not found`);
  }

  // 2. Fetch Segments ordered by order
  const segments = await Segment.find({ pipelineId })
    .sort({ order: 1 })
    .lean();

  if (segments.length === 0) {
    throw new Error('Pipeline has no segments to execute');
  }

  // 3. Initialize execution context
  let context = {
    text: initialInput || null,
    files: inputFiles || []
  };

  // 4. Execute each segment sequentially
  for (const segment of segments) {
    // 4a. Create SegmentRun with status = "running"
    const segmentRun = await SegmentRun.create({
      pipelineId,
      segmentId: segment._id,
      order: segment.order,
      inputText: context.text,
      inputFiles: context.files,
      status: 'running'
    });

    try {
      // 4b. Call Tool Adapter
      const result = await executeTool({
        toolId: segment.toolId,
        prompt: segment.prompt,
        inputText: context.text,
        inputFiles: context.files,
        model: segment.model || null // Use segment's selected model if specified
      });

      // 4d. Update SegmentRun with results
      segmentRun.outputText = result.outputText;
      segmentRun.outputFiles = result.outputFiles;
      segmentRun.status = 'completed';
      await segmentRun.save();

      // 4e. Update execution context for next segment
      context = {
        text: result.outputText,
        files: result.outputFiles
      };
    } catch (error) {
      // 5. Handle failure - mark as failed and stop execution
      segmentRun.status = 'failed';
      segmentRun.error = error.message;
      await segmentRun.save();

      // Stop execution immediately
      throw new Error(`Pipeline execution failed at segment ${segment.order}: ${error.message}`);
    }
  }

  // 6. On success - store final output in Pipeline
  pipeline.finalResponse = context.text;
  pipeline.outputFiles = context.files;
  await pipeline.save();

  return {
    outputText: context.text,
    outputFiles: context.files,
    status: 'completed'
  };
}

