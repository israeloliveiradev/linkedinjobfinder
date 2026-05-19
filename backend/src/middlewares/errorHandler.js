import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error stack to console for debugging
  console.error('❌ Error caught by global handler:', err);

  const response = {
    success: false,
    error: {
      message,
      code: err.constructor.name,
      details: err.details || undefined,
    },
  };

  if (config.nodeEnv === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
