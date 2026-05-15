/**
 * exporter.js — Exportação de resultados para TXT e Markdown
 * Gera arquivos formatados em data/exports/ com timestamp.
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { formatDate } from './utils.js';
import { getHistory } from './historyManager.js';
import logger from './logger.js';

const EXPORTS_DIR = 'data/exports';

/**
 * Gera um nome de arquivo com timestamp.
 * @param {string} prefix - Prefixo do arquivo
 * @param {string} ext    - Extensão (sem ponto)
 * @returns {string}
 */
function generateFilename(prefix, ext) {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `${prefix}_${date}_${time}.${ext}`;
}

/**
 * Exporta os resultados para um arquivo TXT.
 *
 * @param {Array}  results  - Array de objetos { result: {...} }
 * @param {string} filename - Nome do arquivo (opcional)
 * @returns {Promise<string>} Caminho completo do arquivo gerado
 */
export async function exportToTxt(results, filename) {
  if (!filename) {
    filename = generateFilename('export', 'txt');
  }

  const now = new Date().toISOString();
  const validResults = results.filter((r) => r.result);

  let content = '';
  content += '==========================================\n';
  content += 'LINKEDIN JOB FINDER - EXPORT\n';
  content += `Gerado em: ${formatDate(now)}\n`;
  content += `Total de URLs: ${validResults.length}\n`;
  content += '==========================================\n';

  validResults.forEach((item, idx) => {
    const { result } = item;
    const meta = result.meta || {};
    const filters = meta.filtersApplied || 0;

    content += '\n';
    content += `[${idx + 1}] KEYWORDS: ${meta.keywords || ''}\n`;
    content += `    PERÍODO: ${meta.period || ''} | LOCAL: ${meta.location || ''} | FILTROS: ${filters}\n`;
    content += '\n';
    content += '    URL COMPLETA:\n';
    content += `    ${result.url}\n`;
    content += '\n';
    content += '    URL EXPRESS:\n';
    content += `    ${result.urlExpress}\n`;
    content += '\n';
    content += '------------------------------------------\n';
  });

  const filepath = join(EXPORTS_DIR, filename);
  try {
    await writeFile(filepath, content, 'utf-8');
    logger.success(`Exportado para: ${filepath}`);
    return filepath;
  } catch (err) {
    logger.error(`Falha ao exportar TXT: ${err.message}`);
    throw err;
  }
}

/**
 * Exporta os resultados para um arquivo Markdown.
 *
 * @param {Array}  results  - Array de objetos { result: {...} }
 * @param {string} filename - Nome do arquivo (opcional)
 * @returns {Promise<string>} Caminho completo do arquivo gerado
 */
export async function exportToMarkdown(results, filename) {
  if (!filename) {
    filename = generateFilename('export', 'md');
  }

  const now = new Date().toISOString();
  const validResults = results.filter((r) => r.result);

  let content = '';
  content += '# LinkedIn Job Finder — Export\n\n';
  content += `> Gerado em ${formatDate(now)} | Total: ${validResults.length} busca(s)\n\n`;

  validResults.forEach((item, idx) => {
    const { result } = item;
    const meta = result.meta || {};
    const filters = meta.filtersApplied || 0;
    const title = `${meta.keywords || 'N/A'} — ${meta.period || ''} — ${meta.location || ''}`;

    content += `## ${idx + 1}. ${title}\n\n`;
    content += `**Keywords:** ${meta.keywords || ''}  \n`;
    content += `**Período:** ${meta.period || ''} (${meta.seconds || 0}s)  \n`;
    content += `**Localização:** ${meta.location || ''}  \n`;
    content += `**GeoId:** ${meta.geoId || 'N/A'}  \n`;
    content += `**Filtros aplicados:** ${filters}  \n`;

    if (meta.jobType && meta.jobType.length > 0) {
      content += `**Tipo de vaga:** ${meta.jobType.join(', ')}  \n`;
    }
    if (meta.experienceLevel && meta.experienceLevel.length > 0) {
      content += `**Nível:** ${meta.experienceLevel.join(', ')}  \n`;
    }
    if (meta.workMode && meta.workMode.length > 0) {
      content += `**Modalidade:** ${meta.workMode.join(', ')}  \n`;
    }
    if (meta.easyApply) {
      content += `**Easy Apply:** Ativado  \n`;
    }
    if (meta.lowApplicants) {
      content += `**Baixa concorrência:** Ativado  \n`;
    }
    if (meta.company) {
      content += `**Empresa:** ${meta.company}  \n`;
    }

    content += '\n### URL Completa\n\n';
    content += '```\n';
    content += `${result.url}\n`;
    content += '```\n\n';

    content += '### URL Express\n\n';
    content += '```\n';
    content += `${result.urlExpress}\n`;
    content += '```\n\n';

    if (result.warnings && result.warnings.length > 0) {
      content += `> ⚠️ **Avisos:** ${result.warnings.join(' | ')}\n\n`;
    }

    content += '---\n\n';
  });

  const filepath = join(EXPORTS_DIR, filename);
  try {
    await writeFile(filepath, content, 'utf-8');
    logger.success(`Exportado para: ${filepath}`);
    return filepath;
  } catch (err) {
    logger.error(`Falha ao exportar Markdown: ${err.message}`);
    throw err;
  }
}

/**
 * Exporta o histórico recente para um arquivo Markdown.
 *
 * @param {number} limit - Número máximo de itens do histórico a exportar
 * @returns {Promise<string>} Caminho completo do arquivo gerado
 */
export async function exportHistory(limit = 50) {
  const filename = generateFilename('history_export', 'md');
  const history = await getHistory(limit);

  // Converte entradas do histórico para o formato de exportToMarkdown
  const results = history.map((item) => ({
    result: {
      url: item.url,
      urlExpress: item.url, // histórico armazena só url completa
      warnings: [],
      meta: item.meta,
    },
  }));

  return exportToMarkdown(results, filename);
}
