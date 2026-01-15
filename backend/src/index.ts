import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { initDB } from './db/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { RealtimeService } from './services/realtimeService.js';

// 导入路由
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import navigationRoutes from './routes/navigationRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// 环境变量配置
dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const realtimeService = new RealtimeService(server);

const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化 SQLite 数据库
initDB();

// 健康检查
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date(), database: 'sqlite' });
});

// WebSocket 状态检查
app.get('/api/realtime/status', (req: Request, res: Response) => {
  res.json({
    connected: true,
    activeUsers: realtimeService.getActiveUsers(),
    userCount: realtimeService.getUserCount(),
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);

// 错误处理中间件
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server initialized`);
  console.log(`Database: SQLite`);
});

export default app;
