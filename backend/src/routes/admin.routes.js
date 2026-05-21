import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import supabase from '../config/database.js';
import { auth } from '../config/auth.js';
import { config as envConfig } from '../config/env.js';

const router = Router();

// Get config (Public read)
router.get('/config', async (req, res) => {
  try {
    const { data, error } = await supabase.from('admin_config').select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    
    let isAdmin = false;
    let llmInfo = null;
    
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session && session.user) {
        const { data: userData } = await supabase
          .from('user')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (userData && userData.role === 'admin') {
          isAdmin = true;
        }
      }
    } catch (e) {
      // Ignora erro de sessão
    }
    
    if (isAdmin) {
      const maskKey = (key) => {
        if (!key) return 'Não configurada (Ausente)';
        if (key.length <= 10) return '*** (Chave Curta)';
        return `${key.slice(0, 6)}...${key.slice(-4)}`;
      };
      
      llmInfo = {
        groqActive: !!envConfig.groqApiKey,
        groqKeyMasked: maskKey(envConfig.groqApiKey),
        groqModel: envConfig.llmModel,
        geminiActive: !!envConfig.geminiApiKey,
        geminiKeyMasked: maskKey(envConfig.geminiApiKey),
        geminiModel: envConfig.geminiModel,
        maxRetries: envConfig.llmMaxRetries,
        retryDelayMs: envConfig.llmRetryBaseDelayMs,
        supabaseUrl: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.slice(0, 15)}...` : 'Ausente',
        nodeEnv: envConfig.nodeEnv,
        port: envConfig.port
      };
    }
    
    res.json({ ...(data || {}), isAdmin, llmInfo });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update config (Admin only)
router.put('/config', requireAdmin, async (req, res) => {
  const { pix_key, qr_code_url, pro_price, pro_price_mensal, pro_price_trimestral, pro_price_semestral, free_limit, free_copilot_limit, whatsapp_number, testimonials } = req.body;
  const { data, error } = await supabase
    .from('admin_config')
    .update({ 
      pix_key, 
      qr_code_url, 
      pro_price, 
      pro_price_mensal, 
      pro_price_trimestral, 
      pro_price_semestral, 
      free_limit, 
      free_copilot_limit,
      whatsapp_number, 
      testimonials,
      updated_at: new Date() 
    })
    .eq('id', 1)
    .select();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// List all users and their subscriptions (Admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('user')
      .select('id, name, email, createdAt')
      .order('createdAt', { ascending: false });
      
    if (usersError) return res.status(500).json({ error: usersError.message });
    
    const { data: subs, error: subsError } = await supabase
      .from('subscriptions')
      .select('*');
      
    if (subsError) return res.status(500).json({ error: subsError.message });
    
    const subMap = new Map(subs.map(s => [s.user_id, s]));
    
    const usersWithPlan = users.map(u => {
      const sub = subMap.get(u.id) || { 
        status: 'free', 
        expires_at: null,
        search_count: 0,
        copilot_count: 0,
        extra_copilot_credits: 0,
        used_express: false,
        used_posts_vaga: false,
        used_posts_hiring: false,
        used_posts_curriculo: false
      };
      return {
        ...u,
        planStatus: sub.status,
        expiresAt: sub.expires_at,
        searchCount: sub.search_count || 0,
        copilotCount: sub.copilot_count || 0,
        extraCopilotCredits: sub.extra_copilot_credits || 0,
        usedExpress: sub.used_express || false,
        usedPostsVaga: sub.used_posts_vaga || false,
        usedPostsHiring: sub.used_posts_hiring || false,
        usedPostsCurriculo: sub.used_posts_curriculo || false
      };
    });
    
    res.json(usersWithPlan);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update user subscription (Admin only)
router.put('/users/:userId/plan', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, expires_at: reqExpiresAt } = req.body;
    
    if (status !== 'free' && status !== 'pro') {
      return res.status(400).json({ error: 'Status de plano inválido' });
    }
    
    let expires_at = null;
    if (status === 'pro') {
      if (reqExpiresAt === 'lifetime' || reqExpiresAt === null) {
        expires_at = null;
      } else if (reqExpiresAt === 'mensal') {
        expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 1 mês (30 dias)
      } else if (reqExpiresAt === 'trimestral') {
        expires_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 3 meses (90 dias)
      } else if (reqExpiresAt === 'semestral') {
        expires_at = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(); // 6 meses
      } else if (reqExpiresAt) {
        expires_at = new Date(reqExpiresAt).toISOString();
      } else {
        // default to lifetime (null)
        expires_at = null;
      }
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({ user_id: userId, status, expires_at })
      .select();
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Grant extra feature permissions to a specific user (Admin only)
router.post('/users/:userId/unlock', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { feature } = req.body; // 'copilot', 'express', 'feed'
    
    // Fetch current user subscription
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (subError && subError.code !== 'PGRST116') {
      return res.status(500).json({ error: subError.message });
    }
    
    const currentSub = sub || { 
      user_id: userId, 
      status: 'free', 
      search_count: 0, 
      copilot_count: 0, 
      extra_copilot_credits: 0,
      extra_express_credits: 0,
      used_express: false, 
      used_posts_vaga: false, 
      used_posts_hiring: false, 
      used_posts_curriculo: false 
    };
    
    let updates = {};
    if (feature === 'copilot') {
      updates = {
        extra_copilot_credits: (currentSub.extra_copilot_credits || 0) + 1,
        copilot_count: Math.max(0, (currentSub.copilot_count || 0) - 1) // Give immediate run credit too
      };
    } else if (feature === 'express') {
      updates = {
        used_express: false
      };
    } else if (feature === 'feed') {
      updates = {
        used_posts_vaga: false,
        used_posts_hiring: false,
        used_posts_curriculo: false
      };
    } else {
      return res.status(400).json({ error: 'Funcionalidade inválida' });
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({ ...currentSub, ...updates, user_id: userId })
      .select();
      
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, message: `Permissão liberada com sucesso!`, data: data[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List latest searches made by users (Admin only)
router.get('/history', requireAdmin, async (req, res) => {
  try {
    const { data: history, error } = await supabase
      .from('search_history')
      .select('id, user_id, original_query, created_at')
      .order('created_at', { ascending: false })
      .limit(30);
      
    if (error) return res.status(500).json({ error: error.message });
    
    // Map to user names if possible
    const { data: users } = await supabase.from('user').select('id, name, email');
    const userMap = new Map(users?.map(u => [u.id, u]) || []);
    
    const historyWithUsers = history.map(h => {
      const user = userMap.get(h.user_id) || { name: 'Anônimo / Visitante', email: '' };
      return {
        ...h,
        userName: user.name,
        userEmail: user.email
      };
    });
    
    res.json(historyWithUsers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
