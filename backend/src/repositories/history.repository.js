import pool from '../config/database.js';

export class HistoryRepository {
  async findAll() {
    try {
      const result = await pool.query(
        'SELECT * FROM search_history ORDER BY created_at DESC LIMIT 50'
      );
      // Mapear snake_case do Postgres para camelCase do JS para manter compatibilidade com front
      return result.rows.map(row => ({
        id: row.id,
        originalQuery: row.original_query,
        parsedParams: row.parsed_params,
        expandedKeywords: row.expanded_keywords,
        booleanQuery: row.boolean_query,
        urls: row.urls,
        filtersApplied: row.filters_applied,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Erro no HistoryRepository (findAll):', error);
      return [];
    }
  }

  async add(entry) {
    try {
      const { originalQuery, parsedParams, expandedKeywords, booleanQuery, urls, filtersApplied } = entry;
      
      await pool.query(
        `INSERT INTO search_history 
        (original_query, parsed_params, expanded_keywords, boolean_query, urls, filters_applied)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [originalQuery, parsedParams, expandedKeywords, booleanQuery, urls, filtersApplied]
      );
    } catch (error) {
      console.error('❌ Erro no HistoryRepository (add):', error);
    }
  }

  async deleteById(id) {
    try {
      await pool.query('DELETE FROM search_history WHERE id = $1', [id]);
    } catch (error) {
      console.error('❌ Erro no HistoryRepository (deleteById):', error);
    }
  }

  async clear() {
    try {
      await pool.query('DELETE FROM search_history');
    } catch (error) {
      console.error('❌ Erro no HistoryRepository (clear):', error);
    }
  }
}
