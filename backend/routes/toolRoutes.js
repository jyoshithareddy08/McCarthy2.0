import express from 'express';
import * as toolController from '../controllers/toolController.js';

const router = express.Router();

// Tool routes
router.get('/', toolController.listTools);
router.post('/:toolId/test', toolController.testTool);

export default router;

