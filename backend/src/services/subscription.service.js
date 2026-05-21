import supabase from '../config/database.js';

export class SubscriptionService {
  async checkAndIncrementUsage(userId) {
    // Busca usuário e configuração
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Se o usuário não tiver registro, cria um Free com 0 buscas
    let currentStatus = sub ? sub.status : 'free';
    let currentCount = sub ? sub.search_count : 0;
    const now = new Date();

    let wasCreated = false;
    if (!sub) {
      await supabase.from('subscriptions').insert({ 
        user_id: userId, 
        status: 'free', 
        search_count: 1, // Inicia direto com 1 uso (evita escrita dupla)
        reset_date: now.toISOString()
      });
      wasCreated = true;
    }

    // 1. Verifica expiração do plano PRO
    if (sub && sub.status === 'pro' && sub.expires_at && new Date(sub.expires_at) < now) {
      currentStatus = 'free';
      await supabase
        .from('subscriptions')
        .update({ status: 'free', expires_at: null })
        .eq('user_id', userId);
    }

    // 2. Reseta o contador caso já tenham se passado 30 dias desde o reset_date
    let resetDate = sub?.reset_date ? new Date(sub.reset_date) : now;
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (resetDate < thirtyDaysAgo) {
      currentCount = 0;
      await supabase
        .from('subscriptions')
        .update({ search_count: 0, reset_date: now.toISOString() })
        .eq('user_id', userId);
    }

    // Busca limite free
    const { data: config } = await supabase.from('admin_config').select('free_limit').single();
    const freeLimit = config?.free_limit || 5;

    // 3. Bloqueia se atingiu limite no plano Free
    if (currentStatus === 'free' && currentCount >= freeLimit) {
      throw new Error(`LIMITE_ATINGIDO:Você atingiu o limite de ${freeLimit} buscas do plano Free. Faça o upgrade para continuar.`);
    }

    // Incrementa apenas se já existia (evitando escrita dupla no primeiro uso)
    if (!wasCreated) {
      await supabase
        .from('subscriptions')
        .update({ search_count: currentCount + 1 })
        .eq('user_id', userId);
    }

    return true;
  }
}
