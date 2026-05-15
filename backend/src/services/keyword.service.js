import { extractJsonFromString } from '../utils/jsonExtractor.js';

export class KeywordService {
  constructor(llmService) {
    this.llmService = llmService;
  }

  async expand(keywords) {
    const prompt = `
      Você é um especialista em mercado de trabalho.
      Para o cargo "${keywords}", gere variações de títulos relevantes.
      Retorne APENAS JSON válido:
      {
        "variations": ["titulo 1", "titulo 2"],
        "booleanQuery": "(termo1 OR termo2) AND (termo3 OR termo4)"
      }
    `;

    const response = await this.llmService.chat([
      { role: 'system', content: 'Você é um assistente útil que fala apenas JSON.' },
      { role: 'user', content: prompt }
    ], { json: true });

    return extractJsonFromString(response) || { variations: [], booleanQuery: keywords };
  }
}
