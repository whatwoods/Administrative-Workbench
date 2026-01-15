const CACHE_NAME = 'awb-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/App.css',
  '/styles/index.css',
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 忽略非 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // 忽略 API 请求（实时数据），仅在在线时使用
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // 离线时返回缓存的数据或错误响应
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // 对于其他请求，优先使用缓存，缓存中没有则从网络获取
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        // 如果是成功的响应，缓存它
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-todos') {
    event.waitUntil(syncTodos());
  } else if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses());
  } else if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

async function syncTodos() {
  try {
    const response = await fetch('/api/todos');
    if (response.ok) {
      console.log('Service Worker: Synced todos');
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync todos', error);
  }
}

async function syncExpenses() {
  try {
    const response = await fetch('/api/expenses');
    if (response.ok) {
      console.log('Service Worker: Synced expenses');
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync expenses', error);
  }
}

async function syncNotes() {
  try {
    const response = await fetch('/api/notes');
    if (response.ok) {
      console.log('Service Worker: Synced notes');
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync notes', error);
  }
}

// 推送通知处理
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body || '您有一个新的通知',
    icon: '/icon.png',
    badge: '/badge.png',
    tag: data.tag || 'notification',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Administrative Workbench', options)
  );
});

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
