import { Schema, model } from 'mongoose';

interface INote {
  userId: string;
  title: string;
  content: string;
  type: 'text' | 'draw';
  tags: string[];
  versions: Array<{
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'draw'],
      default: 'text',
    },
    tags: [String],
    versions: [
      {
        content: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Note = model<INote>('Note', noteSchema);
