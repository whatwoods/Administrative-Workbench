import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// =============================================================================
// 默认用户配置
// =============================================================================
const DEFAULT_USER = {
  email: 'admin@awb.local',
  username: 'Way',
  password: 'awb990714', // 默认密码
};

export class AuthService {
  /**
   * 注册功能已禁用
   */
  static async register(_email: string, _username: string, _password: string) {
    throw new Error('注册功能已禁用，请使用默认账户登录');
  }

  /**
   * 登录 - 支持用户名或邮箱登录
   * 首次启动时自动创建默认用户
   */
  static async login(emailOrUsername: string, password: string) {
    // 支持用户名或邮箱登录
    let user = db.select().from(users)
      .where(or(
        eq(users.email, emailOrUsername),
        eq(users.username, emailOrUsername)
      ))
      .get();

    // 如果没有任何用户，创建默认管理员
    if (!user) {
      const allUsers = db.select().from(users).all();

      if (allUsers.length === 0) {
        // 数据库为空，创建默认用户
        console.log('📌 创建默认管理员账户...');
        await this.createDefaultUser();

        // 重新查询
        user = db.select().from(users)
          .where(or(
            eq(users.email, emailOrUsername),
            eq(users.username, emailOrUsername)
          ))
          .get();
      }
    }

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
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

  /**
   * 创建默认用户
   */
  private static async createDefaultUser() {
    const hashedPassword = await bcrypt.hash(DEFAULT_USER.password, 10);
    const id = randomUUID();
    const now = new Date().toISOString();

    db.insert(users).values({
      id,
      email: DEFAULT_USER.email,
      username: DEFAULT_USER.username,
      password: hashedPassword,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    }).run();

    console.log(`✅ 默认账户已创建: ${DEFAULT_USER.username} / ${DEFAULT_USER.password}`);
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

