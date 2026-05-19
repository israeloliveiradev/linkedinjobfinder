import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import supabase from '../config/database.js';

const router = Router();

router.use(requireAuth);

// GET /api/resumes -> List saved resumes
router.get('/', async (req, res, next) => {
  try {
    const { data: resumes, error } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.status(200).json({ success: true, data: resumes });
  } catch (err) {
    next(err);
  }
});

// POST /api/resumes -> Add a new resume (PRO only)
router.post('/', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'O conteúdo do currículo é obrigatório.' });
    }
    
    // Check if user is PRO
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
      
    const isPro = sub && sub.status === 'pro' && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    
    if (!isPro) {
      return res.status(403).json({ error: 'Apenas assinantes do plano PRO podem salvar currículos na biblioteca na nuvem.' });
    }
    
    const resumeTitle = title?.trim() || `Currículo ${new Date().toLocaleDateString()}`;
    
    const { data: resume, error } = await supabase
      .from('user_resumes')
      .insert({
        user_id: req.user.id,
        title: resumeTitle,
        content: content.trim()
      })
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/resumes/:id -> Delete a saved resume
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('user_resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
      
    if (error) throw error;
    
    res.status(200).json({ success: true, message: 'Currículo removido com sucesso.' });
  } catch (err) {
    next(err);
  }
});

export default router;
