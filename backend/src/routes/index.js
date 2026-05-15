import { Router } from 'express';
import searchRoutes from './search.routes.js';
import historyRoutes from './history.routes.js';
import presetRoutes from './preset.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LinkedIn Job Finder API v4 is running',
    endpoints: {
      health: '/health',
      search: '/api/search',
      history: '/api/history',
      presets: '/api/presets'
    }
  });
});

router.use('/health', healthRoutes);
router.use('/api/search', searchRoutes);
router.use('/api/history', historyRoutes);
router.use('/api/presets', presetRoutes);

export default router;
