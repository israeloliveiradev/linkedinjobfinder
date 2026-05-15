import pool from '../config/database.js';

export class PresetRepository {
  async findAll() {
    try {
      const result = await pool.query(
        'SELECT * FROM search_presets ORDER BY name ASC'
      );
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        query: row.query,
        params: row.params,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Erro no PresetRepository (findAll):', error);
      return [];
    }
  }

  async findByName(name) {
    try {
      const result = await pool.query(
        'SELECT * FROM search_presets WHERE LOWER(name) = LOWER($1)',
        [name]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        query: row.query,
        params: row.params,
        createdAt: row.created_at
      };
    } catch (error) {
      console.error('❌ Erro no PresetRepository (findByName):', error);
      return null;
    }
  }

  async add(preset) {
    try {
      const { name, query, params } = preset;
      // Lógica de "UPSERT": Se o nome existir, atualiza. Senão, insere.
      await pool.query(
        `INSERT INTO search_presets (name, query, params)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE SET 
            query = EXCLUDED.query,
            params = EXCLUDED.params`,
        [name, query, params]
      );
    } catch (error) {
      console.error('❌ Erro no PresetRepository (add):', error);
    }
  }

  async deleteByName(name) {
    try {
      await pool.query('DELETE FROM search_presets WHERE LOWER(name) = LOWER($1)', [name]);
    } catch (error) {
      console.error('❌ Erro no PresetRepository (deleteByName):', error);
    }
  }
}
