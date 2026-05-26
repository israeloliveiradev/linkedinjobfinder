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
