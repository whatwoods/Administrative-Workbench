export interface OfflineData {
  todos: any[];
  expenses: any[];
  notes: any[];
  pendingSync: string[]; // 待同步的操作 ID
}

class OfflineService {
  private dbName = 'awb-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建存储区
        if (!db.objectStoreNames.contains('todos')) {
          db.createObjectStore('todos', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('expenses')) {
          db.createObjectStore('expenses', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('pending')) {
          db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async saveTodos(todos: any[]) {
    if (!this.db) return;

    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction('todos', 'readwrite');
      const store = tx.objectStore('todos');

      // 清除旧数据
      store.clear();

      // 保存新数据
      todos.forEach((todo) => {
        store.add(todo);
      });

      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
    });
  }

  async getTodos(): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('todos', 'readonly');
      const store = tx.objectStore('todos');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveExpenses(expenses: any[]) {
    if (!this.db) return;

    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction('expenses', 'readwrite');
      const store = tx.objectStore('expenses');

      store.clear();
      expenses.forEach((expense) => {
        store.add(expense);
      });

      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
    });
  }

  async getExpenses(): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('expenses', 'readonly');
      const store = tx.objectStore('expenses');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveNotes(notes: any[]) {
    if (!this.db) return;

    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction('notes', 'readwrite');
      const store = tx.objectStore('notes');

      store.clear();
      notes.forEach((note) => {
        store.add(note);
      });

      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
    });
  }

  async getNotes(): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('notes', 'readonly');
      const store = tx.objectStore('notes');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addPendingSync(operation: {
    type: 'create' | 'update' | 'delete';
    resource: 'todo' | 'expense' | 'note';
    data: any;
  }) {
    if (!this.db) return;

    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction('pending', 'readwrite');
      const store = tx.objectStore('pending');

      store.add({
        ...operation,
        timestamp: new Date().toISOString(),
      });

      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
    });
  }

  async getPendingSync(): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pending', 'readonly');
      const store = tx.objectStore('pending');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clearPendingSync() {
    if (!this.db) return;

    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction('pending', 'readwrite');
      const store = tx.objectStore('pending');

      store.clear();

      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
    });
  }

  async isOnline(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async requestSync(tag: string) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(tag);
      } catch (error) {
        console.error('Failed to register sync:', error);
      }
    }
  }
}

export const offlineService = new OfflineService();
