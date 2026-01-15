import apiClient from './api';

export interface Note {
  _id: string;
  title: string;
  content: string;
  type: 'text' | 'draw';
  tags: string[];
  versions: Array<{
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const noteService = {
  getAll: () => apiClient.get<Note[]>('/notes'),
  getById: (id: string) => apiClient.get<Note>(`/notes/${id}`),
  getVersions: (id: string) =>
    apiClient.get(`/notes/${id}/versions`),
  create: (data: Omit<Note, '_id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Note>('/notes', data),
  update: (id: string, data: Partial<Note>) =>
    apiClient.patch<Note>(`/notes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/notes/${id}`),
};
