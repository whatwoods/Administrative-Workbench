import { useEffect } from 'react';
import { offlineService } from '../services/offlineService';
import { todoService } from '../services/todoService';
import { expenseService } from '../services/expenseService';
import { noteService } from '../services/noteService';

export const useSyncOfflineData = () => {
  useEffect(() => {
    const syncOfflineData = async () => {
      const isOnline = await offlineService.isOnline();
      if (!isOnline) return;

      try {
        // 获取待同步的操作
        const pendingOperations = await offlineService.getPendingSync();

        for (const operation of pendingOperations) {
          try {
            if (operation.resource === 'todo') {
              if (operation.type === 'create') {
                await todoService.create(operation.data);
              } else if (operation.type === 'update') {
                await todoService.update(operation.data._id, operation.data);
              } else if (operation.type === 'delete') {
                await todoService.delete(operation.data._id);
              }
            } else if (operation.resource === 'expense') {
              if (operation.type === 'create') {
                await expenseService.create(operation.data);
              } else if (operation.type === 'update') {
                await expenseService.update(operation.data._id, operation.data);
              } else if (operation.type === 'delete') {
                await expenseService.delete(operation.data._id);
              }
            } else if (operation.resource === 'note') {
              if (operation.type === 'create') {
                await noteService.create(operation.data);
              } else if (operation.type === 'update') {
                await noteService.update(operation.data._id, operation.data);
              } else if (operation.type === 'delete') {
                await noteService.delete(operation.data._id);
              }
            }
          } catch (error) {
            console.error(`Failed to sync ${operation.resource}:`, error);
          }
        }

        // 清除待同步的操作
        if (pendingOperations.length > 0) {
          await offlineService.clearPendingSync();
        }
      } catch (error) {
        console.error('Failed to sync offline data:', error);
      }
    };

    // 检查在线状态变化时同步
    window.addEventListener('online', syncOfflineData);

    // 定期检查是否可以同步
    const interval = setInterval(syncOfflineData, 60000); // 每分钟检查一次

    return () => {
      window.removeEventListener('online', syncOfflineData);
      clearInterval(interval);
    };
  }, []);
};
