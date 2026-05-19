import { extractJsonFromString } from '../utils/jsonExtractor.js';
import supabase from '../config/database.js';

export class SearchController {
  constructor(llmService, urlBuilderService, keywordService, historyService, subscriptionService) {
    this.llmService = llmService;
    this.urlBuilderService = urlBuilderService;
    this.keywordService = keywordService;
    this.historyService = historyService;
    this.subscriptionService = subscriptionService;
  }

  async search(req, res, next) {
    try {
      const { query, expandKeywords, manualFilters } = req.body;
      const userId = req.user?.id; // Supplied by requireAuth

      // 0. Check token economy / SaaS limits & Determine plan status
      let isPro = false;
      let sub = null;
      if (userId) {
        await this.subscriptionService.checkAndIncrementUsage(userId);
        
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();
        sub = data;
        if (sub && sub.status === 'pro' && (!sub.expires_at || new Date(sub.expires_at) > new Date())) {
          isPro = true;
        }
      }

      // Semantic Mapping (Synonyms) is fully unlocked for Free users within their 5 searches
      const shouldExpand = !!expandKeywords;

      // 1. LLM Parsing
      const manualContext = manualFilters ? `
        O usuário já definiu estes filtros manualmente, NÃO tente alterá-los, use-os como base:
        ${JSON.stringify(manualFilters)}
      ` : '';

      const parsePrompt = `
        Você é um especialista em busca avançada no LinkedIn e consultor de carreira sênior.
        Analise o input do usuário e extraia os parâmetros de busca.
        
        ${manualContext}

        Input do Usuário: "${query}"

        Instruções de Localização (GeoID):
        - Brasil: 106057199
        - São Paulo (Estado): 104440326
        - Rio de Janeiro (Estado): 104768393
        - Curitiba: 105650223
        - Belo Horizonte: 104539166
        - Remoto (Global): 92000000
        - Se for outra cidade, tente inferir ou use 106057199 (Brasil).

        Além dos parâmetros, você deve gerar uma dica de recrutamento sênior de 1 a 2 sentenças para o usuário se destacar para esta busca específica (ex: qual competência ou conhecimento complementar focar, como ajustar o currículo). Retorne no campo "recruiterAdvice".

        Retorne APENAS JSON válido no formato:
        {
          "keywords": "cargo e tecnologias (ex: 'Frontend React Node')",
          "location": "nome da cidade",
          "geoId": "ID numérico correspondente",
          "period": "1h, 6h, 24h, 3d, 7d, 14d, 30d",
          "jobType": ["clt", "pj", "temporario", "estagio"],
          "experienceLevel": ["estagio", "junior", "pleno", "senior", "diretor"],
          "workMode": ["remoto", "hibrido", "presencial"],
          "sortBy": "recente",
          "distance": 25,
          "company": null,
          "recruiterAdvice": "Sua dica estratégica e acionável de recrutamento..."
        }
      `;

      const parseResponse = await this.llmService.chat([
        { role: 'system', content: 'Você é um assistente que extrai filtros de emprego, gera dicas de carreira e fala apenas JSON.' },
        { role: 'user', content: parsePrompt }
      ], { json: true });

      let parsedParams = extractJsonFromString(parseResponse) || {};
      parsedParams.expandKeywords = shouldExpand;

      // 2. Merge Manual Filters (Overrides)
      if (manualFilters) {
        if (manualFilters.period) parsedParams.period = manualFilters.period;
        if (manualFilters.location) {
          parsedParams.location = manualFilters.location;
          parsedParams.geoId = null; // Limpa sugestão da IA para não bugar
        }
        if (manualFilters.workModes && manualFilters.workModes.length > 0) parsedParams.workMode = manualFilters.workModes;
        if (manualFilters.experienceLevels && manualFilters.experienceLevels.length > 0) parsedParams.experienceLevel = manualFilters.experienceLevels;
        if (manualFilters.jobTypes && manualFilters.jobTypes.length > 0) parsedParams.jobType = manualFilters.jobTypes;
      }

      // 2. Keyword Expansion (Only for PRO)
      let expandedKeywords = [];
      let booleanQuery = parsedParams.keywords;

      if (shouldExpand) {
        const expansion = await this.keywordService.expand(parsedParams.keywords);
        expandedKeywords = expansion.variations;
        booleanQuery = expansion.booleanQuery;
      }

      // 2.1 Process Anti-Spam and Negative Keywords
      let finalBooleanQuery = booleanQuery;
      
      if (manualFilters?.antiSpam) {
        finalBooleanQuery += ' NOT "BairesDev" NOT "Crossover" NOT "Turing" NOT "GeekHunter" NOT "Belvo" NOT "Epic"';
      }

      if (manualFilters?.negativeKeywords) {
        const negatives = manualFilters.negativeKeywords
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0);
        
        negatives.forEach(neg => {
          finalBooleanQuery += ` NOT "${neg}"`;
        });
      }

      // 2.2 Exclude Seniority if experienceLevel contains Junior
      const experiences = parsedParams.experienceLevel || [];
      if (experiences.map(e => e.toLowerCase()).includes('junior')) {
        finalBooleanQuery += ' NOT "Senior" NOT "Pleno" NOT "Sênior" NOT "Lead" NOT "Principal"';
      }

      // Strip recruiterAdvice if user is Free (PRO feature)
      if (!isPro) {
        parsedParams.recruiterAdvice = null;
      }

      // 3. Build URLs
      const allUrls = this.urlBuilderService.build({ 
        ...parsedParams, 
        keywords: finalBooleanQuery,
        rawKeywords: parsedParams.keywords 
      });

      // Filter URLs based on subscription tier (Free gets 5 complete searches but only 1 Express and 1 of each of the other 3)
      const urls = isPro ? allUrls : {
        main: allUrls.main,
        express: sub?.used_express ? null : allUrls.express,
        fallback1h: null,
        fallback24h: null,
        fallback3d: null,
        postsVaga: sub?.used_posts_vaga ? null : allUrls.postsVaga,
        postsHiring: sub?.used_posts_hiring ? null : allUrls.postsHiring,
        postsCurriculo: sub?.used_posts_curriculo ? null : allUrls.postsCurriculo
      };

      // 4. Save to History
      const result = {
        user_id: userId,
        originalQuery: query,
        parsedParams,
        expandedKeywords,
        booleanQuery: finalBooleanQuery,
        urls,
        filtersApplied: Object.values(parsedParams).filter(v => v !== null && v !== false && (!Array.isArray(v) || v.length > 0)).length
      };

      const savedEntry = await this.historyService.addEntry(result);

      res.status(200).json({
        success: true,
        data: savedEntry
      });
    } catch (error) {
      next(error);
    }
  }

  async expandKeywords(req, res, next) {
    try {
      const { keywords } = req.query;
      const expansion = await this.keywordService.expand(keywords);
      res.status(200).json({ success: true, data: expansion });
    } catch (error) {
      next(error);
    }
  }

  async useFeature(req, res, next) {
    try {
      const userId = req.user?.id;
      const { feature } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado' });
      }
      
      const allowedFeatures = ['express', 'postsVaga', 'postsHiring', 'postsCurriculo'];
      if (!allowedFeatures.includes(feature)) {
        return res.status(400).json({ error: 'Recurso inválido' });
      }

      const columnMap = {
        express: 'used_express',
        postsVaga: 'used_posts_vaga',
        postsHiring: 'used_posts_hiring',
        postsCurriculo: 'used_posts_curriculo'
      };

      const columnName = columnMap[feature];

      const { error } = await supabase
        .from('subscriptions')
        .update({ [columnName]: true })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      res.status(200).json({ success: true, message: `Recurso ${feature} marcado como usado.` });
    } catch (error) {
      next(error);
    }
  }
}
