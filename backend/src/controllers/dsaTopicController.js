import DSATopic from '../models/DSATopic.js';

// Get all topics for a user
export const getTopics = async (req, res) => {
  try {
    const topics = await DSATopic.find({ clerkUserId: req.clerkUserId }).sort({ topicName: 1 });
    res.json(topics);
  } catch (error) {
    console.error('Error fetching DSA topics:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single topic
export const getTopic = async (req, res) => {
  try {
    const topic = await DSATopic.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.json(topic);
  } catch (error) {
    console.error('Error fetching single topic:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create topic
export const createTopic = async (req, res) => {
  try {
    const { topicName, parentTopics, childTopics, problems } = req.body;

    if (!topicName) {
      return res.status(400).json({ error: 'Topic name is required' });
    }

    const topic = await DSATopic.create({
      clerkUserId: req.clerkUserId,
      topicName: topicName.trim(),
      parentTopics: parentTopics || [],
      childTopics: childTopics || [],
      problems: problems || [],
      nextReviewDate: new Date(), // Available for review immediately
    });

    res.status(201).json(topic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update topic
export const updateTopic = async (req, res) => {
  try {
    const topic = await DSATopic.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const { topicName, parentTopics, childTopics, problems, progress } = req.body;
    if (topicName) topic.topicName = topicName.trim();
    if (parentTopics) topic.parentTopics = parentTopics;
    if (childTopics) topic.childTopics = childTopics;
    if (problems) topic.problems = problems;
    if (progress !== undefined) topic.progress = progress;

    await topic.save();
    res.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(400).json({ error: error.message });
  }
};

// Add problem to topic
export const addProblem = async (req, res) => {
  try {
    const topic = await DSATopic.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const { problemName, platform, platformLink, difficulty, notes, codeTemplate } = req.body;

    if (!problemName || !platform || !difficulty) {
      return res.status(400).json({ error: 'Problem name, platform, and difficulty are required' });
    }

    topic.problems.push({
      problemName: problemName.trim(),
      platform: platform.trim(),
      platformLink: platformLink || '',
      difficulty,
      notes: notes || '',
      codeTemplate: codeTemplate || '',
      solved: false,
      // Initialize spaced repetition fields
      lastReviewed: new Date(),
      nextReviewDate: new Date(), // Available for review immediately
      reviewCount: 0,
      reviewDifficulty: 0,
      interval: 1,
      easinessFactor: 2.5,
      order: 0,
    });

    await topic.save();
    res.json(topic);
  } catch (error) {
    console.error('Error adding problem:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update problem in topic
export const updateProblem = async (req, res) => {
  try {
    const topic = await DSATopic.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const problemId = req.params.problemId;
    const { problemName, platform, platformLink, difficulty, solved, notes, codeTemplate } = req.body;

    const problem = topic.problems.id(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    if (problemName) problem.problemName = problemName.trim();
    if (platform) problem.platform = platform.trim();
    if (platformLink !== undefined) problem.platformLink = platformLink;
    if (difficulty) problem.difficulty = difficulty;
    if (solved !== undefined) {
      problem.solved = solved;
      if (solved && !problem.solvedDate) {
        problem.solvedDate = new Date();
      }
    }
    if (notes !== undefined) problem.notes = notes;
    if (codeTemplate !== undefined) problem.codeTemplate = codeTemplate;

    // Update topic progress
    const solvedCount = topic.problems.filter((p) => p.solved).length;
    topic.progress = topic.problems.length > 0 ? Math.round((solvedCount / topic.problems.length) * 100) : 0;

    await topic.save();
    res.json(topic);
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete problem from topic
export const deleteProblem = async (req, res) => {
  try {
    const topic = await DSATopic.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    topic.problems.id(req.params.problemId).remove();

    // Update topic progress
    const solvedCount = topic.problems.filter((p) => p.solved).length;
    topic.progress = topic.problems.length > 0 ? Math.round((solvedCount / topic.problems.length) * 100) : 0;

    await topic.save();
    res.json(topic);
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(400).json({ error: error.message });
  }
};

// Review topic (spaced repetition algorithm)
export const reviewTopic = async (req, res) => {
  try {
    const { quality } = req.body; // Quality: 0-5 (0 = complete blackout, 5 = perfect response)

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Quality must be between 0 and 5' });
    }

    const topic = await DSATopic.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Update review count
    topic.reviewCount += 1;
    topic.lastReviewed = new Date();

    // SM-2 Algorithm for spaced repetition
    if (quality >= 3) {
      // Correct response
      if (topic.reviewCount === 1) {
        topic.interval = 1;
      } else if (topic.reviewCount === 2) {
        topic.interval = 6;
      } else {
        topic.interval = Math.round(topic.interval * topic.easinessFactor);
      }

      // Update easiness factor
      topic.easinessFactor = Math.max(
        1.3,
        topic.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );

      // Update difficulty
      if (quality === 5) {
        topic.difficulty = Math.min(2, topic.difficulty + 1);
      } else if (quality === 4) {
        topic.difficulty = Math.min(2, topic.difficulty + 0.5);
      }
    } else {
      // Incorrect response - reset
      topic.interval = 1;
      topic.difficulty = Math.max(0, topic.difficulty - 0.5);
      topic.easinessFactor = Math.max(1.3, topic.easinessFactor - 0.2);
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + topic.interval);
    topic.nextReviewDate = nextReview;

    await topic.save();
    res.json(topic);
  } catch (error) {
    console.error('Error reviewing topic:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete topic
export const deleteTopic = async (req, res) => {
  try {
    const topic = await DSATopic.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get topics due for review
export const getDueTopics = async (req, res) => {
  try {
    const topics = await DSATopic.find({
      clerkUserId: req.clerkUserId,
      nextReviewDate: { $lte: new Date() },
    }).sort({ nextReviewDate: 1 });

    res.json(topics);
  } catch (error) {
    console.error('Error fetching due topics:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get roadmap structure (all topics with relationships)
export const getRoadmap = async (req, res) => {
  try {
    const topics = await DSATopic.find({ clerkUserId: req.clerkUserId }).sort({ topicName: 1 });

    // Build roadmap structure
    const roadmap = {
      nodes: topics.map((topic) => ({
        id: topic._id.toString(),
        name: topic.topicName,
        progress: topic.progress,
        difficulty: topic.difficulty,
        problemCount: topic.problems.length,
        solvedCount: topic.problems.filter((p) => p.solved).length,
        nextReviewDate: topic.nextReviewDate,
        isDue: topic.nextReviewDate <= new Date(),
      })),
      edges: [],
    };

    // Build edges from parent-child relationships
    topics.forEach((topic) => {
      topic.parentTopics.forEach((parentName) => {
        const parentTopic = topics.find((t) => t.topicName === parentName);
        if (parentTopic) {
          roadmap.edges.push({
            from: parentTopic._id.toString(),
            to: topic._id.toString(),
          });
        }
      });
    });

    res.json(roadmap);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: error.message });
  }
};

// Review problem in topic (spaced repetition algorithm)
export const reviewProblem = async (req, res) => {
  try {
    const { quality } = req.body; // Quality: 0-5 (0 = complete blackout, 5 = perfect response)

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Quality must be between 0 and 5' });
    }

    const topic = await DSATopic.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const problem = topic.problems.id(req.params.problemId);
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

    await topic.save();
    res.json(topic);
  } catch (error) {
    console.error('Error reviewing problem:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update problem order in topic
export const updateProblemOrder = async (req, res) => {
  try {
    const { order } = req.body;

    if (order === undefined) {
      return res.status(400).json({ error: 'Order is required' });
    }

    const topic = await DSATopic.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const problem = topic.problems.id(req.params.problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    problem.order = order;
    await topic.save();
    res.json(topic);
  } catch (error) {
    console.error('Error updating problem order:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get problems for review from topics
export const getProblemsForReview = async (req, res) => {
  try {
    const { topicId, due } = req.query;
    const query = { clerkUserId: req.clerkUserId };

    if (topicId && topicId !== 'all') {
      query._id = topicId;
    }

    const topics = await DSATopic.find(query);

    const allProblems = [];
    topics.forEach((topic) => {
      topic.problems.forEach((problem) => {
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

        allProblems.push({
          _id: problem._id.toString(),
          problemName: problem.problemName,
          platform: problem.platform,
          platformLink: problem.platformLink,
          difficulty: problem.difficulty,
          notes: problem.notes,
          codeTemplate: problem.codeTemplate,
          solved: problem.solved,
          topic: topic.topicName,
          topicId: topic._id.toString(),
          source: 'topic',
          lastReviewed: problem.lastReviewed,
          nextReviewDate: problem.nextReviewDate,
          reviewCount: problem.reviewCount || 0,
          reviewDifficulty: problem.reviewDifficulty || 0,
          interval: problem.interval || 1,
          easinessFactor: problem.easinessFactor || 2.5,
          order: problem.order || 0,
          difficultyOrder: order, // For sorting
        });
      });
    });

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

    res.json(allProblems);
  } catch (error) {
    console.error('Error fetching problems for review:', error);
    res.status(500).json({ error: error.message });
  }
};

