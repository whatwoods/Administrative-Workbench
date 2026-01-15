import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// 导入路由
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import navigationRoutes from './routes/navigationRoutes.js';
// import weatherRoutes from './routes/weatherRoutes.js';
// import aiRoutes from './routes/aiRoutes.js';

// 环境变量配置
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接
connectDB();

// 健康检查
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/navigation', navigationRoutes);
// app.use('/api/weather', weatherRoutes);
// app.use('/api/ai', aiRoutes);

// 错误处理中间件
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
