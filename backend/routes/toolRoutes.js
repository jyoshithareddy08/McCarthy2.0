import express from 'express';
import * as toolController from '../controllers/toolController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Tool routes
router.get('/', toolController.listTools);
router.post('/', authenticate, toolController.createTool); // Create tool (vendor only)
router.post('/:toolId/test', toolController.testTool);

export default router;

