import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true,
    },

    category: {
      type: String,
      enum: [
        'Hotel/Rent',
        'Car/Transport',
        'Food',
        'Tickets',
        'Shopping',
        'Activities',
        'Other',
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * Kept for backward compatibility.
     *
     * We no longer use paidBy because multiple people
     * can pay for the same expense.
     */
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    /*
     * equal:
     *   Expense is equally shared between selected participants.
     *
     * unequal:
     *   Each participant can have a custom share.
     */
    splitType: {
      type: String,
      enum: ['equal', 'unequal'],
      default: 'equal',
    },

    /*
     * IMPORTANT:
     *
     * amountPaid = how much this person actually paid
     *
     * share = how much this person is responsible for
     *
     * Example:
     *
     * Total = 3000
     *
     * A:
     * amountPaid = 1000
     * share      = 500
     *
     * B:
     * amountPaid = 2000
     * share      = 500
     *
     * This allows us to calculate:
     *
     * balance = amountPaid - share
     */
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },

        amountPaid: {
          type: Number,
          default: 0,
          min: 0,
        },

        share: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Avoid model overwrite issues during Next.js development.
export default mongoose.models.Expense ||
  mongoose.model('Expense', ExpenseSchema);