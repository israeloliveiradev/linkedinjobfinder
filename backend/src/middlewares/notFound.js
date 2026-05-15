import { NotFoundError } from '../errors/NotFoundError.js';

export const notFound = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};
