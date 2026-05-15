import api from '../lib/axios';
import { ApiResponse, Preset } from '../types/search.types';

export const presetService = {
  async getPresets() {
    const { data } = await api.get<ApiResponse<Preset[]>>('/api/presets');
    return data;
  },

  async savePreset(name: string, params: any) {
    const { data } = await api.post<ApiResponse<Preset>>('/api/presets', {
      name,
      params,
    });
    return data;
  },

  async deletePreset(name: string) {
    const { data } = await api.delete<ApiResponse<null>>(`/api/presets/${name}`);
    return data;
  },
};
