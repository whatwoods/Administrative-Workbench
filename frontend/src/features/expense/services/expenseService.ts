import apiClient from '@/shared/services/api';

export interface Expense {
    _id: string;
    amount: number;
    category: 'office' | 'repair' | 'water' | 'electricity' | 'gas' | 'other';
    description: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    attachments?: string[];
}

export const expenseService = {
    getAll: () => apiClient.get<Expense[]>('/expenses'),
    getStats: () => apiClient.get('/expenses/stats'),
    create: (data: Omit<Expense, '_id'>) =>
        apiClient.post<Expense>('/expenses', data),
    update: (id: string, data: Partial<Expense>) =>
        apiClient.patch<Expense>(`/expenses/${id}`, data),
    delete: (id: string) => apiClient.delete(`/expenses/${id}`),
    bulkImport: (data: Expense[]) =>
        apiClient.post('/expenses/bulk-import', { expenses: data }),
};
