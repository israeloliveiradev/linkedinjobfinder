/**
 * batchProcessor.js — Processamento de múltiplas buscas sequencialmente
 * Aplica delay entre buscas para respeitar rate limits da API Groq.
 */

import { parseJobSearchIntent } from './llmParser.js';
import { buildLinkedInUrl } from './linkedinUrlBuilder.js';
import { saveToHistory } from './historyManager.js';
import { sleep } from './utils.js';
import logger from './logger.js';

// Delay entre buscas em batch (respeita rate limit do Groq)
const BATCH_DELAY = 1500;

/**
 * Processa múltiplas buscas sequencialmente.
 *
 * @param {string[]} searches   - Array de queries em linguagem natural
 * @param {object}   userConfig - Configuração atual do usuário
 * @param {Function} onResult   - Callback (index, total, result) para cada resultado
 * @returns {Promise<Array>} Array com todos os resultados (sucesso e erro)
 */
export async function processBatch(searches, userConfig, onResult) {
  const results = [];

  for (let i = 0; i < searches.length; i++) {
    const search = searches[i];

    logger.step(i + 1, searches.length, `Processando: "${search.length > 60 ? search.slice(0, 60) + '...' : search}"`);

    // Delay entre buscas (não aplica na primeira)
    if (i > 0) {
      await sleep(BATCH_DELAY);
    }

    try {
      // Interpreta a query com LLM
      const params = await parseJobSearchIntent(search);

      // Constrói a URL
      const result = buildLinkedInUrl(params, userConfig);

      // Salva no histórico (fire-and-forget)
      saveToHistory(params, result);

      const entry = { input: search, result, success: true };
      results.push(entry);

      if (typeof onResult === 'function') {
        onResult(i + 1, searches.length, entry);
      }
    } catch (err) {
      logger.error(`Erro ao processar busca "${search}": ${err.message}`);
      const entry = { input: search, error: err.message, success: false };
      results.push(entry);

      if (typeof onResult === 'function') {
        onResult(i + 1, searches.length, entry);
      }
    }
  }

  return results;
}
