import { auth } from '../config/auth.js';
import supabase from '../config/database.js';

export const requireAuth = async (req, res, next) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  req.user = session.user;
  next();
};

export const requireAdmin = async (req, res, next) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  // Realiza a verificação segura de papel (role) direto no banco de dados
  const { data: userData, error: userError } = await supabase
    .from('user')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (userError || !userData || userData.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  req.user = session.user;
  next();
};
