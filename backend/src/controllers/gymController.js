import GymSession from '../models/GymSession.js';
import { calculateStreak } from '../utils/streakCalculator.js';

// Get all gym sessions for a user
export const getGymSessions = async (req, res) => {
  try {
    const sessions = await GymSession.find({ clerkUserId: req.clerkUserId })
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single gym session
export const getGymSession = async (req, res) => {
  try {
    const session = await GymSession.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!session) {
      return res.status(404).json({ error: 'Gym session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create gym session
export const createGymSession = async (req, res) => {
  try {
    const { date, workoutType, duration, notes } = req.body;

    const session = await GymSession.create({
      clerkUserId: req.clerkUserId,
      date: date ? new Date(date) : new Date(),
      workoutType,
      duration,
      notes,
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update gym session
export const updateGymSession = async (req, res) => {
  try {
    const session = await GymSession.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!session) {
      return res.status(404).json({ error: 'Gym session not found' });
    }

    const { date, workoutType, duration, notes } = req.body;
    if (date) session.date = new Date(date);
    if (workoutType) session.workoutType = workoutType;
    if (duration !== undefined) session.duration = duration;
    if (notes !== undefined) session.notes = notes;

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete gym session
export const deleteGymSession = async (req, res) => {
  try {
    const session = await GymSession.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!session) {
      return res.status(404).json({ error: 'Gym session not found' });
    }

    res.json({ message: 'Gym session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get streak
export const getStreak = async (req, res) => {
  try {
    const sessions = await GymSession.find({ clerkUserId: req.clerkUserId })
      .select('date')
      .sort({ date: -1 });

    const dates = sessions.map((s) => s.date);
    const streak = calculateStreak(dates);

    res.json({ streak });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get statistics
export const getStats = async (req, res) => {
  try {
    const sessions = await GymSession.find({ clerkUserId: req.clerkUserId });

    const stats = {
      totalSessions: sessions.length,
      totalDuration: sessions.reduce((sum, s) => sum + s.duration, 0),
      averageDuration: 0,
      workoutTypes: {},
      dates: sessions.map((s) => s.date),
    };

    if (stats.totalSessions > 0) {
      stats.averageDuration = Math.round(
        stats.totalDuration / stats.totalSessions
      );
    }

    sessions.forEach((session) => {
      if (!stats.workoutTypes[session.workoutType]) {
        stats.workoutTypes[session.workoutType] = 0;
      }
      stats.workoutTypes[session.workoutType]++;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
