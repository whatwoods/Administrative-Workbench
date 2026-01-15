import { db } from '../db/index.js';
import { todos } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export class TodoService {
    static async getAll(userId: string, filters?: { category?: string; priority?: string; status?: string }) {
        let query = db.select().from(todos)
            .where(eq(todos.userId, userId))
            .orderBy(todos.order);

        const results = query.all();

        // In-memory filtering (since strict typing with dynamic where clauses can be complex in Drizzle, 
        // and this matches the original controller logic)
        // Optimization: Could move to SQL query if performance needed later
        let filtered = results;
        if (filters) {
            if (filters.category) filtered = filtered.filter(t => t.category === filters.category);
            if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority);
            if (filters.status) filtered = filtered.filter(t => t.status === filters.status);
        }

        return filtered;
    }

    static async getById(id: string, userId: string) {
        const todo = db.select().from(todos)
            .where(and(eq(todos.id, id), eq(todos.userId, userId)))
            .get();

        return todo ? { ...todo, _id: todo.id } : null;
    }

    static async create(userId: string, data: {
        title: string;
        description?: string;
        category?: string;
        priority?: string;
        dueDate?: string
    }) {
        // Get max order
        const maxOrderResult = db.select({ order: todos.order }).from(todos)
            .where(eq(todos.userId, userId))
            .orderBy(desc(todos.order))
            .limit(1)
            .get();

        const id = randomUUID();
        const now = new Date().toISOString();

        const newTodo = {
            id,
            userId,
            title: data.title,
            description: data.description || '',
            category: data.category || 'daily',
            priority: data.priority || 'medium',
            dueDate: data.dueDate || null,
            order: (maxOrderResult?.order || 0) + 1,
            createdAt: now,
            updatedAt: now,
            status: 'pending', // Default status
        };

        db.insert(todos).values(newTodo).run();

        return { ...newTodo, _id: id };
    }

    static async update(id: string, userId: string, updates: Partial<{
        title: string;
        description: string;
        category: string;
        priority: string;
        status: string;
        dueDate: string;
        order: number;
    }>) {
        const existing = db.select().from(todos)
            .where(and(eq(todos.id, id), eq(todos.userId, userId)))
            .get();

        if (!existing) return null;

        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        db.update(todos).set(updateData).where(eq(todos.id, id)).run();

        const updatedTodo = db.select().from(todos).where(eq(todos.id, id)).get();
        return updatedTodo ? { ...updatedTodo, _id: updatedTodo.id } : null;
    }

    static async delete(id: string, userId: string) {
        const existing = db.select().from(todos)
            .where(and(eq(todos.id, id), eq(todos.userId, userId)))
            .get();

        if (!existing) return false;

        db.delete(todos).where(eq(todos.id, id)).run();
        return true;
    }

    static async reorder(userId: string, todoItems: Array<{ id: string } | { _id: string }>) {
        db.transaction(() => {
            todoItems.forEach((todo: any, index: number) => {
                const id = todo._id || todo.id;
                if (id) {
                    db.update(todos)
                        .set({ order: index })
                        .where(and(eq(todos.id, id), eq(todos.userId, userId)))
                        .run();
                }
            });
        });
        return true;
    }
}
