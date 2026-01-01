import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import * as dsaController from '../controllers/dsaController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get('/streak', dsaController.getStreak);
router.get('/stats', dsaController.getStats);
router.get('/problems/review', dsaController.getProblemsForReview);
router.get('/', dsaController.getDSAProblems);
router.get('/:id', dsaController.getDSAProblem);
router.post('/', dsaController.createDSAProblem);
router.put('/:id', dsaController.updateDSAProblem);
router.post('/:id/review', dsaController.reviewProblem);
router.put('/:id/order', dsaController.updateProblemOrder);
router.delete('/:id', dsaController.deleteDSAProblem);

export default router;
