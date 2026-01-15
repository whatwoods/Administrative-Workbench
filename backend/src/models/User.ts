import { Schema, model } from 'mongoose';

interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    preferences: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'zh-CN' },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
