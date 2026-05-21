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

router.get('/copilot-limit', requireAuth, async (req, res) => {
  try {
    const { data: config } = await supabase
      .from('admin_config')
      .select('free_copilot_limit')
      .single();
      
    const freeCopilotLimit = config && config.free_copilot_limit !== undefined ? config.free_copilot_limit : 2;

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    const isPro = sub && sub.status === 'pro' && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    const copilotCount = sub?.copilot_count || 0;
    const extraCredits = sub?.extra_copilot_credits || 0;
    const allowedRuns = freeCopilotLimit + extraCredits;

    res.json({
      isPro,
      copilotCount,
      extraCredits,
      allowedRuns,
      remaining: isPro ? 999999 : Math.max(0, allowedRuns - copilotCount)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/copilot', requireAuth, async (req, res) => {
  try {
    const { resumeText, jobDescription, keywords } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Os campos de currículo e descrição de vaga são obrigatórios.' });
    }

    // Fetch global config for copilot limits
    const { data: config } = await supabase
      .from('admin_config')
      .select('free_copilot_limit')
      .single();
      
    const freeCopilotLimit = config && config.free_copilot_limit !== undefined ? config.free_copilot_limit : 2;

    // Check user subscription in database
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    const isPro = sub && sub.status === 'pro' && (!sub.expires_at || new Date(sub.expires_at) > new Date());

    if (!isPro) {
      const copilotCount = sub?.copilot_count || 0;
      const extraCredits = sub?.extra_copilot_credits || 0;
      const allowedRuns = freeCopilotLimit + extraCredits;

      if (copilotCount >= allowedRuns) {
        return res.status(403).json({ 
          error: 'Limite gratuito excedido: o Copiloto de IA é exclusivo do plano PRO.',
          limitExceeded: true,
          allowedRuns,
          copilotCount
        });
      }
    }

    // Call LLM for resume matching & ATS keyword checking
    const systemPrompt = `Você é o Copiloto de Carreira da Vagas Rankia, um assistente de I.A. especializado em acelerar candidaturas e otimizar currículos no LinkedIn para profissionais de todas as áreas.
Sua tarefa é analisar o currículo do candidato e a descrição da vaga fornecida para retornar um objeto JSON contendo análise de palavras-chave, match score de 0 a 100% e dicas de otimização ATS.

O formato de retorno DEVE ser EXCLUSIVAMENTE um objeto JSON válido, com a seguinte estrutura de campos:
{
  "matchScore": 85,
  "matchAnalysis": "Uma análise detalhada de 3 a 4 frases explicando a compatibilidade do currículo com os requisitos da vaga.",
  "missingKeywords": ["Metodologia Ágil", "Power BI", "Inglês Avançado"]
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

    // Increment copilot run count if the user is on the free plan
    if (!isPro) {
      const currentCount = sub?.copilot_count || 0;
      await supabase
        .from('subscriptions')
        .update({
          copilot_count: currentCount + 1
        })
        .eq('user_id', req.user.id);
    }

    res.json(parsed);
  } catch (e) {
    console.error('[Copilot Error]', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
