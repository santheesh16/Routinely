import Cashbook from '../models/Cashbook.js';
import CashbookTransaction from '../models/CashbookTransaction.js';
import { calculateStreak } from '../utils/streakCalculator.js';

// Get all cashbooks for a user
export const getCashbooks = async (req, res) => {
  try {
    const cashbooks = await Cashbook.find({ clerkUserId: req.clerkUserId }).sort({ createdAt: -1 });

    // Calculate balance for each cashbook
    const cashbooksWithBalance = await Promise.all(
      cashbooks.map(async (cashbook) => {
        const transactions = await CashbookTransaction.find({ cashbookId: cashbook._id });
        const balance = transactions.reduce((acc, trans) => {
          return trans.type === 'income'
            ? acc + trans.amount
            : acc - trans.amount;
        }, 0);

        return {
          ...cashbook.toObject(),
          balance,
          transactionCount: transactions.length,
        };
      })
    );

    res.json(cashbooksWithBalance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single cashbook with transactions
export const getCashbook = async (req, res) => {
  try {
    const cashbook = await Cashbook.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!cashbook) {
      return res.status(404).json({ error: 'Cashbook not found' });
    }

    const transactions = await CashbookTransaction.find({ cashbookId: cashbook._id })
      .sort({ date: -1 });

    const balance = transactions.reduce((acc, trans) => {
      return trans.type === 'income' ? acc + trans.amount : acc - trans.amount;
    }, 0);

    res.json({
      ...cashbook.toObject(),
      balance,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create cashbook
export const createCashbook = async (req, res) => {
  try {
    const { name, color, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const cashbook = await Cashbook.create({
      clerkUserId: req.clerkUserId,
      name,
      color: color || '#3b82f6',
      description: description || '',
    });

    res.status(201).json({
      ...cashbook.toObject(),
      balance: 0,
      transactionCount: 0,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update cashbook
export const updateCashbook = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const cashbook = await Cashbook.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!cashbook) {
      return res.status(404).json({ error: 'Cashbook not found' });
    }

    if (name) cashbook.name = name;
    if (color) cashbook.color = color;
    if (description !== undefined) cashbook.description = description;

    await cashbook.save();

    // Calculate balance
    const transactions = await CashbookTransaction.find({ cashbookId: cashbook._id });
    const balance = transactions.reduce((acc, trans) => {
      return trans.type === 'income' ? acc + trans.amount : acc - trans.amount;
    }, 0);

    res.json({
      ...cashbook.toObject(),
      balance,
      transactionCount: transactions.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete cashbook
export const deleteCashbook = async (req, res) => {
  try {
    const cashbook = await Cashbook.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!cashbook) {
      return res.status(404).json({ error: 'Cashbook not found' });
    }

    // Delete all transactions associated with this cashbook
    await CashbookTransaction.deleteMany({ cashbookId: cashbook._id });

    // Delete the cashbook
    await Cashbook.findByIdAndDelete(cashbook._id);

    res.json({ message: 'Cashbook deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transactions for a cashbook
export const getTransactions = async (req, res) => {
  try {
    const { cashbookId } = req.params;

    // Verify cashbook belongs to user
    const cashbook = await Cashbook.findOne({
      _id: cashbookId,
      clerkUserId: req.clerkUserId,
    });

    if (!cashbook) {
      return res.status(404).json({ error: 'Cashbook not found' });
    }

    const transactions = await CashbookTransaction.find({ cashbookId })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create transaction
export const createTransaction = async (req, res) => {
  try {
    const { cashbookId } = req.params; // Get from route parameter
    const { amount, type, description, category, paymentMode, date } = req.body;

    // Verify cashbook belongs to user
    const cashbook = await Cashbook.findOne({
      _id: cashbookId,
      clerkUserId: req.clerkUserId,
    });

    if (!cashbook) {
      return res.status(404).json({ error: 'Cashbook not found' });
    }

    const transaction = await CashbookTransaction.create({
      clerkUserId: req.clerkUserId,
      cashbookId,
      amount: parseFloat(amount),
      type,
      description: description || '',
      category: category || 'Other',
      paymentMode: paymentMode || 'Cash',
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const { amount, type, description, category, date } = req.body;
    const transaction = await CashbookTransaction.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify cashbook belongs to user
    const cashbook = await Cashbook.findOne({
      _id: transaction.cashbookId,
      clerkUserId: req.clerkUserId,
    });

    if (!cashbook) {
      return res.status(404).json({ error: 'Cashbook not found' });
    }

    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (type) transaction.type = type;
    if (description !== undefined) transaction.description = description;
    if (category) transaction.category = category;
    if (paymentMode) transaction.paymentMode = paymentMode;
    if (date) transaction.date = new Date(date);

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await CashbookTransaction.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get streak based on cashbook transactions
export const getStreak = async (req, res) => {
  try {
    const transactions = await CashbookTransaction.find({ clerkUserId: req.clerkUserId })
      .select('date')
      .sort({ date: -1 });

    const dates = transactions.map((t) => t.date);
    const streak = calculateStreak(dates);

    res.json({ streak });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

