import GermanStudy from '../models/GermanStudy.js';
import { calculateStreak } from '../utils/streakCalculator.js';

// Get all German study sessions for a user
export const getGermanSessions = async (req, res) => {
  try {
    const sessions = await GermanStudy.find({ clerkUserId: req.clerkUserId })
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single German study session
export const getGermanSession = async (req, res) => {
  try {
    const session = await GermanStudy.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!session) {
      return res.status(404).json({ error: 'German study session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create German study session
export const createGermanSession = async (req, res) => {
  try {
    const { date, vocabularyWords, notes } = req.body;

    const session = await GermanStudy.create({
      clerkUserId: req.clerkUserId,
      date: date ? new Date(date) : new Date(),
      vocabularyWords: vocabularyWords || [],
      notes,
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update German study session
export const updateGermanSession = async (req, res) => {
  try {
    const session = await GermanStudy.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!session) {
      return res.status(404).json({ error: 'German study session not found' });
    }

    const { date, vocabularyWords, notes } = req.body;
    if (date) session.date = new Date(date);
    if (vocabularyWords) session.vocabularyWords = vocabularyWords;
    if (notes !== undefined) session.notes = notes;

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete German study session
export const deleteGermanSession = async (req, res) => {
  try {
    const session = await GermanStudy.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!session) {
      return res.status(404).json({ error: 'German study session not found' });
    }

    res.json({ message: 'German study session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get streak
export const getStreak = async (req, res) => {
  try {
    const sessions = await GermanStudy.find({ clerkUserId: req.clerkUserId })
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
    const sessions = await GermanStudy.find({ clerkUserId: req.clerkUserId });

    const stats = {
      totalSessions: sessions.length,
      totalVocabularyWords: 0,
      uniqueVocabularyWords: new Set(),
      dates: sessions.map((s) => s.date),
    };

    sessions.forEach((session) => {
      session.vocabularyWords.forEach((word) => {
        stats.uniqueVocabularyWords.add(word);
      });
    });

    stats.totalVocabularyWords = stats.uniqueVocabularyWords.size;
    stats.uniqueVocabularyWords = Array.from(stats.uniqueVocabularyWords);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
