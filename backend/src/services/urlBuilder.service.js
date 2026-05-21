import { GEO_IDS } from '../constants/geoIds.js';
import { JOB_TYPES, EXPERIENCE_LEVELS, WORK_MODES, SORT_OPTIONS } from '../constants/filters.js';
import { TIME_PERIODS } from '../constants/timePeriods.js';


// Normaliza acentos e caixa para garantir match no dicionário de geoIds
const normalizeLocation = (str) =>
  str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

export class UrlBuilderService {
  build(params) {
    const {
      keywords,
      rawKeywords,
      location,
      geoId,
      period,
      jobType,
      experienceLevel,
      workMode,
      sortBy,
      distance,
      easyApply,
      lowApplicants,
      company
    } = params;

    const baseUrl = 'https://www.linkedin.com/jobs/search/';
    const searchParams = new URLSearchParams();

    searchParams.append('keywords', keywords);

    const locationKey = normalizeLocation(location || 'brasil');
    const finalGeoId = geoId || GEO_IDS[locationKey] || GEO_IDS[normalizeLocation(location || '')] || GEO_IDS['brasil'];
    console.log(`[UrlBuilder] 🌍 Location: "${location}" (key: "${locationKey}") -> GeoID: ${finalGeoId}`);
    searchParams.append('geoId', finalGeoId);

    const periodSeconds = TIME_PERIODS[period] || 86400;
    searchParams.append('f_TPR', `r${periodSeconds}`);

    const ensureArray = (val) => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    };

    const jobTypesArr = ensureArray(jobType);
    if (jobTypesArr.length) {
      const codes = jobTypesArr.map(t => t && JOB_TYPES[t.toLowerCase()]).filter(Boolean);
      if (codes.length) searchParams.append('f_JT', codes.join(','));
    }

    const experienceLevelsArr = ensureArray(experienceLevel);
    if (experienceLevelsArr.length) {
      const codes = experienceLevelsArr.map(l => l && EXPERIENCE_LEVELS[l.toLowerCase()]).filter(Boolean);
      if (codes.length) searchParams.append('f_E', codes.join(','));
    }

    const workModesArr = ensureArray(workMode);
    if (workModesArr.length) {
      const codes = workModesArr.map(m => m && WORK_MODES[m.toLowerCase()]).filter(Boolean);
      if (codes.length) searchParams.append('f_WT', codes.join(','));
    }

    const sortCode = SORT_OPTIONS[(sortBy || 'recente').toLowerCase()] || 'DD';
    searchParams.append('sortBy', sortCode);

    if (distance) searchParams.append('distance', distance);
    if (easyApply) searchParams.append('f_AL', 'true');
    if (lowApplicants) searchParams.append('f_JIYN', 'true');
    if (company) searchParams.append('f_C', company);

    const buildWithPeriod = (seconds) => {
      const p = new URLSearchParams(searchParams);
      p.set('f_TPR', `r${seconds}`);
      return `${baseUrl}?${p.toString()}`;
    };

    // Make a flat, parenthesis-free keyword search query that is 100% bulletproof for LinkedIn content search URL.
    const makeFlatQuery = (prefix, rawStr) => {
      if (!rawStr) return `"${prefix}"`;
      const stopWords = new Set(['de', 'para', 'em', 'a', 'o', 'com', 'e', 'do', 'da']);
      const words = rawStr
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-zA-Z0-9\s]/g, '') // remove special chars
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 1 && !stopWords.has(w));
      
      const quotedWords = words.map(w => `"${w}"`);
      return `"${prefix}" ${quotedWords.join(' ')}`;
    };

    const postSearchBaseUrl = 'https://www.linkedin.com/search/results/content/';

    const buildPostUrl = (prefix, rawStr) => {
      const q = makeFlatQuery(prefix, rawStr);
      const p = new URLSearchParams();
      p.append('keywords', q);
      p.append('datePosted', '"past-24h"');
      p.append('sortBy', '"date_posted"');
      return `${postSearchBaseUrl}?${p.toString()}`;
    };

    return {
      main: `${baseUrl}?${searchParams.toString()}`,
      express: `${baseUrl}?${searchParams.toString()}&f_AL=true`,
      fallback1h: buildWithPeriod(3600),
      fallback24h: buildWithPeriod(86400),
      fallback3d: buildWithPeriod(259200),
      postsVaga: buildPostUrl('vaga', rawKeywords || keywords),
      postsHiring: buildPostUrl('contratando', rawKeywords || keywords),
      postsCurriculo: buildPostUrl('curriculo', rawKeywords || keywords)
    };
  }
}
