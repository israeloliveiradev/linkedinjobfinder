/**
 * historyManager.js — Histórico persistente de buscas
 * Armazena e recupera buscas anteriores em data/history.json.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { generateId } from './utils.js';
import { loadConfig } from './configManager.js';
import logger from './logger.js';

const HISTORY_FILE = 'data/history.json';

/**
 * Garante que os diretórios data/ e data/exports/ existam.
 * @returns {Promise<void>}
 */
export async function ensureDataDirs() {
  try {
    await mkdir('data/exports', { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      logger.error(`Erro ao criar diretórios de dados: ${err.message}`);
    }
  }
}

/**
 * Carrega o histórico de buscas do disco.
 * Retorna array vazio em caso de falha.
 * @returns {Promise<Array>}
 */
export async function loadHistory() {
  try {
    const raw = await readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

/**
 * Salva uma busca no histórico (fire-and-forget).
 * @param {object} params  - Parâmetros da busca
 * @param {object} result  - Resultado do buildLinkedInUrl
 * @returns {void}
 */
export function saveToHistory(params, result) {
  (async () => {
    try {
      const config = await loadConfig();
      const history = await loadHistory();

      const entry = {
        id: generateId(),
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        params,
        url: result.url,
        meta: result.meta,
      };

      history.unshift(entry);

      // Mantém apenas os últimos maxHistory registros
      const maxHistory = config.maxHistory || 100;
      if (history.length > maxHistory) {
        history.splice(maxHistory);
      }

      await writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    } catch (err) {
      logger.error(`Falha ao salvar histórico: ${err.message}`);
    }
  })().catch(logger.error);
}

/**
 * Retorna os últimos N itens do histórico em ordem decrescente.
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getHistory(limit = 10) {
  const history = await loadHistory();
  return history.slice(0, limit);
}

/**
 * Busca no histórico por query (keywords e location).
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchHistory(query) {
  const history = await loadHistory();
  const q = query.toLowerCase();
  return history
    .filter((item) => {
      const kw = (item.meta?.keywords || item.params?.keywords || '').toLowerCase();
      const loc = (item.meta?.location || item.params?.location || '').toLowerCase();
      return kw.includes(q) || loc.includes(q);
    })
    .slice(0, 10);
}

/**
 * Limpa todo o histórico.
 * @returns {Promise<void>}
 */
export async function clearHistory() {
  try {
    await writeFile(HISTORY_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    logger.error(`Falha ao limpar histórico: ${err.message}`);
  }
}

/**
 * Remove um item do histórico pelo ID.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteFromHistory(id) {
  try {
    const history = await loadHistory();
    const filtered = history.filter((item) => item.id !== id);
    if (filtered.length === history.length) return false; // não encontrado
    await writeFile(HISTORY_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  } catch (err) {
    logger.error(`Falha ao deletar item do histórico: ${err.message}`);
    return false;
  }
}
