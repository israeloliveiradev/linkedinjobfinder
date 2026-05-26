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
      company,
      exclusions = []
    } = params;

    // --- MANTÉM O MOTOR DO LINKEDIN EXATAMENTE IGUAL ---
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
    // ----------------------------------------------------

    // --- NOVA INTELIGÊNCIA: INDEED & GUPY (COM SMART REMOTE OVERRIDE) ---
    const isRemote = workModesArr.includes('2') || 
                     (workMode && (
                       (Array.isArray(workMode) && (workMode.includes('remoto') || workMode.includes('remote'))) ||
                       (typeof workMode === 'string' && (workMode === 'remoto' || workMode === 'remote'))
                     ));

    // 1. CONSTRUTOR INDEED
    const INDEED_LOCATION_MAP = {
      'sao paulo': 'São Paulo, SP',
      'sao paulo cidade': 'São Paulo, SP',
      'campinas': 'Campinas, SP',
      'santos': 'Santos, SP',
      'osasco': 'Osasco, SP',
      'rio de janeiro': 'Rio de Janeiro, RJ',
      'brasilia': 'Brasília, DF',
      'belo horizonte': 'Belo Horizonte, MG',
      'salvador': 'Salvador, BA',
      'fortaleza': 'Fortaleza, CE',
      'manaus': 'Manaus, AM',
      'curitiba': 'Curitiba, PR',
      'recife': 'Recife, PE',
      'porto alegre': 'Porto Alegre, RS',
      'goiania': 'Goiânia, GO',
      'florianopolis': 'Florianópolis, SC',
      'vitoria': 'Vitória, ES',
      'brasil': 'Brasil'
    };

    let indeedLoc = 'Brasil';
    if (isRemote) {
      indeedLoc = 'remoto';
    } else if (location) {
      const normLoc = location.toLowerCase().trim();
      indeedLoc = INDEED_LOCATION_MAP[normLoc] || location.replace(/\b\w/g, c => c.toUpperCase());
    }

    const indeedParams = new URLSearchParams();
    
    // 1. Construção de Query Inteligente com Negações (Exclusões + Senioridade, omitindo Anti-Spam de Consultorias)
    let indeedQuery = rawKeywords || keywords;
    if (exclusions && exclusions.length > 0) {
      const spamCompanies = ['BairesDev', 'Crossover', 'Turing', 'GeekHunter', 'Belvo', 'Epic'];
      const uniqueExclusions = [...new Set(exclusions)].filter(term => !spamCompanies.includes(term));
      
      if (uniqueExclusions.length > 0) {
        const formattedNegatives = uniqueExclusions.map(term => ` -"${term}"`).join('');
        indeedQuery += formattedNegatives;
      }
    }
    indeedParams.append('q', indeedQuery);
    
    // Smart Remote Override: se for remoto, busca em nível nacional ('remoto')
    indeedParams.append('l', indeedLoc);

    // Mapeamento de Job Types (Contrato) para Indeed
    const INDEED_JOB_TYPES = {
      clt: 'fulltime',
      'full-time': 'fulltime',
      fulltime: 'fulltime',
      'part-time': 'parttime',
      pj: 'contract',
      freelance: 'contract',
      contract: 'contract',
      temporario: 'temporary',
      estagio: 'internship',
      internship: 'internship',
    };
    // Multi-select: Injeta todos os contratos selecionados na URL
    if (jobTypesArr.length) {
      jobTypesArr.forEach(t => {
        const code = t && INDEED_JOB_TYPES[t.toLowerCase()];
        if (code) indeedParams.append('jt', code);
      });
    }

    // Mapeamento de Nível de Experiência para Indeed (explvl)
    const INDEED_EXP_LEVELS = {
      estagio: 'entry_level',
      intern: 'entry_level',
      junior: 'entry_level',
      pleno: 'mid_level',
      mid: 'mid_level',
      senior: 'senior_level',
    };
    // Multi-select: Injeta todos os níveis de experiência selecionados na URL
    if (experienceLevelsArr.length) {
      experienceLevelsArr.forEach(l => {
        const code = l && INDEED_EXP_LEVELS[l.toLowerCase()];
        if (code) indeedParams.append('explvl', code);
      });
    }

    // Mapeamento de período de tempo para Indeed (fromage em dias)
    const indeedTimeMap = {
      '30min': 1, '1h': 1, '2h': 1, '3h': 1, '6h': 1, '12h': 1,
      '24h': 1, '2d': 2, '3d': 3, '7d': 7, '14d': 14, '30d': 30,
    };
    const fromageVal = indeedTimeMap[period] || 3; // Padrão 3 dias se não especificado
    indeedParams.append('fromage', fromageVal);

    // Ordenação e Distância
    indeedParams.append('sort', sortCode === 'DD' ? 'date' : 'relevance');
    if (distance) indeedParams.append('radius', distance);

    const indeedUrl = `https://br.indeed.com/jobs?${indeedParams.toString()}`;

    // 2. CONSTRUTOR GUPY (ESTRUTURA HACK SPA PORTAL)
    const GUPY_STATE_MAP = {
      'sao paulo': 'São Paulo',
      'sao paulo cidade': 'São Paulo',
      'campinas': 'São Paulo',
      'santos': 'São Paulo',
      'osasco': 'São Paulo',
      'rio de janeiro': 'Rio de Janeiro',
      'brasilia': 'Distrito Federal',
      'belo horizonte': 'Minas Gerais',
      'salvador': 'Bahia',
      'fortaleza': 'Ceará',
      'manaus': 'Amazonas',
      'curitiba': 'Paraná',
      'recife': 'Pernambuco',
      'porto alegre': 'Rio Grande do Sul',
      'goiania': 'Goiás',
      'florianopolis': 'Santa Catarina',
      'vitoria': 'Espírito Santo'
    };

    let gupyState = null;
    if (location) {
      const normLoc = location.toLowerCase().trim();
      gupyState = GUPY_STATE_MAP[normLoc] || location.replace(/\b\w/g, c => c.toUpperCase());
    }

    const gupyParts = [];
    gupyParts.push('sortBy=publishedDate');
    gupyParts.push('sortOrder=desc');
    gupyParts.push(`term=${encodeURIComponent(rawKeywords || keywords)}`);

    // Smart Remote Override: se for remoto, remove state/city físico para buscar nacional
    if (!isRemote && gupyState && location.toLowerCase() !== 'brasil') {
      gupyParts.push(`state=${encodeURIComponent(gupyState)}`);
    }

    if (isRemote) {
      gupyParts.push('workplaceTypes[]=remote');
    } else {
      if (workModesArr.includes('3') || (workMode && (workMode.includes('hibrido') || workMode.includes('hybrid')))) {
        gupyParts.push('workplaceTypes[]=hybrid');
      } else if (workModesArr.includes('1') || (workMode && (workMode.includes('presencial') || workMode.includes('onsite')))) {
        gupyParts.push('workplaceTypes[]=on-site');
      }
    }

    const gupyUrl = `https://portal.gupy.io/job-search/${gupyParts.join('&')}`;
    // ---------------------------------------------------------------------

    return {
      main: `${baseUrl}?${searchParams.toString()}`,
      express: `${baseUrl}?${searchParams.toString()}&f_AL=true`,
      fallback1h: buildWithPeriod(3600),
      fallback24h: buildWithPeriod(86400),
      fallback3d: buildWithPeriod(259200),
      postsVaga: buildPostUrl('vaga', rawKeywords || keywords),
      postsHiring: buildPostUrl('contratando', rawKeywords || keywords),
      postsCurriculo: buildPostUrl('curriculo', rawKeywords || keywords),
      indeed: indeedUrl,
      gupy: gupyUrl
    };
  }
}
