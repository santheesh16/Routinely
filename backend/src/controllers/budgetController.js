import Budget from '../models/Budget.js';
import { calculateStreak } from '../utils/streakCalculator.js';

// Get all budget entries for a user
export const getBudgets = async (req, res) => {
  try {
    const { month, year, type } = req.query;
    const query = { clerkUserId: req.clerkUserId };

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (type) query.type = type;

    const budgets = await Budget.find(query).sort({ date: -1 });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single budget entry
export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget entry not found' });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create budget entry
export const createBudget = async (req, res) => {
  try {
    const { category, amount, type, date, description } = req.body;

    const entryDate = date ? new Date(date) : new Date();
    const month = entryDate.getMonth() + 1;
    const year = entryDate.getFullYear();

    const budget = await Budget.create({
      clerkUserId: req.clerkUserId,
      category,
      amount,
      type,
      date: entryDate,
      description,
      month,
      year,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update budget entry
export const updateBudget = async (req, res) => {
  try {
    const { category, amount, type, date, description } = req.body;
    const budget = await Budget.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget entry not found' });
    }

    if (date) {
      const entryDate = new Date(date);
      budget.month = entryDate.getMonth() + 1;
      budget.year = entryDate.getFullYear();
      budget.date = entryDate;
    }
    if (category) budget.category = category;
    if (amount !== undefined) budget.amount = amount;
    if (type) budget.type = type;
    if (description !== undefined) budget.description = description;

    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete budget entry
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget entry not found' });
    }

    res.json({ message: 'Budget entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get monthly summary
export const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { clerkUserId: req.clerkUserId };

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const budgets = await Budget.find(query);

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      categories: {},
      byType: {
        income: [],
        expense: [],
      },
    };

    budgets.forEach((budget) => {
      if (budget.type === 'income') {
        summary.totalIncome += budget.amount;
        summary.byType.income.push(budget);
      } else {
        summary.totalExpense += budget.amount;
        summary.byType.expense.push(budget);
        if (!summary.categories[budget.category]) {
          summary.categories[budget.category] = 0;
        }
        summary.categories[budget.category] += budget.amount;
      }
    });

    summary.net = summary.totalIncome - summary.totalExpense;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get streak based on budget entries
export const getStreak = async (req, res) => {
  try {
    const budgets = await Budget.find({ clerkUserId: req.clerkUserId })
      .select('date')
      .sort({ date: -1 });

    const dates = budgets.map((b) => b.date);
    const streak = calculateStreak(dates);

    res.json({ streak });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
