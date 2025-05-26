// src/validations/account.schema.ts (recommended new file)
import Joi from 'joi';

const assignMasterAccountSchema = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().label('Account ID'),
  }),
};

export default {
  assignMasterAccountSchema,
};
