import supabase from '../config/database.js';

export class PresetRepository {
  async findAll(userId) {
    const { data, error } = await supabase
      .from('search_presets')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw new Error(`PresetRepository.findAll: ${error.message}`);

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      query: row.query,
      params: row.params,
      createdAt: row.created_at
    }));
  }

  async findByName(name, userId) {
    const { data, error } = await supabase
      .from('search_presets')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', name)
      .maybeSingle();

    if (error) throw new Error(`PresetRepository.findByName: ${error.message}`);
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      query: data.query,
      params: data.params,
      createdAt: data.created_at
    };
  }

  async add(preset) {
    const { name, query, params, user_id } = preset;
    const { error } = await supabase
      .from('search_presets')
      .upsert({ name, query, params, user_id }, { onConflict: 'user_id, name' });

    if (error) throw new Error(`PresetRepository.add: ${error.message}`);
  }

  async deleteByName(name, userId) {
    const { error } = await supabase
      .from('search_presets')
      .delete()
      .eq('user_id', userId)
      .ilike('name', name);

    if (error) throw new Error(`PresetRepository.deleteByName: ${error.message}`);
  }
}
