import mongoose from 'mongoose';

const germanWordCardSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    germanWord: {
      type: String,
      required: true,
      trim: true,
    },
    englishTranslation: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // Spaced repetition fields
    lastReviewed: {
      type: Date,
      default: Date.now,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // Difficulty level: 0 = new, 1 = learning, 2 = mastered
    difficulty: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
    },
    // Interval in days for next review (spaced repetition algorithm)
    interval: {
      type: Number,
      default: 1, // Start with 1 day
    },
    // Easiness factor for spaced repetition (SM-2 algorithm)
    easinessFactor: {
      type: Number,
      default: 2.5,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
germanWordCardSchema.index({ clerkUserId: 1, topic: 1 });
germanWordCardSchema.index({ clerkUserId: 1, nextReviewDate: 1 });
germanWordCardSchema.index({ clerkUserId: 1, difficulty: 1 });

const GermanWordCard = mongoose.model('GermanWordCard', germanWordCardSchema);

export default GermanWordCard;

