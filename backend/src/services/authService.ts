import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export class AuthService {
  static async register(email: string, username: string, password: string) {
    // 检查用户是否存在
    const existingUser = db.select().from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .get();

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = randomUUID();
    const now = new Date().toISOString();

    // 创建用户
    db.insert(users).values({
      id,
      email,
      username,
      password: hashedPassword,
      role: 'user',
      createdAt: now,
      updatedAt: now,
    }).run();

    const token = this.generateToken(id, email);

    return {
      user: {
        id,
        email,
        username,
      },
      token,
    };
  }

  static async login(email: string, password: string) {
    // 查找用户
    const user = db.select().from(users)
      .where(eq(users.email, email))
      .get();

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    };
  }

  static async findById(userId: string) {
    return db.select().from(users)
      .where(eq(users.id, userId))
      .get();
  }

  static generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
    );
  }
}
