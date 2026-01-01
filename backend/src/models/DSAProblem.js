import mongoose from 'mongoose';

const dsaProblemSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    problemName: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    platformLink: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    topics: {
      type: [String],
      default: [],
    },
    solved: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: '',
    },
    codeTemplate: {
      type: String,
      default: '',
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
    reviewDifficulty: {
      type: Number,
      default: 0, // 0 = new, 1 = learning, 2 = mastered
      min: 0,
      max: 2,
    },
    interval: {
      type: Number,
      default: 1, // in days
    },
    easinessFactor: {
      type: Number,
      default: 2.5,
    },
    order: {
      type: Number,
      default: 0, // for manual ordering override
    },
  },
  {
    timestamps: true,
  }
);

// Index for spaced repetition queries
dsaProblemSchema.index({ clerkUserId: 1, nextReviewDate: 1 });
dsaProblemSchema.index({ clerkUserId: 1, reviewDifficulty: 1 });

// Index for efficient queries and streak calculation
dsaProblemSchema.index({ clerkUserId: 1, date: -1 });
dsaProblemSchema.index({ clerkUserId: 1, date: 1 });

const DSAProblem = mongoose.model('DSAProblem', dsaProblemSchema);

export default DSAProblem;
