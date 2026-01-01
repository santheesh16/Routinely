import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import * as cashbookController from '../controllers/cashbookController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Cashbook routes (must come before /:id routes)
router.get('/', cashbookController.getCashbooks);
router.get('/streak', cashbookController.getStreak);
router.post('/', cashbookController.createCashbook);

// Transaction routes for specific cashbook (must be before generic /:id route)
router.get('/:cashbookId/transactions', cashbookController.getTransactions);
router.post('/:cashbookId/transactions', cashbookController.createTransaction);

// Transaction update/delete routes (use different path structure to avoid conflicts)
router.put('/transactions/:id', cashbookController.updateTransaction);
router.delete('/transactions/:id', cashbookController.deleteTransaction);

// Cashbook routes with ID (must come last)
router.get('/:id', cashbookController.getCashbook);
router.put('/:id', cashbookController.updateCashbook);
router.delete('/:id', cashbookController.deleteCashbook);

export default router;

