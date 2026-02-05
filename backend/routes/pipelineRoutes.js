import express from 'express';
import * as pipelineController from '../controllers/pipelineController.js';
import * as segmentController from '../controllers/segmentController.js';
import * as segmentRunController from '../controllers/segmentRunController.js';

const router = express.Router();

// Pipeline routes
router.post('/', pipelineController.createPipeline);
router.get('/:pipelineId', pipelineController.getPipeline);
router.delete('/:pipelineId', pipelineController.deletePipeline);
router.post('/:pipelineId/run', pipelineController.runPipeline);

// Segment routes (nested under pipelines)
router.post('/:pipelineId/segments', segmentController.createSegment);
router.get('/:pipelineId/segments', segmentController.getSegments);

// Segment run routes (nested under pipelines)
router.get('/:pipelineId/runs', segmentRunController.getSegmentRuns);

export default router;

