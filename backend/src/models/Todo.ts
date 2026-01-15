import { Schema, model } from 'mongoose';

interface ITodo {
  userId: string;
  title: string;
  description: string;
  category: 'repair' | 'project' | 'daily';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      enum: ['repair', 'project', 'daily'],
      default: 'daily',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    dueDate: Date,
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Todo = model<ITodo>('Todo', todoSchema);
