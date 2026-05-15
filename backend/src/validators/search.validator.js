import Joi from 'joi';

export const searchSchema = Joi.object({
  query: Joi.string().required().min(3).max(500),
  expandKeywords: Joi.boolean().default(true),
  manualFilters: Joi.object().optional().keys({
    period: Joi.string().optional(),
    location: Joi.string().optional(),
    workModes: Joi.array().items(Joi.string()).optional(),
    experienceLevels: Joi.array().items(Joi.string()).optional(),
    jobTypes: Joi.array().items(Joi.string()).optional(),
  }),
});
