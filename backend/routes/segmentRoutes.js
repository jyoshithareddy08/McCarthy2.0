import express from 'express';
import * as segmentController from '../controllers/segmentController.js';

const router = express.Router();

// Segment routes
router.put('/:segmentId', segmentController.updateSegment);
router.delete('/:segmentId', segmentController.deleteSegment);

export default router;

