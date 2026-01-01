import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import * as germanController from '../controllers/germanController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get('/streak', germanController.getStreak);
router.get('/stats', germanController.getStats);
router.get('/', germanController.getGermanSessions);
router.get('/:id', germanController.getGermanSession);
router.post('/', germanController.createGermanSession);
router.put('/:id', germanController.updateGermanSession);
router.delete('/:id', germanController.deleteGermanSession);

export default router;
