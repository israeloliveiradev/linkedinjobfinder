import { Router } from 'express';
import { SearchController } from '../controllers/search.controller.js';
import { LlmService } from '../services/llm.service.js';
import { UrlBuilderService } from '../services/urlBuilder.service.js';
import { KeywordService } from '../services/keyword.service.js';
import { HistoryService } from '../services/history.service.js';
import { HistoryRepository } from '../repositories/history.repository.js';
import { SubscriptionService } from '../services/subscription.service.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { searchSchema } from '../validators/search.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import supabase from '../config/database.js';

const router = Router();

const llmService = new LlmService();
const urlBuilderService = new UrlBuilderService();
const keywordService = new KeywordService(llmService);
const historyRepository = new HistoryRepository();
const historyService = new HistoryService(historyRepository);
const subscriptionService = new SubscriptionService();

const searchController = new SearchController(
  llmService, 
  urlBuilderService, 
  keywordService, 
  historyService,
  subscriptionService
);

router.post('/', requireAuth, validateRequest(searchSchema), (req, res, next) => searchController.search(req, res, next));
router.get('/expand-keywords', requireAuth, (req, res, next) => searchController.expandKeywords(req, res, next));
router.post('/use-feature', requireAuth, (req, res, next) => searchController.useFeature(req, res, next));

router.post('/copilot', requireAuth, async (req, res) => {
  try {
    const { resumeText, jobDescription, keywords } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Os campos de currículo e descrição de vaga são obrigatórios.' });
    }
    
    // Check user subscription in database
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
      
    const isPro = sub && sub.status === 'pro' && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    
    if (!isPro) {
      return res.status(403).json({ error: 'Acesso negado: o Copiloto de Abordagem é um recurso exclusivo do plano PRO.' });
    }
    
    // Call LLM for resume matching & ATS keyword checking
    const systemPrompt = `Você é o Copiloto de Carreira da EmpregoMestre, um assistente de I.A. especializado em acelerar candidaturas de desenvolvedores e profissionais de tecnologia no LinkedIn.
Sua tarefa é analisar o currículo do candidato e a descrição da vaga fornecida para retornar um objeto JSON contendo análise de palavras-chave, match score de 0 a 100% e dicas de otimização ATS.

O formato de retorno DEVE ser EXCLUSIVAMENTE um objeto JSON válido, com a seguinte estrutura de campos:
{
  "matchScore": 85,
  "matchAnalysis": "Uma análise detalhada de 3 a 4 frases explicando a compatibilidade do currículo com os requisitos da vaga.",
  "missingKeywords": ["GraphQL", "Docker"]
}

Use português do Brasil, tom extremamente profissional, persuasivo e empático. Garanta que o JSON retornado seja 100% parseável.`;

    const userPrompt = `VAGA / DESCRIÇÃO DA OPORTUNIDADE:
${jobDescription}

CURRÍCULO DO CANDIDATO:
${resumeText}

CARGO PRINCIPAL BUSCADO:
${keywords || 'Desenvolvedor'}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    const response = await llmService.chat(messages, { json: true, temperature: 0.2 });
    
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (err) {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Falha ao decodificar a resposta da I.A. em JSON.');
      }
    }
    
    res.json(parsed);
  } catch (e) {
    console.error('[Copilot Error]', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
