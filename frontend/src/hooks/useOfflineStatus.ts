import { useEffect, useState } from 'react';
import { offlineService } from '../services/offlineService';

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    // 初始化离线服务
    offlineService.initialize().catch((error) => {
      console.error('Failed to initialize offline service:', error);
    });

    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // 监听在线/离线事件
    window.addEventListener('online', () => {
      setIsOnline(true);
      console.log('Application is online');
    });

    window.addEventListener('offline', () => {
      setIsOnline(false);
      console.log('Application is offline');
    });

    // 定期检查在线状态
    const interval = setInterval(async () => {
      const online = await offlineService.isOnline();
      setIsOnline(online);
    }, 30000); // 每 30 秒检查一次

    // 获取待同步的操作数量
    offlineService.getPendingSync().then((pending) => {
      setPendingSyncCount(pending.length);
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
    };
  }, []);

  return {
    isOnline,
    pendingSyncCount,
    offlineService,
  };
};
