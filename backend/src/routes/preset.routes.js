import { Router } from 'express';
import { PresetController } from '../controllers/preset.controller.js';
import { PresetService } from '../services/preset.service.js';
import { PresetRepository } from '../repositories/preset.repository.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { presetSchema } from '../validators/preset.validator.js';

const router = Router();

const presetRepository = new PresetRepository();
const presetService = new PresetService(presetRepository);
const presetController = new PresetController(presetService);

router.get('/', (req, res, next) => presetController.getAll(req, res, next));
router.get('/:name', (req, res, next) => presetController.getByName(req, res, next));
router.post('/', validateRequest(presetSchema), (req, res, next) => presetController.save(req, res, next));
router.delete('/:name', (req, res, next) => presetController.delete(req, res, next));

export default router;
