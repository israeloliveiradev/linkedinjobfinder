/**
 * constants.js — Mapas, códigos e constantes globais do LinkedIn Job Finder
 * Centraliza todos os dados de referência para evitar duplicação.
 */

// ─────────────────────────────────────────────────────────────────────────────
// GEO IDS — mapeamento de localização normalizada para ID geográfico do LinkedIn
// Chaves em lowercase sem acentos (via normalizeString)
// ─────────────────────────────────────────────────────────────────────────────
export const GEO_IDS = {
  // BRASIL — PAÍS
  brasil: '106057199',
  brazil: '106057199',

  // CAPITAIS E PRINCIPAIS CIDADES
  'sao paulo': '101282393',
  sp: '101282393',
  'rio de janeiro': '100023439',
  rj: '100023439',
  'belo horizonte': '100877540',
  bh: '100877540',
  curitiba: '101703915',
  cwb: '101703915',
  'porto alegre': '101581926',
  poa: '101581926',
  brasilia: '100364837',
  df: '100364837',
  salvador: '100179879',
  ssa: '100179879',
  fortaleza: '101065158',
  recife: '100393800',
  manaus: '100560539',
  goiania: '101486310',
  campinas: '100642161',
  florianopolis: '100243797',
  vitoria: '101009318',
  natal: '102044279',
  maceio: '100706882',
  'joao pessoa': '101237533',
  teresina: '101165560',
  'campo grande': '101082067',
  cuiaba: '101318387',
  belem: '100172711',
  macapa: '100227943',
  'porto velho': '100710783',
  'boa vista': '100680256',
  palmas: '101559911',
  'rio branco': '100683863',
  aracaju: '100172705',
  'sao luis': '100393024',
  londrina: '101588870',
  joinville: '101730680',
  uberlandia: '100994360',
  'ribeirao preto': '101437931',
  sorocaba: '101563475',
  santos: '101467371',
  'sao jose dos campos': '100786332',
  'mogi das cruzes': '101407684',
  osasco: '101427082',
  'santo andre': '101453764',

  // INTERNACIONAIS
  portugal: '100364837',
  canada: '101174742',
  argentina: '100446943',
  chile: '104621616',
  mexico: '103323778',
  colombia: '100876405',
  'reino unido': '101165590',
  uk: '101165590',
  alemanha: '101282230',
  germany: '101282230',
  espanha: '105646813',
  spain: '105646813',
  franca: '105015875',
  france: '105015875',
  'estados unidos': '103644278',
  eua: '103644278',
  usa: '103644278',
  'united states': '103644278',
  'new york': '105080838',
  california: '102095887',
  florida: '101318387',
  texas: '102748797',
  australia: '101452733',
  india: '102713980',
  irlanda: '104738515',
  ireland: '104738515',
  holanda: '102890719',
  netherlands: '102890719',
  suecia: '105117694',
  sweden: '105117694',

  // Modalidades sem geoId — tratadas separadamente pelo validator
  remoto: null,
  remote: null,
  hibrido: null,
  hybrid: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// TIME PERIODS — período de publicação (em segundos)
// ─────────────────────────────────────────────────────────────────────────────
export const TIME_PERIODS = {
  '30min': 1800,
  '1h': 3600,
  '2h': 7200,
  '3h': 10800,
  '6h': 21600,
  '12h': 43200,
  '24h': 86400,
  '2d': 172800,
  '3d': 259200,
  '7d': 604800,
  '14d': 1209600,
  '30d': 2592000,
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB TYPES — tipo de contrato → código LinkedIn
// ─────────────────────────────────────────────────────────────────────────────
export const JOB_TYPES = {
  clt: 'F',
  'full-time': 'F',
  integral: 'F',
  fulltime: 'F',
  'part-time': 'P',
  parcial: 'P',
  'meio periodo': 'P',
  pj: 'C',
  freelance: 'C',
  contract: 'C',
  contrato: 'C',
  autonomo: 'C',
  temporario: 'T',
  temporary: 'T',
  temp: 'T',
  voluntario: 'V',
  volunteer: 'V',
  estagio: 'I',
  internship: 'I',
  intern: 'I',
  trainee: 'I',
  outro: 'O',
  other: 'O',
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIENCE LEVELS — nível de experiência → código LinkedIn
// ─────────────────────────────────────────────────────────────────────────────
export const EXPERIENCE_LEVELS = {
  estagio: '1',
  internship: '1',
  intern: '1',
  junior: '2',
  entry: '2',
  entrada: '2',
  jr: '2',
  pleno: '3',
  associate: '3',
  mid: '3',
  senior: '4',
  'mid-senior': '4',
  sr: '4',
  diretor: '5',
  director: '5',
  executivo: '6',
  executive: '6',
  'c-level': '6',
  vp: '6',
  ceo: '6',
  cto: '6',
  cfo: '6',
};

// ─────────────────────────────────────────────────────────────────────────────
// WORK MODES — modalidade de trabalho → código LinkedIn
// ─────────────────────────────────────────────────────────────────────────────
export const WORK_MODES = {
  presencial: '1',
  onsite: '1',
  'on-site': '1',
  escritorio: '1',
  remoto: '2',
  remote: '2',
  hibrido: '3',
  hybrid: '3',
  flexivel: '3',
};

// ─────────────────────────────────────────────────────────────────────────────
// SORT OPTIONS — ordenação dos resultados → código LinkedIn
// ─────────────────────────────────────────────────────────────────────────────
export const SORT_OPTIONS = {
  recente: 'DD',
  data: 'DD',
  recent: 'DD',
  date: 'DD',
  novo: 'DD',
  'mais novo': 'DD',
  dd: 'DD',
  relevancia: 'R',
  relevance: 'R',
  r: 'R',
};

// ─────────────────────────────────────────────────────────────────────────────
// BOOLEAN OPERATORS — detecção de operadores booleanos nas keywords
// Se detectado, NÃO fazer encodeURIComponent nos operadores (OR/AND/NOT)
// ─────────────────────────────────────────────────────────────────────────────
export const BOOLEAN_OPERATORS = {
  HAS_BOOLEAN: /\b(OR|AND|NOT)\b/,
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT CONFIG — configuração padrão da aplicação
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_CONFIG = {
  defaultLocation: 'brasil',
  defaultPeriod: '24h',
  defaultSortBy: 'DD',
  defaultDistance: 25,
  maxHistory: 100,
  maxPresets: 50,
  autoOpenBrowser: false,
  expandKeywords: true,
  debugMode: false,
};
