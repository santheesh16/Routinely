import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    // Atomic Habits principles
    cue: {
      type: String,
      default: '', // What triggers the habit
    },
    routine: {
      type: String,
      required: true, // The actual habit action
    },
    reward: {
      type: String,
      default: '', // The reward/benefit
    },
    // Repetition tracking
    streak: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    totalCompletions: {
      type: Number,
      default: 0,
    },
    lastCompleted: {
      type: Date,
    },
    // Rest principle
    restDays: {
      type: [Number], // Days of week (0=Sunday, 6=Saturday) for rest
      default: [],
    },
    consecutiveDaysWithoutRest: {
      type: Number,
      default: 0,
    },
    maxConsecutiveDays: {
      type: Number,
      default: 7, // Maximum days before requiring rest
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Motivational thoughts for when user doesn't feel like doing it
    motivationalThoughts: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
habitSchema.index({ clerkUserId: 1, isActive: 1 });
habitSchema.index({ clerkUserId: 1, lastCompleted: -1 });

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;

