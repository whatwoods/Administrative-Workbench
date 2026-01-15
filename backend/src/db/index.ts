import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import fs from 'fs';

// 数据库文件路径
const DB_PATH = process.env.DATABASE_PATH || './data/admin-workbench.db';

// 确保数据目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建 SQLite 连接
const sqliteDb = new Database(DB_PATH);
sqliteDb.pragma('journal_mode = WAL'); // 启用 WAL 模式提升性能

// 创建 Drizzle 实例
export const db = drizzle(sqliteDb, { schema });

// 初始化数据库（创建表）
export const initDB = () => {
  console.log(`SQLite database initialized at ${DB_PATH}`);

  // 创建表
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      preferences_theme TEXT DEFAULT 'light',
      preferences_language TEXT DEFAULT 'zh-CN',
      preferences_notifications INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'daily',
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      due_date TEXT,
      "order" INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      attachments TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      tags TEXT,
      versions TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS navigations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      category TEXT DEFAULT 'other',
      "order" INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
    CREATE INDEX IF NOT EXISTS idx_navigations_user_id ON navigations(user_id);
  `);

  console.log('Database tables created/verified');
};

export { schema };
