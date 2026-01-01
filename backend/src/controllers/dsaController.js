import DSAProblem from '../models/DSAProblem.js';
import { calculateStreak } from '../utils/streakCalculator.js';

// Get all DSA problems for a user
export const getDSAProblems = async (req, res) => {
  try {
    const { platform, difficulty, topic } = req.query;
    const query = { clerkUserId: req.clerkUserId, solved: true };

    if (platform) query.platform = platform;
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topics = { $in: [topic] };

    const problems = await DSAProblem.find(query).sort({ date: -1 });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single DSA problem
export const getDSAProblem = async (req, res) => {
  try {
    const problem = await DSAProblem.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!problem) {
      return res.status(404).json({ error: 'DSA problem not found' });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create DSA problem
export const createDSAProblem = async (req, res) => {
  try {
    const { date, problemName, platform, platformLink, difficulty, topics } = req.body;

    const problem = await DSAProblem.create({
      clerkUserId: req.clerkUserId,
      date: date ? new Date(date) : new Date(),
      problemName,
      platform,
      platformLink: platformLink || '',
      difficulty,
      topics: topics || [],
      solved: true,
      notes: req.body.notes || '',
      codeTemplate: req.body.codeTemplate || '',
      // Initialize spaced repetition fields
      lastReviewed: new Date(),
      nextReviewDate: new Date(), // Available for review immediately
      reviewCount: 0,
      reviewDifficulty: 0,
      interval: 1,
      easinessFactor: 2.5,
      order: 0,
    });

    res.status(201).json(problem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update DSA problem
export const updateDSAProblem = async (req, res) => {
  try {
    const problem = await DSAProblem.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!problem) {
      return res.status(404).json({ error: 'DSA problem not found' });
    }

    const { date, problemName, platform, platformLink, difficulty, topics, notes, codeTemplate } = req.body;
    if (date) problem.date = new Date(date);
    if (problemName) problem.problemName = problemName;
    if (platform) problem.platform = platform;
    if (platformLink !== undefined) problem.platformLink = platformLink;
    if (difficulty) problem.difficulty = difficulty;
    if (topics) problem.topics = topics;
    if (notes !== undefined) problem.notes = notes;
    if (codeTemplate !== undefined) problem.codeTemplate = codeTemplate;

    await problem.save();
    res.json(problem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete DSA problem
export const deleteDSAProblem = async (req, res) => {
  try {
    const problem = await DSAProblem.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!problem) {
      return res.status(404).json({ error: 'DSA problem not found' });
    }

    res.json({ message: 'DSA problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get streak
export const getStreak = async (req, res) => {
  try {
    // Get dates from standalone problems
    const problems = await DSAProblem.find({
      clerkUserId: req.clerkUserId,
      solved: true,
    })
      .select('date lastReviewed')
      .sort({ date: -1 });

    // Get dates from topic problems
    const DSATopic = (await import('../models/DSATopic.js')).default;
    const topics = await DSATopic.find({ clerkUserId: req.clerkUserId });

    const allDates = [];
    
    // Add dates from standalone problems (use lastReviewed if available, otherwise use date)
    problems.forEach((p) => {
      if (p.lastReviewed) {
        allDates.push(p.lastReviewed);
      } else if (p.date) {
        allDates.push(p.date);
      }
    });

    // Add dates from topic problems (use lastReviewed from problems)
    topics.forEach((topic) => {
      topic.problems.forEach((problem) => {
        if (problem.lastReviewed) {
          allDates.push(problem.lastReviewed);
        } else if (problem.solvedDate) {
          allDates.push(problem.solvedDate);
        }
      });
    });

    const streak = calculateStreak(allDates);

    res.json({ streak });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get statistics
export const getStats = async (req, res) => {
  try {
    const problems = await DSAProblem.find({
      clerkUserId: req.clerkUserId,
      solved: true,
    });

    const stats = {
      totalProblems: problems.length,
      byDifficulty: { easy: 0, medium: 0, hard: 0 },
      byPlatform: {},
      topics: {},
      dates: problems.map((p) => p.date),
    };

    problems.forEach((problem) => {
      stats.byDifficulty[problem.difficulty]++;
      
      if (!stats.byPlatform[problem.platform]) {
        stats.byPlatform[problem.platform] = 0;
      }
      stats.byPlatform[problem.platform]++;

      problem.topics.forEach((topic) => {
        if (!stats.topics[topic]) {
          stats.topics[topic] = 0;
        }
        stats.topics[topic]++;
      });
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Review standalone problem (spaced repetition algorithm)
export const reviewProblem = async (req, res) => {
  try {
    const { quality } = req.body; // Quality: 0-5 (0 = complete blackout, 5 = perfect response)

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Quality must be between 0 and 5' });
    }

    const problem = await DSAProblem.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Update review count
    problem.reviewCount = (problem.reviewCount || 0) + 1;
    problem.lastReviewed = new Date();

    // SM-2 Algorithm for spaced repetition
    if (quality >= 3) {
      // Correct response
      if (problem.reviewCount === 1) {
        problem.interval = 1;
      } else if (problem.reviewCount === 2) {
        problem.interval = 6;
      } else {
        problem.interval = Math.round((problem.interval || 1) * (problem.easinessFactor || 2.5));
      }

      // Update easiness factor
      problem.easinessFactor = Math.max(
        1.3,
        (problem.easinessFactor || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );

      // Update difficulty
      if (quality === 5) {
        problem.reviewDifficulty = Math.min(2, (problem.reviewDifficulty || 0) + 1);
      } else if (quality === 4) {
        problem.reviewDifficulty = Math.min(2, (problem.reviewDifficulty || 0) + 0.5);
      }
    } else {
      // Incorrect response - reset
      problem.interval = 1;
      problem.reviewDifficulty = Math.max(0, (problem.reviewDifficulty || 0) - 0.5);
      problem.easinessFactor = Math.max(1.3, (problem.easinessFactor || 2.5) - 0.2);
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + (problem.interval || 1));
    problem.nextReviewDate = nextReview;

    await problem.save();
    res.json(problem);
  } catch (error) {
    console.error('Error reviewing problem:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update problem order
export const updateProblemOrder = async (req, res) => {
  try {
    const { order } = req.body;

    if (order === undefined) {
      return res.status(400).json({ error: 'Order is required' });
    }

    const problem = await DSAProblem.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    problem.order = order;
    await problem.save();
    res.json(problem);
  } catch (error) {
    console.error('Error updating problem order:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get standalone problems for review
export const getProblemsForReview = async (req, res) => {
  try {
    const { due } = req.query;
    const query = { clerkUserId: req.clerkUserId };

    if (due === 'true' || due === true) {
      query.nextReviewDate = { $lte: new Date() };
    }

    const problems = await DSAProblem.find(query);

    // Difficulty order mapping: easy=1, medium=2, hard=3
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };

    const formattedProblems = problems.map((problem) => ({
      _id: problem._id.toString(),
      problemName: problem.problemName,
      platform: problem.platform,
      platformLink: problem.platformLink,
      difficulty: problem.difficulty,
      notes: problem.notes || '',
      codeTemplate: problem.codeTemplate || '',
      solved: problem.solved,
      topics: problem.topics || [],
      source: 'standalone',
      lastReviewed: problem.lastReviewed,
      nextReviewDate: problem.nextReviewDate,
      reviewCount: problem.reviewCount || 0,
      reviewDifficulty: problem.reviewDifficulty || 0,
      interval: problem.interval || 1,
      easinessFactor: problem.easinessFactor || 2.5,
      order: problem.order || 0,
      difficultyOrder: difficultyOrder[problem.difficulty] || 999,
    }));

    // Sort by: difficulty (easy→medium→hard), then by order field, then by nextReviewDate
    formattedProblems.sort((a, b) => {
      if (a.difficultyOrder !== b.difficultyOrder) {
        return a.difficultyOrder - b.difficultyOrder;
      }
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      const aDate = a.nextReviewDate ? new Date(a.nextReviewDate) : new Date(0);
      const bDate = b.nextReviewDate ? new Date(b.nextReviewDate) : new Date(0);
      return aDate - bDate;
    });

    res.json(formattedProblems);
  } catch (error) {
    console.error('Error fetching problems for review:', error);
    res.status(500).json({ error: error.message });
  }
};
