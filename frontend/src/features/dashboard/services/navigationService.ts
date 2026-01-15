import apiClient from '@/shared/services/api';

export interface NavigationItem {
    _id: string;
    category: string;
    title: string;
    url: string;
    icon: string;
    order: number;
    isDefault: boolean;
}

export const navigationService = {
    getAll: () => apiClient.get<NavigationItem[]>('/navigation'),
    create: (data: Omit<NavigationItem, '_id'>) =>
        apiClient.post<NavigationItem>('/navigation', data),
    update: (id: string, data: Partial<NavigationItem>) =>
        apiClient.patch<NavigationItem>(`/navigation/${id}`, data),
    delete: (id: string) => apiClient.delete(`/navigation/${id}`),
    reorder: (items: NavigationItem[]) =>
        apiClient.post('/navigation/reorder', { items }),
};
