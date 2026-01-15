import { db } from '../db/index.js';
import { notes } from '../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { LLMService } from './llmService.js';

// Calculate Cosine Similarity
const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
};

export class NoteService {
    static async getAll(userId: string) {
        const results = db.select().from(notes)
            .where(eq(notes.userId, userId))
            .orderBy(desc(notes.updatedAt))
            .all();

        return results.map(n => ({
            ...n,
            _id: n.id,
            tags: n.tags ? JSON.parse(n.tags) : [],
            versions: n.versions ? JSON.parse(n.versions) : [],
            embedding: undefined, // Don't return full embedding to client
        }));
    }

    static async getById(id: string, userId: string) {
        const note = db.select().from(notes)
            .where(and(eq(notes.id, id), eq(notes.userId, userId)))
            .get();

        if (!note) return null;

        return {
            ...note,
            _id: note.id,
            tags: note.tags ? JSON.parse(note.tags) : [],
            versions: note.versions ? JSON.parse(note.versions) : [],
            embedding: undefined,
        };
    }

    static async create(userId: string, data: { title: string; content: string; type?: string; tags?: string[] }) {
        const id = randomUUID();
        const now = new Date().toISOString();
        const versions = [{ content: data.content, timestamp: now }];

        // Generate embedding asynchronously
        const textToEmbed = `${data.title}\n${data.content}`;
        let embedding: number[] = [];
        try {
            const embeddings = await LLMService.getEmbeddings([textToEmbed]);
            if (embeddings && embeddings.length > 0) {
                embedding = embeddings[0];
            }
        } catch (e) {
            console.error('Failed to generate embedding:', e);
        }

        db.insert(notes).values({
            id,
            userId,
            title: data.title,
            content: data.content,
            type: data.type || 'text',
            tags: JSON.stringify(data.tags || []),
            versions: JSON.stringify(versions),
            embedding: embedding.length > 0 ? JSON.stringify(embedding) : null,
            createdAt: now,
            updatedAt: now,
        }).run();

        const note = db.select().from(notes).where(eq(notes.id, id)).get();

        return {
            ...note,
            _id: id,
            tags: data.tags || [],
            versions,
            embedding: undefined
        };
    }

    static async update(id: string, userId: string, updates: Partial<{ title: string; content: string; type: string; tags: string[] }>) {
        const note = db.select().from(notes)
            .where(and(eq(notes.id, id), eq(notes.userId, userId)))
            .get();

        if (!note) return null;

        const now = new Date().toISOString();
        const updateData: any = { updatedAt: now };

        // Handle versions and content change
        let versions = note.versions ? JSON.parse(note.versions) : [];
        let contentChanged = false;

        if (updates.content && updates.content !== note.content) {
            versions.push({ content: updates.content, timestamp: now });
            updateData.versions = JSON.stringify(versions);
            updateData.content = updates.content;
            contentChanged = true;
        }

        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.type !== undefined) updateData.type = updates.type;
        if (updates.tags !== undefined) updateData.tags = JSON.stringify(updates.tags);

        // Regenerate embedding if title or content changed
        if (contentChanged || (updates.title && updates.title !== note.title)) {
            const newTitle = updates.title || note.title;
            const newContent = updates.content || note.content;
            const textToEmbed = `${newTitle}\n${newContent}`;

            try {
                const embeddings = await LLMService.getEmbeddings([textToEmbed]);
                if (embeddings && embeddings.length > 0) {
                    updateData.embedding = JSON.stringify(embeddings[0]);
                }
            } catch (e) {
                console.error('Failed to update embedding:', e);
            }
        }

        db.update(notes).set(updateData).where(eq(notes.id, id)).run();

        const updated = db.select().from(notes).where(eq(notes.id, id)).get();
        return updated ? {
            ...updated,
            _id: updated.id,
            tags: updated.tags ? JSON.parse(updated.tags) : [],
            versions: updated.versions ? JSON.parse(updated.versions) : [],
            embedding: undefined
        } : null;
    }

    static async delete(id: string, userId: string) {
        const existing = db.select().from(notes)
            .where(and(eq(notes.id, id), eq(notes.userId, userId)))
            .get();

        if (!existing) return false;

        db.delete(notes).where(eq(notes.id, id)).run();
        return true;
    }

    static async getVersions(id: string, userId: string) {
        const note = db.select().from(notes)
            .where(and(eq(notes.id, id), eq(notes.userId, userId)))
            .get();

        return note ? (note.versions ? JSON.parse(note.versions) : []) : null;
    }

    static async search(userId: string, query: string) {
        // 1. Generate query embedding
        const queryEmbeddings = await LLMService.getEmbeddings([query]);
        if (!queryEmbeddings || queryEmbeddings.length === 0) {
            throw new Error('Failed to generate query embedding');
        }
        const queryVec = queryEmbeddings[0];

        // 2. Get all notes with embedding
        const allNotes = db.select().from(notes)
            .where(and(
                eq(notes.userId, userId),
                sql`embedding IS NOT NULL`
            ))
            .all();

        // 3. Calculate cosine similarity
        const candidates = allNotes.map(note => {
            try {
                const embedding = JSON.parse(note.embedding as string);
                return {
                    ...note,
                    similarity: cosineSimilarity(queryVec, embedding)
                };
            } catch (e) {
                return { ...note, similarity: 0 };
            }
        })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 20); // Top 20

        // 4. Rerank
        const documents = candidates.map(note => `${note.title}\n${note.content}`);
        const reranked = await LLMService.rerank(query, documents, 5); // Top 5

        // 5. Format results
        return reranked.map(item => {
            const note = candidates[item.index];
            return {
                id: note.id,
                title: note.title,
                content: note.content,
                type: note.type,
                updatedAt: note.updatedAt,
                score: item.relevance_score
            };
        });
    }
}
