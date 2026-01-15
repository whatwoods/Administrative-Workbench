import { db } from '../db/index.js';
import { expenses } from '../db/schema.js';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export class ExpenseService {
    static async getAll(userId: string, filters: {
        category?: string;
        status?: string;
        startDate?: string;
        endDate?: string
    }) {
        let results = db.select().from(expenses)
            .where(eq(expenses.userId, userId))
            .orderBy(desc(expenses.date))
            .all();

        // In-memory filtering matches original logic
        if (filters.category) results = results.filter(e => e.category === filters.category);
        if (filters.status) results = results.filter(e => e.status === filters.status);
        if (filters.startDate) results = results.filter(e => e.date && e.date >= filters.startDate!);
        if (filters.endDate) results = results.filter(e => e.date && e.date <= filters.endDate!);

        return results.map(e => ({ ...e, _id: e.id }));
    }

    static async getStats(userId: string) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const allExpenses = db.select().from(expenses)
            .where(and(
                eq(expenses.userId, userId),
                gte(expenses.date, startOfMonth)
            ))
            .all();

        // Calculate category stats
        const categoryMap = new Map<string, { total: number; count: number }>();
        let monthlyTotal = 0;

        allExpenses.forEach(exp => {
            monthlyTotal += exp.amount;
            const existing = categoryMap.get(exp.category) || { total: 0, count: 0 };
            existing.total += exp.amount;
            existing.count += 1;
            categoryMap.set(exp.category, existing);
        });

        const categoryStats = Array.from(categoryMap.entries()).map(([cat, stats]) => ({
            _id: cat,
            ...stats,
        }));

        return { categoryStats, monthlyTotal };
    }

    static async create(userId: string, data: {
        amount: number;
        category: string;
        description?: string;
        date?: string;
    }) {
        const id = randomUUID();
        const now = new Date().toISOString();

        const newExpense = {
            id,
            userId,
            amount: data.amount,
            category: data.category,
            description: data.description || '',
            date: data.date || now,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        };

        db.insert(expenses).values(newExpense).run();

        return { ...newExpense, _id: id };
    }

    static async update(id: string, userId: string, updates: Partial<{
        amount: number;
        category: string;
        description: string;
        date: string;
        status: string;
    }>) {
        const existing = db.select().from(expenses)
            .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
            .get();

        if (!existing) return null;

        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        db.update(expenses).set(updateData).where(eq(expenses.id, id)).run();

        const updatedExpense = db.select().from(expenses).where(eq(expenses.id, id)).get();
        return updatedExpense ? { ...updatedExpense, _id: updatedExpense.id } : null;
    }

    static async delete(id: string, userId: string) {
        const existing = db.select().from(expenses)
            .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
            .get();

        if (!existing) return false;

        db.delete(expenses).where(eq(expenses.id, id)).run();
        return true;
    }

    static async bulkImport(userId: string, expenseItems: any[]) {
        const now = new Date().toISOString();
        const created: any[] = [];

        db.transaction(() => {
            expenseItems.forEach((exp: any) => {
                const id = randomUUID();
                const newExpense = {
                    id,
                    userId,
                    amount: exp.amount,
                    category: exp.category,
                    description: exp.description || '',
                    date: exp.date || now,
                    status: exp.status || 'pending',
                    createdAt: now,
                    updatedAt: now,
                };
                db.insert(expenses).values(newExpense).run();
                created.push({ ...exp, id, _id: id });
            });
        });

        return { count: created.length, expenses: created };
    }
}
