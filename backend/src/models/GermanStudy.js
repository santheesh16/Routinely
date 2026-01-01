import mongoose from 'mongoose';

const germanStudySchema = new mongoose.Schema(
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
    vocabularyWords: {
      type: [String],
      default: [],
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
germanStudySchema.index({ clerkUserId: 1, date: -1 });
germanStudySchema.index({ clerkUserId: 1, date: 1 });

const GermanStudy = mongoose.model('GermanStudy', germanStudySchema);

export default GermanStudy;
