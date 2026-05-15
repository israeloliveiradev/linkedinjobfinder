import supabase from '../config/database.js';

export class HistoryRepository {
  async findAll() {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(`HistoryRepository.findAll: ${error.message}`);

    return (data || []).map(row => ({
      id: row.id,
      originalQuery: row.original_query,
      parsedParams: row.parsed_params,
      expandedKeywords: row.expanded_keywords,
      booleanQuery: row.boolean_query,
      urls: row.urls,
      filtersApplied: row.filters_applied,
      createdAt: row.created_at
    }));
  }

  async add(entry) {
    const { error } = await supabase
      .from('search_history')
      .insert({
        original_query: entry.originalQuery,
        parsed_params: entry.parsedParams,
        expanded_keywords: entry.expandedKeywords,
        boolean_query: entry.booleanQuery,
        urls: entry.urls,
        filters_applied: entry.filtersApplied
      });

    if (error) throw new Error(`HistoryRepository.add: ${error.message}`);
  }

  async deleteById(id) {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`HistoryRepository.deleteById: ${error.message}`);
  }

  async clear() {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .gte('created_at', '1900-01-01');

    if (error) throw new Error(`HistoryRepository.clear: ${error.message}`);
  }
}
