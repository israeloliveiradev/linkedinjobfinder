import { generateId } from '../utils/generateId.js';
import supabase from '../config/database.js';

export class PresetService {
  constructor(presetRepository) {
    this.presetRepository = presetRepository;
  }

  async getAll(userId) {
    return this.presetRepository.findAll(userId);
  }

  async getByName(name, userId) {
    return this.presetRepository.findByName(name, userId);
  }

  async savePreset(presetData, userId) {
    // 1. Verifica se o usuário é PRO
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    const isPro = sub?.status === 'pro' && (!sub.expires_at || new Date(sub.expires_at) > new Date());

    // 2. Se for Free, limita a 3 presets salvos
    if (!isPro) {
      const existing = await this.presetRepository.findAll(userId);
      const isNew = !existing.some(p => p.name.toLowerCase() === presetData.name.toLowerCase());
      if (isNew && existing.length >= 3) {
        throw new Error('LIMITE_PRESETS:Você atingiu o limite de 3 presets salvos no plano Free. Faça o upgrade para salvar presets ilimitados.');
      }
    }

    const preset = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      user_id: userId,
      ...presetData,
    };
    await this.presetRepository.add(preset);
    return preset;
  }

  async deletePreset(name, userId) {
    await this.presetRepository.deleteByName(name, userId);
  }
}
