import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    // How user feels before doing the habit
    moodBefore: {
      type: String,
      enum: ['excited', 'motivated', 'neutral', 'reluctant', 'resistant'],
      default: 'neutral',
    },
    // Reasonable thoughts shown/used
    thoughtsUsed: {
      type: [String],
      default: [],
    },
    // User's reflection after
    reflection: {
      type: String,
      default: '',
    },
    // Time spent (optional)
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
habitLogSchema.index({ clerkUserId: 1, date: -1 });
habitLogSchema.index({ clerkUserId: 1, habitId: 1, date: -1 });

const HabitLog = mongoose.model('HabitLog', habitLogSchema);

export default HabitLog;

