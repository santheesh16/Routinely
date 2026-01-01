import DSATopic from '../models/DSATopic.js';
import DSAProblem from '../models/DSAProblem.js';

// Get all problems for review from both sources (topics and standalone)
export const getAllProblemsForReview = async (req, res) => {
  try {
    const { due, topic } = req.query;

    // Get problems from topics
    const topicQuery = { clerkUserId: req.clerkUserId };
    if (topic && topic !== 'all') {
      topicQuery.topicName = topic;
    }

    const topics = await DSATopic.find(topicQuery);
    const topicProblems = [];

    topics.forEach((topicDoc) => {
      topicDoc.problems.forEach((problem) => {
        // Filter by due date if requested
        if (due === 'true' || due === true) {
          const nextReview = problem.nextReviewDate || new Date();
          if (nextReview > new Date()) {
            return; // Skip if not due
          }
        }

        // Difficulty order mapping: easy=1, medium=2, hard=3
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        const order = difficultyOrder[problem.difficulty] || 999;

        topicProblems.push({
          _id: problem._id.toString(),
          problemName: problem.problemName,
          platform: problem.platform,
          platformLink: problem.platformLink,
          difficulty: problem.difficulty,
          notes: problem.notes || '',
          codeTemplate: problem.codeTemplate || '',
          solved: problem.solved,
          topic: topicDoc.topicName,
          topicId: topicDoc._id.toString(),
          source: 'topic',
          lastReviewed: problem.lastReviewed,
          nextReviewDate: problem.nextReviewDate,
          reviewCount: problem.reviewCount || 0,
          reviewDifficulty: problem.reviewDifficulty || 0,
          interval: problem.interval || 1,
          easinessFactor: problem.easinessFactor || 2.5,
          order: problem.order || 0,
          difficultyOrder: order,
        });
      });
    });

    // Get standalone problems
    const standaloneQuery = { clerkUserId: req.clerkUserId };
    if (due === 'true' || due === true) {
      standaloneQuery.nextReviewDate = { $lte: new Date() };
    }

    const standaloneProblems = await DSAProblem.find(standaloneQuery);
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };

    const formattedStandalone = standaloneProblems.map((problem) => ({
      _id: problem._id.toString(),
      problemName: problem.problemName,
      platform: problem.platform,
      platformLink: problem.platformLink,
      difficulty: problem.difficulty,
      notes: problem.notes || '',
      codeTemplate: problem.codeTemplate || '',
      solved: problem.solved,
      topics: problem.topics || [],
      topic: problem.topics && problem.topics.length > 0 ? problem.topics[0] : 'Uncategorized',
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

    // Merge both sources
    const allProblems = [...topicProblems, ...formattedStandalone];

    // Sort by: difficulty (easy→medium→hard), then by order field, then by nextReviewDate
    allProblems.sort((a, b) => {
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

    // Group by topic
    const groupedByTopic = {};
    allProblems.forEach((problem) => {
      const topicName = problem.topic || 'Uncategorized';
      if (!groupedByTopic[topicName]) {
        groupedByTopic[topicName] = [];
      }
      groupedByTopic[topicName].push(problem);
    });

    res.json({
      problems: allProblems,
      groupedByTopic,
      stats: {
        total: allProblems.length,
        due: allProblems.filter((p) => {
          const nextReview = p.nextReviewDate ? new Date(p.nextReviewDate) : new Date(0);
          return nextReview <= new Date();
        }).length,
        byDifficulty: {
          easy: allProblems.filter((p) => p.difficulty === 'easy').length,
          medium: allProblems.filter((p) => p.difficulty === 'medium').length,
          hard: allProblems.filter((p) => p.difficulty === 'hard').length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching all problems for review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all topics (for filter dropdown)
export const getTopics = async (req, res) => {
  try {
    const topics = await DSATopic.find({ clerkUserId: req.clerkUserId })
      .select('topicName')
      .sort({ topicName: 1 });

    const topicNames = topics.map((t) => t.topicName);

    // Also get unique topics from standalone problems
    const standaloneProblems = await DSAProblem.find({ clerkUserId: req.clerkUserId });
    const standaloneTopics = new Set();
    standaloneProblems.forEach((problem) => {
      problem.topics?.forEach((topic) => {
        if (topic) standaloneTopics.add(topic);
      });
    });

    const allTopics = [...new Set([...topicNames, ...Array.from(standaloneTopics)])].sort();

    res.json(allTopics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: error.message });
  }
};

