import GermanWordCard from '../models/GermanWordCard.js';

// Get all word cards for a user, optionally filtered by topic
export const getWordCards = async (req, res) => {
  try {
    if (!req.clerkUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { topic, due } = req.query;
    const query = { clerkUserId: req.clerkUserId };

    if (topic && topic !== 'all' && topic.trim() !== '') {
      query.topic = topic.trim();
    }

    if (due === 'true' || due === true) {
      // Get cards that are due for review (nextReviewDate <= now)
      const now = new Date();
      query.nextReviewDate = { $lte: now };
    }

    const cards = await GermanWordCard.find(query).sort({ nextReviewDate: 1 });
    res.json(cards);
  } catch (error) {
    console.error('Error fetching word cards:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch word cards',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get single word card
export const getWordCard = async (req, res) => {
  try {
    const card = await GermanWordCard.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!card) {
      return res.status(404).json({ error: 'Word card not found' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create word card
export const createWordCard = async (req, res) => {
  try {
    const { germanWord, englishTranslation, topic, notes } = req.body;

    if (!germanWord || !englishTranslation || !topic) {
      return res.status(400).json({ error: 'German word, English translation, and topic are required' });
    }

    const card = await GermanWordCard.create({
      clerkUserId: req.clerkUserId,
      germanWord: germanWord.trim(),
      englishTranslation: englishTranslation.trim(),
      topic: topic.trim(),
      notes: notes || '',
      nextReviewDate: new Date(), // Available for review immediately
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update word card
export const updateWordCard = async (req, res) => {
  try {
    const card = await GermanWordCard.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!card) {
      return res.status(404).json({ error: 'Word card not found' });
    }

    const { germanWord, englishTranslation, topic, notes } = req.body;
    if (germanWord) card.germanWord = germanWord.trim();
    if (englishTranslation) card.englishTranslation = englishTranslation.trim();
    if (topic) card.topic = topic.trim();
    if (notes !== undefined) card.notes = notes;

    await card.save();
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Review word card (spaced repetition algorithm)
export const reviewWordCard = async (req, res) => {
  try {
    const { quality } = req.body; // Quality: 0-5 (0 = complete blackout, 5 = perfect response)

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Quality must be between 0 and 5' });
    }

    const card = await GermanWordCard.findOne({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!card) {
      return res.status(404).json({ error: 'Word card not found' });
    }

    // Update review count
    card.reviewCount += 1;
    card.lastReviewed = new Date();

    // SM-2 Algorithm for spaced repetition
    if (quality >= 3) {
      // Correct response
      if (card.reviewCount === 1) {
        card.interval = 1;
      } else if (card.reviewCount === 2) {
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.easinessFactor);
      }

      // Update easiness factor
      card.easinessFactor = Math.max(
        1.3,
        card.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );

      // Update difficulty
      if (quality === 5) {
        card.difficulty = Math.min(2, card.difficulty + 1);
      } else if (quality === 4) {
        card.difficulty = Math.min(2, card.difficulty + 0.5);
      }
    } else {
      // Incorrect response - reset
      card.interval = 1;
      card.difficulty = Math.max(0, card.difficulty - 0.5);
      card.easinessFactor = Math.max(1.3, card.easinessFactor - 0.2);
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + card.interval);
    card.nextReviewDate = nextReview;

    await card.save();
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete word card
export const deleteWordCard = async (req, res) => {
  try {
    const card = await GermanWordCard.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.clerkUserId,
    });

    if (!card) {
      return res.status(404).json({ error: 'Word card not found' });
    }

    res.json({ message: 'Word card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all topics
export const getTopics = async (req, res) => {
  try {
    const topics = await GermanWordCard.distinct('topic', {
      clerkUserId: req.clerkUserId,
    });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update topic name for all cards in a topic
export const updateTopicName = async (req, res) => {
  try {
    const { oldTopic, newTopic } = req.body;

    if (!oldTopic || !newTopic) {
      return res.status(400).json({ error: 'Old topic and new topic are required' });
    }

    if (oldTopic.trim() === newTopic.trim()) {
      return res.status(400).json({ error: 'New topic name must be different from old topic name' });
    }

    // Update all cards with the old topic name to the new topic name
    const result = await GermanWordCard.updateMany(
      {
        clerkUserId: req.clerkUserId,
        topic: oldTopic.trim(),
      },
      {
        $set: { topic: newTopic.trim() },
      }
    );

    res.json({
      message: `Successfully updated ${result.modifiedCount} cards`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error updating topic name:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get statistics
export const getCardStats = async (req, res) => {
  try {
    const cards = await GermanWordCard.find({ clerkUserId: req.clerkUserId });

    const stats = {
      totalCards: cards.length,
      cardsByTopic: {},
      cardsByDifficulty: {
        new: 0,
        learning: 0,
        mastered: 0,
      },
      dueForReview: 0,
      totalReviews: 0,
    };

    const now = new Date();

    cards.forEach((card) => {
      // Count by topic
      stats.cardsByTopic[card.topic] = (stats.cardsByTopic[card.topic] || 0) + 1;

      // Count by difficulty
      if (card.difficulty === 0) stats.cardsByDifficulty.new++;
      else if (card.difficulty === 1) stats.cardsByDifficulty.learning++;
      else stats.cardsByDifficulty.mastered++;

      // Count due for review
      if (card.nextReviewDate <= now) {
        stats.dueForReview++;
      }

      // Total reviews
      stats.totalReviews += card.reviewCount;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get streak based on card reviews
export const getCardStreak = async (req, res) => {
  try {
    const { calculateStreak } = await import('../utils/streakCalculator.js');
    
    // Get all cards that have been reviewed at least once
    const cards = await GermanWordCard.find({ 
      clerkUserId: req.clerkUserId,
      reviewCount: { $gt: 0 } // Only cards that have been reviewed
    }).select('lastReviewed');

    // Extract unique review dates (one per day)
    const reviewDates = new Set();
    cards.forEach((card) => {
      if (card.lastReviewed) {
        const date = new Date(card.lastReviewed);
        date.setUTCHours(0, 0, 0, 0);
        reviewDates.add(date.toISOString());
      }
    });

    const dates = Array.from(reviewDates).map(d => new Date(d));
    const streak = calculateStreak(dates);

    res.json({ streak });
  } catch (error) {
    console.error('Error calculating card streak:', error);
    res.status(500).json({ error: error.message });
  }
};

