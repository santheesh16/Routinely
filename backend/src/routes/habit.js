import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import * as habitController from '../controllers/habitController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get('/', habitController.getHabits);
router.get('/:id', habitController.getHabit);
router.post('/', habitController.createHabit);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.post('/:id/log', habitController.logHabit);
router.get('/:id/logs', habitController.getHabitLogs);
router.get('/:id/motivational-thoughts', habitController.getMotivationalThoughts);
router.get('/:id/streak', habitController.getHabitStreak);

export default router;

