import { db } from '../db/index.js';
import { navigations } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export class NavigationService {
    static async getAll(userId: string) {
        const results = db.select().from(navigations)
            .where(eq(navigations.userId, userId))
            .orderBy(navigations.category, navigations.order)
            .all();

        return results.map(n => ({ ...n, _id: n.id }));
    }

    static async create(userId: string, data: { category: string; name: string; url: string; icon?: string }) {
        // Get max order
        const maxOrderResult = db.select({ order: navigations.order }).from(navigations)
            .where(and(eq(navigations.userId, userId), eq(navigations.category, data.category)))
            .orderBy(desc(navigations.order))
            .limit(1)
            .get();

        const id = randomUUID();
        const now = new Date().toISOString();

        const newNav = {
            id,
            userId,
            category: data.category,
            name: data.name,
            url: data.url,
            icon: data.icon || '',
            order: (maxOrderResult?.order || 0) + 1,
            createdAt: now,
            updatedAt: now,
        };

        db.insert(navigations).values(newNav).run();

        return { ...newNav, _id: id };
    }

    static async update(id: string, userId: string, updates: Partial<{
        name: string;
        url: string;
        icon: string;
        category: string;
        order: number;
    }>) {
        const existing = db.select().from(navigations)
            .where(and(eq(navigations.id, id), eq(navigations.userId, userId)))
            .get();

        if (!existing) return null;

        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };

        db.update(navigations).set(updateData).where(eq(navigations.id, id)).run();

        const updated = db.select().from(navigations).where(eq(navigations.id, id)).get();
        return updated ? { ...updated, _id: updated.id } : null;
    }

    static async delete(id: string, userId: string) {
        const existing = db.select().from(navigations)
            .where(and(eq(navigations.id, id), eq(navigations.userId, userId)))
            .get();

        if (!existing) return false;

        db.delete(navigations).where(eq(navigations.id, id)).run();
        return true;
    }

    static async reorder(userId: string, items: any[]) {
        db.transaction(() => {
            items.forEach((item: any, index: number) => {
                const id = item._id || item.id;
                if (id) {
                    db.update(navigations).set({ order: index }).where(
                        and(eq(navigations.id, id), eq(navigations.userId, userId))
                    ).run();
                }
            });
        });
        return true;
    }
}
