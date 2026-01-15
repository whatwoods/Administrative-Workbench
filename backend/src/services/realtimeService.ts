import { Server } from 'socket.io';
import http from 'http';

export interface SocketUser {
  userId: string;
  username: string;
  socketId: string;
}

export class RealtimeService {
  private io: Server;
  private activeUsers: Map<string, SocketUser> = new Map();

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // 用户认证
      socket.on('auth', (data: { userId: string; username: string }) => {
        const user: SocketUser = {
          userId: data.userId,
          username: data.username,
          socketId: socket.id,
        };
        this.activeUsers.set(data.userId, user);
        
        // 广播用户上线
        this.io.emit('user-online', {
          userId: data.userId,
          username: data.username,
          activeUsers: Array.from(this.activeUsers.values()),
        });

        console.log(`User authenticated: ${data.username} (${data.userId})`);
      });

      // Todo 更新
      socket.on('todo-update', (data: any) => {
        this.io.emit('todo-updated', {
          ...data,
          timestamp: new Date().toISOString(),
        });
      });

      // Todo 创建
      socket.on('todo-create', (data: any) => {
        this.io.emit('todo-created', {
          ...data,
          timestamp: new Date().toISOString(),
        });
      });

      // Todo 删除
      socket.on('todo-delete', (data: any) => {
        this.io.emit('todo-deleted', data);
      });

      // Expense 更新
      socket.on('expense-update', (data: any) => {
        this.io.emit('expense-updated', {
          ...data,
          timestamp: new Date().toISOString(),
        });
      });

      // Note 更新
      socket.on('note-update', (data: any) => {
        this.io.emit('note-updated', {
          ...data,
          timestamp: new Date().toISOString(),
        });
      });

      // 数据同步请求
      socket.on('sync-request', (data: { type: string }) => {
        socket.emit('sync-response', {
          type: data.type,
          timestamp: new Date().toISOString(),
          message: '数据已同步',
        });
      });

      // 断开连接
      socket.on('disconnect', () => {
        // 移除用户
        let disconnectedUser: SocketUser | undefined;
        for (const [userId, user] of this.activeUsers.entries()) {
          if (user.socketId === socket.id) {
            disconnectedUser = user;
            this.activeUsers.delete(userId);
            break;
          }
        }

        if (disconnectedUser) {
          // 广播用户离线
          this.io.emit('user-offline', {
            userId: disconnectedUser.userId,
            username: disconnectedUser.username,
            activeUsers: Array.from(this.activeUsers.values()),
          });
          console.log(`User offline: ${disconnectedUser.username}`);
        }

        console.log(`Client disconnected: ${socket.id}`);
      });

      // 错误处理
      socket.on('error', (error) => {
        console.error(`Socket error: ${error}`);
      });
    });
  }

  public getIO() {
    return this.io;
  }

  public getActiveUsers() {
    return Array.from(this.activeUsers.values());
  }

  public getUserCount() {
    return this.activeUsers.size;
  }

  public broadcastTodoUpdate(data: any) {
    this.io.emit('todo-updated', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastExpenseUpdate(data: any) {
    this.io.emit('expense-updated', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastNoteUpdate(data: any) {
    this.io.emit('note-updated', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}
