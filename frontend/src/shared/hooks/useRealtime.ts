import { useEffect, useCallback } from 'react';
import { realtimeClient } from '../services/realtimeService';
import { useAuthStore } from '@/features/auth';

export const useRealtime = () => {
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user) {
            const serverUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
            realtimeClient.connect(serverUrl, (user as any)._id || '', user.username || '');

            return () => {
                // 不立即断开，保持连接直到用户完全退出
                // realtimeClient.disconnect();
            };
        }
    }, [user]);

    const on = useCallback((event: string, callback: Function) => {
        realtimeClient.on(event, callback);
    }, []);

    const off = useCallback((event: string, callback: Function) => {
        realtimeClient.off(event, callback);
    }, []);

    const todoCreate = useCallback((data: any) => {
        realtimeClient.todoCreate(data);
    }, []);

    const todoUpdate = useCallback((data: any) => {
        realtimeClient.todoUpdate(data);
    }, []);

    const todoDelete = useCallback((data: any) => {
        realtimeClient.todoDelete(data);
    }, []);

    const expenseUpdate = useCallback((data: any) => {
        realtimeClient.expenseUpdate(data);
    }, []);

    const noteUpdate = useCallback((data: any) => {
        realtimeClient.noteUpdate(data);
    }, []);

    const requestSync = useCallback((type: string) => {
        realtimeClient.requestSync(type);
    }, []);

    return {
        isConnected: realtimeClient.isConnected(),
        on,
        off,
        todoCreate,
        todoUpdate,
        todoDelete,
        expenseUpdate,
        noteUpdate,
        requestSync,
    };
};
