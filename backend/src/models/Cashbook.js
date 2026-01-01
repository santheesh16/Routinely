import mongoose from 'mongoose';

const cashbookSchema = new mongoose.Schema(
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
    color: {
      type: String,
      default: '#3b82f6', // Default blue color
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
cashbookSchema.index({ clerkUserId: 1, createdAt: -1 });

const Cashbook = mongoose.model('Cashbook', cashbookSchema);

export default Cashbook;

