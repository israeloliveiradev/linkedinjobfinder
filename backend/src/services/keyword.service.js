import { extractJsonFromString } from '../utils/jsonExtractor.js';

export class KeywordService {
  constructor(llmService) {
    this.llmService = llmService;
  }

  async expand(keywords, location = 'brasil') {
    const isInternational = location && !['brasil', 'brazil', 'sao paulo', 'são paulo', 'sp', 'rio de janeiro', 'rj', 'belo horizonte', 'bh', 'curitiba', 'cwb', 'porto alegre', 'poa', 'brasilia', 'df', 'salvador', 'fortaleza', 'recife', 'manaus', 'goiania', 'campinas', 'florianopolis', 'vitoria', 'santos', 'osasco'].includes(location.toLowerCase().trim());

    const prompt = `
      Você é um especialista em mercado de trabalho e busca avançada no LinkedIn.
      Para o cargo "${keywords}", gere variações de títulos relevantes e sinônimos de mercado.
      
      Diretrizes Importantes de Idioma:
      - Localização da Vaga: "${location}"
      ${isInternational ? '- A busca é INTERNACIONAL (fora do Brasil). Portanto, você DEVE gerar todos os títulos, variações e a booleanQuery estritamente em INGLÊS. Não traduza nada para o português.' : '- Como a busca é no Brasil, use uma combinação inteligente de variações em português e termos técnicos em inglês (pois no Brasil o mercado de tecnologia usa ambos). Se o termo de entrada estiver em inglês, dê prioridade a manter as variações em inglês.'}

      REGRAS CRÍTICAS DE SINTAXE DE BUSCA DO LINKEDIN:
      1. Qualquer termo ou variação composto por duas ou mais palavras DEVE vir obrigatoriamente entre aspas duplas na 'booleanQuery' (ex: "Back End", "Desenvolvedor React", "Frontend Developer"). Nunca retorne termos de múltiplas palavras sem aspas.
      2. Monte a 'booleanQuery' como uma lista limpa e abrangente de variações de cargos unidas por OR (ex: ("Desenvolvedor Backend" OR "Backend Developer" OR "Dev Back-End")). Não tente adicionar tecnologias extras com AND que restrinjam excessivamente a busca, a menos que o termo original seja muito genérico.

      Retorne APENAS JSON válido no formato (certifique-se de escapar as aspas duplas dos termos compostos dentro da booleanQuery):
      {
        "variations": ["Desenvolvedor Backend", "Backend Developer", "Dev Back-End"],
        "booleanQuery": "(\\"Desenvolvedor Backend\\" OR \\"Backend Developer\\" OR \\"Dev Back-End\\")"
      }
    `;

    const response = await this.llmService.chat([
      { role: 'system', content: 'Você é um assistente útil que fala apenas JSON.' },
      { role: 'user', content: prompt }
    ], { json: true });

    return extractJsonFromString(response) || { variations: [], booleanQuery: keywords };
  }
}
