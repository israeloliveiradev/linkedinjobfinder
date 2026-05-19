import { Router } from 'express';
import { HistoryController } from '../controllers/history.controller.js';
import { HistoryService } from '../services/history.service.js';
import { HistoryRepository } from '../repositories/history.repository.js';

const router = Router();

const historyRepository = new HistoryRepository();
const historyService = new HistoryService(historyRepository);
const historyController = new HistoryController(historyService);

import { requireAuth } from '../middlewares/auth.middleware.js';

router.get('/', requireAuth, (req, res, next) => historyController.getAll(req, res, next));
router.delete('/:id', requireAuth, (req, res, next) => historyController.delete(req, res, next));
router.delete('/', requireAuth, (req, res, next) => historyController.clear(req, res, next));

export default router;
