import { extractJsonFromString } from '../utils/jsonExtractor.js';

export class SearchController {
  constructor(llmService, urlBuilderService, keywordService, historyService) {
    this.llmService = llmService;
    this.urlBuilderService = urlBuilderService;
    this.keywordService = keywordService;
    this.historyService = historyService;
  }

  async search(req, res, next) {
    try {
      const { query, expandKeywords, manualFilters } = req.body;

      // 1. LLM Parsing
      const manualContext = manualFilters ? `
        O usuário já definiu estes filtros manualmente, NÃO tente alterá-los, use-os como base:
        ${JSON.stringify(manualFilters)}
      ` : '';

      const parsePrompt = `
        Você é um especialista em busca avançada no LinkedIn.
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
          "company": null
        }
      `;

      const parseResponse = await this.llmService.chat([
        { role: 'system', content: 'Você é um assistente que extrai filtros de emprego e fala apenas JSON.' },
        { role: 'user', content: parsePrompt }
      ], { json: true });

      let parsedParams = extractJsonFromString(parseResponse) || {};

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

      // 2. Keyword Expansion (Optional)
      let expandedKeywords = [];
      let booleanQuery = parsedParams.keywords;

      if (expandKeywords) {
        const expansion = await this.keywordService.expand(parsedParams.keywords);
        expandedKeywords = expansion.variations;
        booleanQuery = expansion.booleanQuery;
      }

      // 3. Build URLs
      const urls = this.urlBuilderService.build({ ...parsedParams, keywords: booleanQuery });

      // 4. Save to History
      const result = {
        originalQuery: query,
        parsedParams,
        expandedKeywords,
        booleanQuery,
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
}
