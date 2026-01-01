import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import * as budgetController from '../controllers/budgetController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get('/', budgetController.getBudgets);
router.get('/summary', budgetController.getMonthlySummary);
router.get('/streak', budgetController.getStreak);
router.get('/:id', budgetController.getBudget);
router.post('/', budgetController.createBudget);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

export default router;
