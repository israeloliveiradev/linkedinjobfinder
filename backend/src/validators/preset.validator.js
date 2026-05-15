import Joi from 'joi';

export const presetSchema = Joi.object({
  name: Joi.string().required().min(1).max(50),
  params: Joi.object().required(),
});
