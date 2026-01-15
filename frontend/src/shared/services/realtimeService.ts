import { io, Socket } from 'socket.io-client';

export interface SocketUser {
    userId: string;
    username: string;
    socketId: string;
}

class RealtimeClient {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    connect(serverUrl: string, userId: string, username: string) {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(serverUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('Connected to realtime server');
            // 认证
            this.socket?.emit('auth', { userId, username });
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from realtime server');
        });

        // 事件监听器
        this.socket.on('user-online', (data) => this.emit('user-online', data));
        this.socket.on('user-offline', (data) => this.emit('user-offline', data));
        this.socket.on('todo-created', (data) => this.emit('todo-created', data));
        this.socket.on('todo-updated', (data) => this.emit('todo-updated', data));
        this.socket.on('todo-deleted', (data) => this.emit('todo-deleted', data));
        this.socket.on('expense-updated', (data) => this.emit('expense-updated', data));
        this.socket.on('note-updated', (data) => this.emit('note-updated', data));
        this.socket.on('sync-response', (data) => this.emit('sync-response', data));
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    // 发送事件
    todoCreate(data: any) {
        this.socket?.emit('todo-create', data);
    }

    todoUpdate(data: any) {
        this.socket?.emit('todo-update', data);
    }

    todoDelete(data: any) {
        this.socket?.emit('todo-delete', data);
    }

    expenseUpdate(data: any) {
        this.socket?.emit('expense-update', data);
    }

    noteUpdate(data: any) {
        this.socket?.emit('note-update', data);
    }

    requestSync(type: string) {
        this.socket?.emit('sync-request', { type });
    }

    // 事件订阅/取消订阅
    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    off(event: string, callback: Function) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.delete(callback);
        }
    }

    private emit(event: string, data: any) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for event ${event}:`, error);
                }
            });
        }
    }
}

export const realtimeClient = new RealtimeClient();
