import express from 'express';
import * as segmentController from '../controllers/segmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Segment routes (protected)
router.put('/:segmentId', authenticate, segmentController.updateSegment);
router.delete('/:segmentId', authenticate, segmentController.deleteSegment);

export default router;

