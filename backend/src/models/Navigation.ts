import { Schema, model } from 'mongoose';

interface INavigation {
  userId: string;
  category: string;
  title: string;
  url: string;
  icon: string;
  order: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const navigationSchema = new Schema<INavigation>(
  {
    userId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    icon: String,
    order: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Navigation = model<INavigation>('Navigation', navigationSchema);
