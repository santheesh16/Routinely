import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import * as dsaProblemCardController from '../controllers/dsaProblemCardController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get('/review', dsaProblemCardController.getAllProblemsForReview);
router.get('/topics', dsaProblemCardController.getTopics);

export default router;

