/**
 * linkedinUrlBuilder.js — Motor de construção de URLs do LinkedIn
 * Transforma parâmetros validados em URLs de busca otimizadas.
 */

import { validateAndNormalize } from './validator.js';
import { countFilters } from './utils.js';

const BASE_URL = 'https://www.linkedin.com/jobs/search/';
const BASE_URL_API = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';

/**
 * Constrói as URLs de busca do LinkedIn a partir dos parâmetros brutos.
 *
 * @param {object} rawParams  - Parâmetros brutos (pré ou pós-LLM)
 * @param {object} userConfig - Configuração atual do usuário
 * @returns {object} Objeto com URLs e metadados completos
 */
export function buildLinkedInUrl(rawParams, userConfig) {
  // ─── Validação e normalização ─────────────────────────────────────────────
  const { params, warnings } = validateAndNormalize(rawParams, userConfig);

  // ─── Construção dos search params ────────────────────────────────────────
  const searchParams = new URLSearchParams();

  // Keywords: se boolean search, usa diretamente (sem encode de OR/AND/NOT)
  // URLSearchParams já faz o encode necessário, preservando a lógica booleana
  searchParams.set('keywords', params.keywords);
  searchParams.set('f_TPR', `r${params.seconds}`);
  searchParams.set('sortBy', params.sortBy);

  // Localização e distância
  if (params.geoId) {
    searchParams.set('geoId', params.geoId);
    searchParams.set('distance', String(params.distance));
  }

  // Modalidade (f_WT)
  if (params.workMode && params.workMode.length > 0) {
    searchParams.set('f_WT', params.workMode.join(','));
  }

  // Tipo de vaga (f_JT)
  if (params.jobType && params.jobType.length > 0) {
    searchParams.set('f_JT', params.jobType.join(','));
  }

  // Nível de experiência (f_E)
  if (params.experienceLevel && params.experienceLevel.length > 0) {
    searchParams.set('f_E', params.experienceLevel.join(','));
  }

  // Easy Apply
  if (params.easyApply) {
    searchParams.set('f_AL', 'true');
  }

  // Menos de 10 candidatos
  if (params.lowApplicants) {
    searchParams.set('f_JIYN', 'true');
  }

  // Empresa específica
  if (params.company) {
    searchParams.set('f_C', params.company);
  }

  // Paginação: sempre começa no 0
  searchParams.set('start', '0');

  // ─── URL Completa ─────────────────────────────────────────────────────────
  const url = `${BASE_URL}?${searchParams.toString()}`;

  // ─── URL Express (keywords + período + sort apenas) ───────────────────────
  const expressParams = new URLSearchParams();
  expressParams.set('keywords', params.keywords);
  expressParams.set('f_TPR', `r${params.seconds}`);
  expressParams.set('sortBy', params.sortBy);
  const urlExpress = `${BASE_URL}?${expressParams.toString()}`;

  // ─── URL da API interna do LinkedIn ───────────────────────────────────────
  const urlApi = `${BASE_URL_API}?${searchParams.toString()}`;

  // ─── Metadados ────────────────────────────────────────────────────────────
  const filtersApplied = countFilters(params);

  return {
    url,
    urlExpress,
    urlApi,
    warnings,
    meta: {
      keywords: params.keywords,
      location: params.location,
      geoId: params.geoId,
      period: params.period,
      seconds: params.seconds,
      jobType: params.jobType,
      experienceLevel: params.experienceLevel,
      workMode: params.workMode,
      easyApply: params.easyApply,
      lowApplicants: params.lowApplicants,
      company: params.company,
      hasBooleanSearch: params.hasBooleanSearch,
      sortBy: params.sortBy,
      distance: params.distance,
      filtersApplied,
      generatedAt: new Date().toISOString(),
    },
  };
}
