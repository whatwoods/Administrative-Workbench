import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export class AuthService {
  static async register(email: string, username: string, password: string) {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    const token = this.generateToken(user._id as string, user.email);

    return {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      token,
    };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user._id as string, user.email);

    return {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      token,
    };
  }

  static generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }
}
