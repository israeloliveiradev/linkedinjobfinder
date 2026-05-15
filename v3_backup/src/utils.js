/**
 * utils.js — Funções utilitárias reutilizáveis
 * Helpers sem dependências externas além do Node.js padrão.
 */

import { spawn } from 'child_process';

/**
 * Aguarda um número de milissegundos.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Trunca uma string com "..." se ultrapassar o comprimento máximo.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 80) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

/**
 * Formata uma data ISO em "DD/MM/YYYY HH:MM" (pt-BR).
 * @param {string} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  const d = new Date(isoString);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Normaliza string: lowercase + trim + remove acentos.
 * @param {string} str
 * @returns {string}
 */
export function normalizeString(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Extrai JSON de uma string que pode conter texto ao redor.
 * Tenta primeiro JSON.parse, depois regex para objeto ou array.
 * @param {string} str
 * @returns {object|null}
 */
export function extractJsonFromString(str) {
  if (!str) return null;
  // Tentativa direta
  try {
    return JSON.parse(str);
  } catch (_) { /* continua */ }

  // Objeto
  const objMatch = str.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch (_) { /* continua */ }
  }

  // Array
  const arrMatch = str.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[0]);
    } catch (_) { /* continua */ }
  }

  return null;
}

/**
 * Abre uma URL no browser padrão do sistema operacional.
 * Fire-and-forget — erros são silenciados.
 * @param {string} url
 */
export function openInBrowser(url) {
  try {
    let cmd, args;
    const platform = process.platform;

    if (platform === 'darwin') {
      cmd = 'open';
      args = [url];
    } else if (platform === 'win32') {
      cmd = 'cmd';
      args = ['/c', 'start', url];
    } else {
      cmd = 'xdg-open';
      args = [url];
    }

    const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
    child.unref();
  } catch (_) {
    // Silencioso — não crashar se o browser não abrir
  }
}

/**
 * Gera um ID único baseado em timestamp + random.
 * @returns {string}
 */
export function generateId() {
  return Date.now() + Math.random().toString(36).slice(2, 7);
}

/**
 * Conta quantos filtros opcionais foram aplicados nos parâmetros.
 * @param {object} params
 * @returns {number}
 */
export function countFilters(params) {
  let count = 0;
  if (params.jobType && params.jobType.length > 0) count++;
  if (params.experienceLevel && params.experienceLevel.length > 0) count++;
  if (params.workMode && params.workMode.length > 0) count++;
  if (params.easyApply === true) count++;
  if (params.lowApplicants === true) count++;
  if (params.company && params.company.trim()) count++;
  return count;
}
