import mongoose from 'mongoose';

const dsaTopicSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    topicName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    parentTopics: {
      type: [String],
      default: [],
    },
    childTopics: {
      type: [String],
      default: [],
    },
    problems: [
      {
        problemName: {
          type: String,
          required: true,
          trim: true,
        },
        platform: {
          type: String,
          required: true,
          trim: true,
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
        solved: {
          type: Boolean,
          default: false,
        },
        solvedDate: {
          type: Date,
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
    ],
    // Spaced repetition fields for topic review
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
    difficulty: {
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
    progress: {
      type: Number,
      default: 0, // 0-100 percentage
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
dsaTopicSchema.index({ clerkUserId: 1, topicName: 1 });
dsaTopicSchema.index({ clerkUserId: 1, nextReviewDate: 1 });
dsaTopicSchema.index({ clerkUserId: 1, difficulty: 1 });

const DSATopic = mongoose.model('DSATopic', dsaTopicSchema);

export default DSATopic;

