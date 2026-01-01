import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import * as dsaTopicController from '../controllers/dsaTopicController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Specific routes first
router.get('/roadmap', dsaTopicController.getRoadmap);
router.get('/due', dsaTopicController.getDueTopics);
router.get('/problems/review', dsaTopicController.getProblemsForReview); // Must come before /:id
router.get('/', dsaTopicController.getTopics);
router.get('/:id', dsaTopicController.getTopic);
router.post('/', dsaTopicController.createTopic);
router.put('/:id', dsaTopicController.updateTopic);
router.post('/:id/review', dsaTopicController.reviewTopic);
router.delete('/:id', dsaTopicController.deleteTopic);

// Problem routes
router.post('/:id/problems', dsaTopicController.addProblem);
router.put('/:id/problems/:problemId', dsaTopicController.updateProblem);
router.delete('/:id/problems/:problemId', dsaTopicController.deleteProblem);
router.post('/:id/problems/:problemId/review', dsaTopicController.reviewProblem);
router.put('/:id/problems/:problemId/order', dsaTopicController.updateProblemOrder);

export default router;

