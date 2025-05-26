// src/validations/account.schema.ts (recommended new file)
import Joi from "joi";

const assignMasterAccountSchema = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().label("Account ID"),
  }),
};

const updateAccountVerificationSchema = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().label("Account ID"),
  }),
  body: Joi.object().keys({
    isVerified: Joi.boolean().required().label("Verification Status"),
  }),
};

export default {
  assignMasterAccountSchema,
  updateAccountVerificationSchema,
};
