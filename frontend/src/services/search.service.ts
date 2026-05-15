import api from '../lib/axios';
import { ApiResponse, SearchResult } from '../types/search.types';

export const searchService = {
  async performSearch(query: string, expandKeywords: boolean = true, manualFilters?: any) {
    const { data } = await api.post<ApiResponse<SearchResult>>('/api/search', {
      query,
      expandKeywords,
      manualFilters,
    });
    return data;
  },

  async expandKeywords(keywords: string) {
    const { data } = await api.get<ApiResponse<any>>(`/api/search/expand-keywords?keywords=${encodeURIComponent(keywords)}`);
    return data;
  },
};
