import Joi from "joi";

const createRateSetting = {
  body: Joi.object({
    urbanRate: Joi.number().required(),
    ruralRate: Joi.number().required(),
    //companyId: Joi.string().uuid().required(),
  }),
};

const updateRateSetting = {
  body: Joi.object({
    urbanRate: Joi.number(),
    ruralRate: Joi.number(),
  }),
};

export default {
  createRateSetting,
  updateRateSetting,
};
