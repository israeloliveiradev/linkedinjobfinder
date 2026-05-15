import api from '../lib/axios';
import { ApiResponse, SearchResult } from '../types/search.types';

export const historyService = {
  async getHistory() {
    const { data } = await api.get<ApiResponse<SearchResult[]>>('/api/history');
    return data;
  },

  async deleteEntry(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/api/history/${id}`);
    return data;
  },

  async clearHistory() {
    const { data } = await api.delete<ApiResponse<null>>('/api/history');
    return data;
  },
};
