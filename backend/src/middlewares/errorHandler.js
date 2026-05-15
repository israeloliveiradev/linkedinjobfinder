import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  const response = {
    success: false,
    error: {
      message,
      code: err.constructor.name,
      details: err.details || undefined,
    },
  };

  if (env.nodeEnv === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
