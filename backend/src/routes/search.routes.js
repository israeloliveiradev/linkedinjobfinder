import { Router } from 'express';
import { SearchController } from '../controllers/search.controller.js';
import { LlmService } from '../services/llm.service.js';
import { UrlBuilderService } from '../services/urlBuilder.service.js';
import { KeywordService } from '../services/keyword.service.js';
import { HistoryService } from '../services/history.service.js';
import { HistoryRepository } from '../repositories/history.repository.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { searchSchema } from '../validators/search.validator.js';

const router = Router();

const llmService = new LlmService();
const urlBuilderService = new UrlBuilderService();
const keywordService = new KeywordService(llmService);
const historyRepository = new HistoryRepository();
const historyService = new HistoryService(historyRepository);

const searchController = new SearchController(
  llmService, 
  urlBuilderService, 
  keywordService, 
  historyService
);

router.post('/', validateRequest(searchSchema), (req, res, next) => searchController.search(req, res, next));
router.get('/expand-keywords', (req, res, next) => searchController.expandKeywords(req, res, next));

export default router;
