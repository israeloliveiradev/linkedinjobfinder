import { config } from './env.js';

const allowedOrigins = [
  config.allowedOrigin,
  'https://vagas.rankia.cloud',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);
 
export const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};
