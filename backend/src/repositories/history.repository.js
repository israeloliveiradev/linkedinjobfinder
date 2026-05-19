import supabase from '../config/database.js';

export class HistoryRepository {
  async findAll(userId) {
    // 1. Verifica se o usuário é PRO
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    const isPro = sub?.status === 'pro' && (!sub.expires_at || new Date(sub.expires_at) > new Date());

    // 2. Constrói query
    let queryBuilder = supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Se não for PRO, limita o histórico a 7 dias
    if (!isPro) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      queryBuilder = queryBuilder.gte('created_at', sevenDaysAgo);
    }

    const { data, error } = await queryBuilder;

    if (error) throw new Error(`HistoryRepository.findAll: ${error.message}`);

    return (data || []).map(row => {
      const urls = row.urls || {};
      
      // Se não for PRO, filtra as URLs de acordo com os recursos já utilizados globalmente
      const filteredUrls = isPro ? urls : {
        ...urls,
        express: sub?.used_express ? null : urls.express,
        postsVaga: sub?.used_posts_vaga ? null : urls.postsVaga,
        postsHiring: sub?.used_posts_hiring ? null : urls.postsHiring,
        postsCurriculo: sub?.used_posts_curriculo ? null : urls.postsCurriculo
      };

      return {
        id: row.id,
        originalQuery: row.original_query,
        parsedParams: row.parsed_params,
        expandedKeywords: row.expanded_keywords,
        booleanQuery: row.boolean_query,
        urls: filteredUrls,
        filtersApplied: row.filters_applied,
        createdAt: row.created_at
      };
    });
  }

  async add(entry) {
    const { error } = await supabase
      .from('search_history')
      .insert({
        user_id: entry.user_id,
        original_query: entry.originalQuery,
        parsed_params: entry.parsedParams,
        expanded_keywords: entry.expandedKeywords,
        boolean_query: entry.booleanQuery,
        urls: entry.urls,
        filters_applied: entry.filtersApplied
      });

    if (error) throw new Error(`HistoryRepository.add: ${error.message}`);
  }

  async deleteById(id, userId) {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`HistoryRepository.deleteById: ${error.message}`);
  }

  async clear(userId) {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(`HistoryRepository.clear: ${error.message}`);
  }
}
