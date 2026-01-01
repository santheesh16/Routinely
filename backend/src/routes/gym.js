import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import * as gymController from '../controllers/gymController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get('/streak', gymController.getStreak);
router.get('/stats', gymController.getStats);
router.get('/', gymController.getGymSessions);
router.get('/:id', gymController.getGymSession);
router.post('/', gymController.createGymSession);
router.put('/:id', gymController.updateGymSession);
router.delete('/:id', gymController.deleteGymSession);

export default router;
