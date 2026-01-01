import mongoose from 'mongoose';

const cashbookTransactionSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    cashbookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cashbook',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Other',
    },
    paymentMode: {
      type: String,
      default: 'Cash',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
cashbookTransactionSchema.index({ clerkUserId: 1, cashbookId: 1, date: -1 });
cashbookTransactionSchema.index({ cashbookId: 1, date: -1 });

const CashbookTransaction = mongoose.model('CashbookTransaction', cashbookTransactionSchema);

export default CashbookTransaction;

