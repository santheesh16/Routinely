import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
budgetSchema.index({ clerkUserId: 1, year: 1, month: 1 });
budgetSchema.index({ clerkUserId: 1, date: -1 });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
