import mongoose from 'mongoose';

const gymSessionSchema = new mongoose.Schema(
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
    workoutType: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
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

// Index for efficient queries and streak calculation
gymSessionSchema.index({ clerkUserId: 1, date: -1 });
gymSessionSchema.index({ clerkUserId: 1, date: 1 });

const GymSession = mongoose.model('GymSession', gymSessionSchema);

export default GymSession;
