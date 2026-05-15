/**
 * keywordExpander.js — Expansão inteligente de keywords via LLM
 * Gera variações de títulos de cargo para maximizar o alcance da busca.
 */

import chalk from 'chalk';
import { client } from './llmParser.js';
import { extractJsonFromString, sleep } from './utils.js';
import logger from './logger.js';

// ─── System Prompt de Expansão ────────────────────────────────────────────────
const EXPAND_SYSTEM_PROMPT = `Você é um especialista em mercado de trabalho brasileiro e internacional.
Para o cargo informado, gere variações de títulos que diferentes empresas
usam para a mesma função. Retorne APENAS JSON válido sem markdown:

{
  "original": "título original",
  "variations": ["variação 1", "variação 2", "variação 3"],
  "booleanQuery": "titulo1 OR titulo2 OR titulo3",
  "reasoning": "breve explicação em português"
}

REGRAS:
- Gere entre 3 e 7 variações relevantes
- Inclua versões em português E inglês quando aplicável
- Inclua variações com e sem sênioridade quando não especificada
- booleanQuery: join das variações com " OR ", use aspas para títulos compostos
- Seja preciso: não inclua variações muito distantes do cargo original

EXEMPLOS:

Input: "desenvolvedor react"
Output: {
  "original": "desenvolvedor react",
  "variations": ["React Developer", "Frontend Developer React", "Desenvolvedor Frontend", "UI Developer", "Front-end Engineer"],
  "booleanQuery": "\\"desenvolvedor react\\" OR \\"React Developer\\" OR \\"Frontend Developer\\" OR \\"Desenvolvedor Frontend\\" OR \\"UI Developer\\"",
  "reasoning": "React é usado tanto em português quanto inglês; Frontend Developer é a variação mais comum no mercado"
}

Input: "gerente de projetos"
Output: {
  "original": "gerente de projetos",
  "variations": ["Project Manager", "PM", "Gerente de Projeto", "Coordenador de Projetos", "Scrum Master"],
  "booleanQuery": "\\"gerente de projetos\\" OR \\"Project Manager\\" OR \\"Coordenador de Projetos\\" OR \\"Scrum Master\\"",
  "reasoning": "Project Manager é amplamente usado mesmo em empresas brasileiras; PM é sigla comum"
}`;

/**
 * Expande um termo de cargo em variações usando LLM.
 * Nunca lança erro — falha gracefully.
 *
 * @param {string} keywords - Cargo ou keywords originais
 * @returns {Promise<object>} Objeto com original, variations, booleanQuery, reasoning
 */
export async function expandKeywords(keywords) {
  try {
    // Pequeno delay para respeitar rate limit (o llmParser já tem o seu)
    await sleep(300);

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        { role: 'system', content: EXPAND_SYSTEM_PROMPT },
        { role: 'user', content: keywords },
      ],
    });

    logger.debug(`Payload LLM (expand): ${JSON.stringify(response.choices[0]?.message)}`);

    const content = response.choices[0]?.message?.content || '';
    const parsed = extractJsonFromString(content);

    if (parsed && Array.isArray(parsed.variations) && parsed.variations.length > 0) {
      return parsed;
    }

    throw new Error('Resposta da expansão sem variações válidas.');
  } catch (err) {
    logger.warn(`Expansão de keywords falhou: ${err.message}`);
    return {
      original: keywords,
      variations: [],
      booleanQuery: keywords,
      reasoning: 'Falha na expansão',
    };
  }
}

/**
 * Mostra as variações ao usuário e pergunta como proceder.
 * Retorna a query final (original ou expandida ou personalizada).
 *
 * @param {string}   keywords        - Keywords originais
 * @param {object}   expansionResult - Resultado de expandKeywords()
 * @param {Function} askFn           - Função async (prompt) => string para ler input
 * @returns {Promise<string>} Query final a usar
 */
export async function promptUserForExpansion(keywords, expansionResult, askFn) {
  const { variations, booleanQuery } = expansionResult;

  if (!variations || variations.length === 0) {
    return keywords;
  }

  // Exibe as variações encontradas
  console.log('');
  console.log(chalk.cyan(`💡 Variações encontradas para ${chalk.bold(`"${expansionResult.original || keywords}"`)}: `));
  variations.forEach((v, i) => {
    console.log(chalk.white(`   ${chalk.bold(i + 1)}. ${v}`));
  });
  if (expansionResult.reasoning) {
    console.log(chalk.gray(`   📖 ${expansionResult.reasoning}`));
  }
  console.log('');

  const answer = await askFn('Usar boolean query expandida? (s/n/personalizar): ');
  const resp = answer.trim().toLowerCase();

  if (resp === 's' || resp === 'sim') {
    return booleanQuery;
  }

  if (resp === 'n' || resp === 'nao' || resp === 'não') {
    return keywords;
  }

  if (resp === 'personalizar' || resp === 'p') {
    // Mostra variações numeradas para seleção
    console.log(chalk.cyan('\nSelecione as variações desejadas (ex: 1,3,5):'));
    variations.forEach((v, i) => {
      console.log(chalk.white(`  ${chalk.bold(i + 1)}. ${v}`));
    });

    const selection = await askFn('Números (separados por vírgula): ');
    const indices = selection
      .split(',')
      .map((s) => parseInt(s.trim()) - 1)
      .filter((i) => i >= 0 && i < variations.length);

    if (indices.length === 0) {
      logger.warn('Nenhuma variação selecionada. Usando keywords originais.');
      return keywords;
    }

    const selected = indices.map((i) => `"${variations[i]}"`);
    return selected.join(' OR ');
  }

  // Resposta não reconhecida: usa original
  return keywords;
}
