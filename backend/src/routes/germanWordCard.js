import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import * as germanWordCardController from '../controllers/germanWordCardController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Specific routes first (before /:id)
router.get('/topics', germanWordCardController.getTopics);
router.get('/stats', germanWordCardController.getCardStats);
router.get('/streak', germanWordCardController.getCardStreak);
router.put('/topic', germanWordCardController.updateTopicName);
router.get('/', germanWordCardController.getWordCards);
// Parameterized routes last
router.get('/:id', germanWordCardController.getWordCard);
router.post('/', germanWordCardController.createWordCard);
router.put('/:id', germanWordCardController.updateWordCard);
router.post('/:id/review', germanWordCardController.reviewWordCard);
router.delete('/:id', germanWordCardController.deleteWordCard);

export default router;

