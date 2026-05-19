export const PERIOD_OPTIONS = [
  { label: 'Últimas 24 horas', value: '24h' },
  { label: 'Última 1 hora', value: '1h' },
  { label: 'Últimas 6 horas', value: '6h' },
  { label: 'Últimos 3 dias', value: '3d' },
  { label: 'Última semana', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
];

export const WORK_MODE_OPTIONS = [
  { label: 'Remoto', value: 'remoto' },
  { label: 'Híbrido', value: 'hibrido' },
  { label: 'Presencial', value: 'presencial' },
];

export const EXPERIENCE_OPTIONS = [
  { label: 'Estágio', value: 'estagio' },
  { label: 'Júnior', value: 'junior' },
  { label: 'Pleno', value: 'pleno' },
  { label: 'Sênior', value: 'senior' },
  { label: 'Diretoria', value: 'diretor' },
];

export const JOB_TYPE_OPTIONS = [
  { label: 'CLT (Full-time)', value: 'clt' },
  { label: 'PJ / Freelance', value: 'pj' },
  { label: 'Temporário', value: 'temporario' },
  { label: 'Estágio', value: 'estagio' },
];

export const LOCATION_OPTIONS = [
  // Default
  { label: '🌎 Brasil (Todo o País)', value: 'brasil' },
  { label: '🌐 Remoto (Qualquer Lugar)', value: 'remoto' },

  // Divider group - Principais Capitais
  { label: '── Capitais ──', value: '', disabled: true },
  { label: '📍 São Paulo, SP', value: 'sao paulo' },
  { label: '📍 Rio de Janeiro, RJ', value: 'rio de janeiro' },
  { label: '📍 Brasília, DF', value: 'brasilia' },
  { label: '📍 Belo Horizonte, MG', value: 'belo horizonte' },
  { label: '📍 Salvador, BA', value: 'salvador' },
  { label: '📍 Fortaleza, CE', value: 'fortaleza' },
  { label: '📍 Manaus, AM', value: 'manaus' },
  { label: '📍 Curitiba, PR', value: 'curitiba' },
  { label: '📍 Recife, PE', value: 'recife' },
  { label: '📍 Porto Alegre, RS', value: 'porto alegre' },
  { label: '📍 Goiânia, GO', value: 'goiania' },
  { label: '📍 Florianópolis, SC', value: 'florianopolis' },
  { label: '📍 Vitória, ES', value: 'vitoria' },

  // Outras cidades
  { label: '── Outras Cidades ──', value: '', disabled: true },
  { label: '📍 Campinas, SP', value: 'campinas' },
  { label: '📍 Santos, SP', value: 'santos' },
  { label: '📍 Osasco, SP', value: 'osasco' },
  { label: '📍 São Paulo (Cidade Exata)', value: 'sao paulo cidade' },

  // Divider group - Países (Internacional)
  { label: '── Países (Internacional) ──', value: '', disabled: true },
  { label: '🌐 Estados Unidos', value: 'estados unidos' },
  { label: '🌐 Portugal', value: 'portugal' },
  { label: '🌐 Canadá', value: 'canada' },
  { label: '🌐 Reino Unido (UK)', value: 'reino unido' },
  { label: '🌐 Irlanda', value: 'irlanda' },
  { label: '🌐 Alemanha', value: 'alemanha' },
  { label: '🌐 Espanha', value: 'espanha' },
];
