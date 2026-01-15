import { Schema, model } from 'mongoose';

interface IExpense {
  userId: string;
  amount: number;
  category: 'office' | 'repair' | 'water' | 'electricity' | 'gas' | 'other';
  description: string;
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['office', 'repair', 'water', 'electricity', 'gas', 'other'],
      required: true,
    },
    description: String,
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    attachments: [String],
  },
  { timestamps: true }
);

export const Expense = model<IExpense>('Expense', expenseSchema);
