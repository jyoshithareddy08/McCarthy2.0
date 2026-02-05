import express from 'express';
import * as segmentRunController from '../controllers/segmentRunController.js';

const router = express.Router();

// Segment run routes
router.get('/:segmentRunId', segmentRunController.getSegmentRun);

export default router;

