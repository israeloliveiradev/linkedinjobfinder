import { extractJsonFromString } from '../utils/jsonExtractor.js';

export class KeywordService {
  constructor(llmService) {
    this.llmService = llmService;
  }

  async expand(keywords, location = 'brasil') {
    const isInternational = location && !['brasil', 'brazil', 'sao paulo', 'são paulo', 'sp', 'rio de janeiro', 'rj', 'belo horizonte', 'bh', 'curitiba', 'cwb', 'porto alegre', 'poa', 'brasilia', 'df', 'salvador', 'fortaleza', 'recife', 'manaus', 'goiania', 'campinas', 'florianopolis', 'vitoria', 'santos', 'osasco'].includes(location.toLowerCase().trim());

    const prompt = `
      Você é um especialista em mercado de trabalho internacional e busca avançada no LinkedIn.
      Para o cargo "${keywords}", gere variações de títulos relevantes e sinônimos de mercado.
      
      Diretrizes Importantes de Idioma:
      - Localização da Vaga: "${location}"
      ${isInternational ? '- A busca é INTERNACIONAL (fora do Brasil). Portanto, você DEVE gerar todos os títulos, variações e a booleanQuery estritamente em INGLÊS. Não traduza nada para o português.' : '- Como a busca é no Brasil, use uma combinação inteligente de variações em português e termos técnicos em inglês (pois no Brasil o mercado de tecnologia usa ambos). Se o termo de entrada estiver em inglês, dê prioridade a manter as variações em inglês.'}

      Retorne APENAS JSON válido no formato:
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
