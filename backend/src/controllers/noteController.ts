import { Response } from 'express';
import { db } from '../db/index.js';
import { notes } from '../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
import { LLMService } from '../services/llmService.js';

// 计算余弦相似度
const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

export class NoteController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const results = db.select().from(notes)
        .where(eq(notes.userId, req.user.userId))
        .orderBy(desc(notes.updatedAt))
        .all();

      // 解析 JSON 字段
      const parsed = results.map(n => ({
        ...n,
        _id: n.id,
        tags: n.tags ? JSON.parse(n.tags) : [],
        versions: n.versions ? JSON.parse(n.versions) : [],
        // 不返回 embedding 以减少传输大小
        embedding: undefined,
      }));

      res.json({ success: true, data: parsed });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = db.select().from(notes)
        .where(and(eq(notes.id, req.params.id), eq(notes.userId, req.user.userId)))
        .get();

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      res.json({
        success: true,
        data: {
          ...note,
          _id: note.id,
          tags: note.tags ? JSON.parse(note.tags) : [],
          versions: note.versions ? JSON.parse(note.versions) : [],
          embedding: undefined,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { title, content, type, tags } = req.body;

      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required' });
      }

      const id = randomUUID();
      const now = new Date().toISOString();
      const versions = [{ content, timestamp: now }];

      // 生成向量embedding (异步生成，不阻塞响应)
      const textToEmbed = `${title}\n${content}`;
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
        userId: req.user.userId,
        title,
        content,
        type: type || 'text',
        tags: JSON.stringify(tags || []),
        versions: JSON.stringify(versions),
        embedding: embedding.length > 0 ? JSON.stringify(embedding) : null,
        createdAt: now,
        updatedAt: now,
      }).run();

      const note = db.select().from(notes).where(eq(notes.id, id)).get();

      res.status(201).json({
        success: true,
        data: {
          ...note,
          _id: id,
          tags: tags || [],
          versions,
          embedding: undefined
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = db.select().from(notes)
        .where(and(eq(notes.id, req.params.id), eq(notes.userId, req.user.userId)))
        .get();

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      const now = new Date().toISOString();
      const updates: any = { updatedAt: now };

      // 解析现有 versions
      let versions = note.versions ? JSON.parse(note.versions) : [];
      let contentChanged = false;

      // 如果 content 改变了，添加版本
      if (req.body.content && req.body.content !== note.content) {
        versions.push({ content: req.body.content, timestamp: now });
        updates.versions = JSON.stringify(versions);
        updates.content = req.body.content;
        contentChanged = true;
      }

      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.type !== undefined) updates.type = req.body.type;
      if (req.body.tags !== undefined) updates.tags = JSON.stringify(req.body.tags);

      // 如果标题或内容改变，重新生成 embedding
      if (contentChanged || (req.body.title && req.body.title !== note.title)) {
        const newTitle = req.body.title || note.title;
        const newContent = req.body.content || note.content;
        const textToEmbed = `${newTitle}\n${newContent}`;

        try {
          const embeddings = await LLMService.getEmbeddings([textToEmbed]);
          if (embeddings && embeddings.length > 0) {
            updates.embedding = JSON.stringify(embeddings[0]);
          }
        } catch (e) {
          console.error('Failed to update embedding:', e);
        }
      }

      db.update(notes).set(updates).where(eq(notes.id, req.params.id)).run();

      const updated = db.select().from(notes).where(eq(notes.id, req.params.id)).get();

      res.json({
        success: true,
        data: {
          ...updated,
          _id: updated?.id,
          tags: updated?.tags ? JSON.parse(updated.tags) : [],
          versions: updated?.versions ? JSON.parse(updated.versions) : [],
          embedding: undefined
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = db.select().from(notes)
        .where(and(eq(notes.id, req.params.id), eq(notes.userId, req.user.userId)))
        .get();

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      db.delete(notes).where(eq(notes.id, req.params.id)).run();

      res.json({ success: true, message: 'Note deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getVersions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = db.select().from(notes)
        .where(and(eq(notes.id, req.params.id), eq(notes.userId, req.user.userId)))
        .get();

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      res.json({
        success: true,
        data: note.versions ? JSON.parse(note.versions) : [],
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 语义搜索
  static async search(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, message: 'Query string is required' });
      }

      // 1. 生成查询向量
      const queryEmbeddings = await LLMService.getEmbeddings([query]);
      if (!queryEmbeddings || queryEmbeddings.length === 0) {
        return res.status(500).json({ success: false, message: 'Failed to generate query embedding' });
      }
      const queryVec = queryEmbeddings[0];

      // 2. 获取所有笔记 (包含 embedding)
      const allNotes = db.select().from(notes)
        .where(and(
          eq(notes.userId, req.user.userId),
          sql`embedding IS NOT NULL`
        ))
        .all();

      // 3. 内存计算余弦相似度
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
        .slice(0, 20); // 初筛前 20 个

      // 4. Rerank (重排序)
      const documents = candidates.map(note => `${note.title}\n${note.content}`);
      const reranked = await LLMService.rerank(query, documents, 5); // 取前 5 个最相关的

      // 5. 组合最终结果
      const results = reranked.map(item => {
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

      res.json({ success: true, data: results });

    } catch (error: any) {
      console.error('Semantic search error:', error);
      res.status(500).json({ success: false, message: error.message || 'Search failed' });
    }
  }
}
