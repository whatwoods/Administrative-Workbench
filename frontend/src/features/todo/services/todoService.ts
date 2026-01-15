import apiClient from '@/shared/services/api';

export interface Todo {
    _id: string;
    title: string;
    description: string;
    category: 'repair' | 'project' | 'daily';
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'completed';
    dueDate?: string;
    order: number;
}

export const todoService = {
    getAll: () => apiClient.get<Todo[]>('/todos'),
    getById: (id: string) => apiClient.get<Todo>(`/todos/${id}`),
    create: (data: Omit<Todo, '_id'>) => apiClient.post<Todo>('/todos', data),
    update: (id: string, data: Partial<Todo>) =>
        apiClient.patch<Todo>(`/todos/${id}`, data),
    delete: (id: string) => apiClient.delete(`/todos/${id}`),
    reorder: (todos: Todo[]) => apiClient.post('/todos/reorder', { todos }),
};
