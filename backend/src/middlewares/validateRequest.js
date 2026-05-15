import { ValidationError } from '../errors/ValidationError.js';

export const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => ({ field: d.path[0], message: d.message }));
    return next(new ValidationError('Validation failed', details));
  }
  req.body = value;
  next();
};
