import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users 表
export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').default('user'),
    preferencesTheme: text('preferences_theme').default('light'),
    preferencesLanguage: text('preferences_language').default('zh-CN'),
    preferencesNotifications: integer('preferences_notifications', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Todos 表
export const todos = sqliteTable('todos', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    category: text('category').default('daily'), // repair, project, daily
    priority: text('priority').default('medium'), // low, medium, high
    status: text('status').default('pending'), // pending, in-progress, completed
    dueDate: text('due_date'),
    order: integer('order').default(0),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Expenses 表
export const expenses = sqliteTable('expenses', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    amount: real('amount').notNull(),
    category: text('category').notNull(), // office, repair, water, electricity, gas, other
    description: text('description'),
    date: text('date').default('CURRENT_TIMESTAMP'),
    status: text('status').default('pending'), // pending, approved, rejected
    attachments: text('attachments'), // JSON string
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Notes 表
export const notes = sqliteTable('notes', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    type: text('type').default('text'), // text, draw
    tags: text('tags'), // JSON string
    versions: text('versions'), // JSON string
    embedding: text('embedding'), // JSON string of vector numbers
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});


// Navigation 表
export const navigations = sqliteTable('navigations', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    url: text('url').notNull(),
    icon: text('icon'),
    category: text('category').default('other'),
    order: integer('order').default(0),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});
