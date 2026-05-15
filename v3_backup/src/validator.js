/**
 * validator.js — Validação e normalização de parâmetros de busca
 * Transforma input bruto do usuário em parâmetros limpos e validados.
 */

import { normalizeString } from './utils.js';
import {
  GEO_IDS,
  TIME_PERIODS,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  WORK_MODES,
  SORT_OPTIONS,
  BOOLEAN_OPERATORS,
} from './constants.js';

/**
 * Valida e normaliza os parâmetros brutos de busca.
 *
 * @param {object} rawParams - Parâmetros brutos do usuário ou da LLM
 * @param {object} userConfig - Configuração atual do usuário
 * @returns {{ params: object, warnings: string[] }}
 */
export function validateAndNormalize(rawParams, userConfig) {
  const warnings = [];
  const params = {};

  // ─── 1. KEYWORDS ───────────────────────────────────────────────────────────
  let keywords = (rawParams.keywords || '').trim();
  if (!keywords) {
    throw new Error('Keywords são obrigatórias. Informe um cargo ou termos de busca.');
  }
  // Truncar para evitar URLs gigantes
  if (keywords.length > 300) {
    keywords = keywords.slice(0, 300);
    warnings.push('Keywords truncadas para 300 caracteres.');
  }
  params.keywords = keywords;
  // Detectar operadores booleanos (OR, AND, NOT)
  params.hasBooleanSearch = BOOLEAN_OPERATORS.HAS_BOOLEAN.test(keywords);

  // ─── 2. LOCATION ───────────────────────────────────────────────────────────
  const rawLocation = normalizeString(rawParams.location || '');
  let geoId = undefined;
  let isRemote = false;
  let isHybrid = false;
  let resolvedLocation = rawLocation;

  if (rawLocation) {
    // Verifica se a chave existe no mapa (incluindo null para remoto/híbrido)
    if (rawLocation in GEO_IDS) {
      geoId = GEO_IDS[rawLocation];
      resolvedLocation = rawLocation;

      if (rawLocation === 'remoto' || rawLocation === 'remote') {
        isRemote = true;
        geoId = GEO_IDS[userConfig.defaultLocation] || GEO_IDS['brasil'];
        resolvedLocation = userConfig.defaultLocation;
      } else if (rawLocation === 'hibrido' || rawLocation === 'hybrid') {
        isHybrid = true;
        geoId = GEO_IDS[userConfig.defaultLocation] || GEO_IDS['brasil'];
        resolvedLocation = userConfig.defaultLocation;
      }
    } else {
      // Localização não encontrada: usar default
      const defaultLoc = normalizeString(userConfig.defaultLocation || 'brasil');
      geoId = GEO_IDS[defaultLoc] || GEO_IDS['brasil'];
      resolvedLocation = defaultLoc;
      warnings.push(`Localização "${rawLocation}" não reconhecida. Usando: "${resolvedLocation}".`);
    }
  } else {
    // Sem localização: usar default
    const defaultLoc = normalizeString(userConfig.defaultLocation || 'brasil');
    geoId = GEO_IDS[defaultLoc] || GEO_IDS['brasil'];
    resolvedLocation = defaultLoc;
  }

  params.location = resolvedLocation;
  params.geoId = geoId;
  params.isRemote = isRemote;
  params.isHybrid = isHybrid;

  // ─── 3. PERIOD ─────────────────────────────────────────────────────────────
  const rawPeriod = (rawParams.period || '').toLowerCase().trim();
  let period = rawPeriod;
  let seconds = TIME_PERIODS[period];

  if (!seconds) {
    const defaultPeriod = userConfig.defaultPeriod || '24h';
    if (rawPeriod) {
      warnings.push(`Período "${rawPeriod}" inválido. Usando: "${defaultPeriod}".`);
    }
    period = defaultPeriod;
    seconds = TIME_PERIODS[period] || 86400;
  }

  params.period = period;
  params.seconds = seconds;

  // ─── 4. JOB TYPE ───────────────────────────────────────────────────────────
  let rawJobTypes = rawParams.jobType || rawParams.job_type || [];
  if (typeof rawJobTypes === 'string') {
    rawJobTypes = rawJobTypes.split(',').map((s) => s.trim());
  }

  const validJobCodes = new Set(['F', 'P', 'C', 'T', 'V', 'I', 'O']);
  const jobTypeCodes = [...new Set(
    rawJobTypes
      .map((t) => JOB_TYPES[normalizeString(t)])
      .filter((code) => code && validJobCodes.has(code))
  )];
  params.jobType = jobTypeCodes;

  // ─── 5. EXPERIENCE LEVEL ───────────────────────────────────────────────────
  let rawExpLevels = rawParams.experienceLevel || rawParams.experience_level || [];
  if (typeof rawExpLevels === 'string') {
    rawExpLevels = rawExpLevels.split(',').map((s) => s.trim());
  }

  const validExpCodes = new Set(['1', '2', '3', '4', '5', '6']);
  const expLevelCodes = [...new Set(
    rawExpLevels
      .map((e) => EXPERIENCE_LEVELS[normalizeString(e)])
      .filter((code) => code && validExpCodes.has(code))
  )];
  params.experienceLevel = expLevelCodes;

  // ─── 6. WORK MODE ──────────────────────────────────────────────────────────
  let rawWorkModes = rawParams.workMode || rawParams.work_mode || [];
  if (typeof rawWorkModes === 'string') {
    rawWorkModes = rawWorkModes.split(',').map((s) => s.trim());
  }

  const validWorkCodes = new Set(['1', '2', '3']);
  const workModeCodes = [...new Set(
    rawWorkModes
      .map((w) => WORK_MODES[normalizeString(w)])
      .filter((code) => code && validWorkCodes.has(code))
  )];

  // Auto-adicionar modalidade quando detectada na localização
  if (isRemote && !workModeCodes.includes('2')) {
    workModeCodes.push('2');
  }
  if (isHybrid && !workModeCodes.includes('3')) {
    workModeCodes.push('3');
  }
  params.workMode = workModeCodes;

  // ─── 7. SORT BY ────────────────────────────────────────────────────────────
  const rawSort = normalizeString(rawParams.sortBy || rawParams.sort_by || '');
  params.sortBy = SORT_OPTIONS[rawSort] || userConfig.defaultSortBy || 'DD';

  // ─── 8. DISTANCE ───────────────────────────────────────────────────────────
  let distance = parseInt(rawParams.distance) || userConfig.defaultDistance || 25;
  if (isNaN(distance)) distance = userConfig.defaultDistance || 25;
  params.distance = Math.max(5, Math.min(100, distance));

  // ─── 9. EASY APPLY ─────────────────────────────────────────────────────────
  const rawEasy = rawParams.easyApply ?? rawParams.easy_apply;
  params.easyApply =
    rawEasy === true ||
    rawEasy === 'true' ||
    rawEasy === 'sim' ||
    rawEasy === 's';

  // ─── 10. LOW APPLICANTS ────────────────────────────────────────────────────
  const rawLow = rawParams.lowApplicants ?? rawParams.low_applicants;
  params.lowApplicants =
    rawLow === true ||
    rawLow === 'true' ||
    rawLow === 'sim' ||
    rawLow === 's';

  // ─── 11. COMPANY ───────────────────────────────────────────────────────────
  let company = rawParams.company ? String(rawParams.company).trim() : null;
  if (company) {
    company = company.slice(0, 100);
  }
  params.company = company || null;

  return { params, warnings };
}
