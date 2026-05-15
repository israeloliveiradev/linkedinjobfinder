import supabase from '../config/database.js';

export class PresetRepository {
  async findAll() {
    const { data, error } = await supabase
      .from('search_presets')
      .select('*')
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

  async findByName(name) {
    const { data, error } = await supabase
      .from('search_presets')
      .select('*')
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
    const { name, query, params } = preset;
    const { error } = await supabase
      .from('search_presets')
      .upsert({ name, query, params }, { onConflict: 'name' });

    if (error) throw new Error(`PresetRepository.add: ${error.message}`);
  }

  async deleteByName(name) {
    const { error } = await supabase
      .from('search_presets')
      .delete()
      .ilike('name', name);

    if (error) throw new Error(`PresetRepository.deleteByName: ${error.message}`);
  }
}
