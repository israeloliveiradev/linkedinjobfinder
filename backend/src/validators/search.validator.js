import Joi from 'joi';

export const searchSchema = Joi.object({
  query: Joi.string().required().min(3).max(500),
  expandKeywords: Joi.boolean().default(true),
  manualFilters: Joi.object().optional().keys({
    period: Joi.string().optional().allow(''),
    location: Joi.string().optional().allow(''),
    workModes: Joi.array().items(Joi.string()).optional(),
    experienceLevels: Joi.array().items(Joi.string()).optional(),
    jobTypes: Joi.array().items(Joi.string()).optional(),
    antiSpam: Joi.boolean().optional(),
    negativeKeywords: Joi.string().optional().allow(''),
    minRating: Joi.string().optional().allow(''),
  }),
});
