import rateLimit from 'express-rate-limit';
import { config } from './env.js';

export const globalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.nodeEnv === 'development' ? 1000 : config.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

export const copilotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: config.nodeEnv === 'development' ? 1000 : 10, // Max 10 requests
  message: {
    success: false,
    error: {
      message: 'Muitas análises de IA em sequência. Por favor, aguarde alguns minutos antes de analisar a próxima vaga.',
      code: 'COPILOT_RATE_LIMIT_EXCEEDED',
    },
  },
});
