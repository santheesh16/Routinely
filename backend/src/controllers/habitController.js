import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import { calculateStreak } from '../utils/streakCalculator.js';

// Get all habits
export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({
      clerkUserId: req.clerkUserId,
      isActive: true,
    }).sort({ createdAt: -1 });

    // Check which habits are logged today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const habitIds = habits.map((h) => h._id);
    const todayLogs = await HabitLog.find({
      clerkUserId: req.clerkUserId,
      habitId: { $in: habitIds },
      date: { $gte: today, $lt: tomorrow },
    });

    const loggedTodayIds = todayLogs.map((log) => log.habitId.toString());

    // Add loggedToday flag to each habit
    const habitsWithStatus = habits.map((habit) => ({
      ...habit.toObject(),
      loggedToday: loggedTodayIds.includes(habit._id.toString()),
    }));

    res.json(habitsWithStatus);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single habit
export const getHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create habit
export const createHabit = async (req, res) => {
  try {
    const {
      name,
      description,
      cue,
      routine,
      reward,
      restDays,
      maxConsecutiveDays,
      motivationalThoughts,
    } = req.body;

    if (!name || !routine) {
      return res.status(400).json({ error: 'Name and routine are required' });
    }

    const habit = await Habit.create({
      clerkUserId: req.clerkUserId,
      name: name.trim(),
      description: description || '',
      cue: cue || '',
      routine: routine.trim(),
      reward: reward || '',
      restDays: restDays || [],
      maxConsecutiveDays: maxConsecutiveDays || 7,
      motivationalThoughts: motivationalThoughts || [],
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update habit
export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const {
      name,
      description,
      cue,
      routine,
      reward,
      restDays,
      maxConsecutiveDays,
      motivationalThoughts,
      isActive,
    } = req.body;

    if (name) habit.name = name.trim();
    if (description !== undefined) habit.description = description;
    if (cue !== undefined) habit.cue = cue;
    if (routine) habit.routine = routine.trim();
    if (reward !== undefined) habit.reward = reward;
    if (restDays) habit.restDays = restDays;
    if (maxConsecutiveDays) habit.maxConsecutiveDays = maxConsecutiveDays;
    if (motivationalThoughts) habit.motivationalThoughts = motivationalThoughts;
    if (isActive !== undefined) habit.isActive = isActive;

    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete habit
export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Also delete all related logs
    await HabitLog.deleteMany({ habitId: habit._id });

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: error.message });
  }
};

// Log habit completion
export const logHabit = async (req, res) => {
  try {
    const { moodBefore, thoughtsUsed, reflection, timeSpent } = req.body;

    const habit = await Habit.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Check if already logged today
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingLog = await HabitLog.findOne({
      habitId: habit._id,
      date: { $gte: todayStart, $lt: tomorrow },
    });

    if (existingLog) {
      return res.status(400).json({ error: 'Habit already logged for today' });
    }

    // Check if today is a rest day
    const dayOfWeek = now.getDay();
    const isRestDay = habit.restDays && habit.restDays.includes(dayOfWeek);

    // Create log entry
    const log = await HabitLog.create({
      clerkUserId: req.clerkUserId,
      habitId: habit._id,
      date: now,
      completed: true,
      moodBefore: moodBefore || 'neutral',
      thoughtsUsed: thoughtsUsed || [],
      reflection: reflection || '',
      timeSpent: timeSpent || 0,
    });

    // Update habit stats
    habit.totalCompletions += 1;
    habit.lastCompleted = now;

    // Update consecutive days: reset on rest days, increment otherwise
    if (isRestDay) {
      habit.consecutiveDaysWithoutRest = 0; // Reset on rest day
    } else {
      habit.consecutiveDaysWithoutRest += 1;
    }

    // Calculate streak from logs (including this new log)
    const logs = await HabitLog.find({
      habitId: habit._id,
      completed: true,
    })
      .sort({ date: -1 })
      .limit(365);

    const dates = logs.map((log) => log.date);
    const streakData = calculateStreak(dates);
    habit.streak = streakData.streak || 0;
    habit.bestStreak = Math.max(habit.bestStreak, habit.streak);

    await habit.save();
    res.json({ habit, log });
  } catch (error) {
    console.error('Error logging habit:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get habit logs
export const getHabitLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      clerkUserId: req.clerkUserId,
      habitId: req.params.id,
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await HabitLog.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error('Error fetching habit logs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get motivational thoughts (randomized)
export const getMotivationalThoughts = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Default thoughts if none provided
    const defaultThoughts = [
      'Progress is progress, no matter how small.',
      'Future you will thank present you.',
      'You only regret the workouts you skip.',
      'Small steps lead to big changes.',
      'Consistency beats intensity.',
      'You are stronger than your excuses.',
    ];

    const thoughts = habit.motivationalThoughts.length > 0
      ? habit.motivationalThoughts
      : defaultThoughts;

    // Return random thought
    const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];

    res.json({ thought: randomThought, allThoughts: thoughts });
  } catch (error) {
    console.error('Error fetching motivational thoughts:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get streak for a habit
export const getHabitStreak = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json({
      streak: habit.streak,
      bestStreak: habit.bestStreak,
      totalCompletions: habit.totalCompletions,
    });
  } catch (error) {
    console.error('Error fetching habit streak:', error);
    res.status(500).json({ error: error.message });
  }
};
