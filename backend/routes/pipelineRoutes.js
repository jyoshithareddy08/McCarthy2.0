import express from 'express';
import * as pipelineController from '../controllers/pipelineController.js';
import * as segmentController from '../controllers/segmentController.js';
import * as segmentRunController from '../controllers/segmentRunController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Shared pipeline routes (public, no auth required)
router.get('/shared/:shareToken', pipelineController.getSharedPipeline);
router.post('/shared/:shareToken/import', authenticate, pipelineController.importSharedPipeline);

// Pipeline routes (protected)
router.post('/', authenticate, pipelineController.createPipeline);
router.get('/', authenticate, pipelineController.listPipelines); // Must come before /:pipelineId
router.get('/:pipelineId', authenticate, pipelineController.getPipeline);
router.delete('/:pipelineId', authenticate, pipelineController.deletePipeline);
router.post('/:pipelineId/run', authenticate, pipelineController.runPipeline);

// Pipeline sharing routes (protected)
router.post('/:pipelineId/share', authenticate, pipelineController.sharePipeline);
router.delete('/:pipelineId/share', authenticate, pipelineController.revokeShare);

// Segment routes (nested under pipelines, protected)
router.post('/:pipelineId/segments', authenticate, segmentController.createSegment);
router.get('/:pipelineId/segments', authenticate, segmentController.getSegments);

// Segment run routes (nested under pipelines)
router.get('/:pipelineId/runs', segmentRunController.getSegmentRuns);

export default router;

