// src/validations/admin.schema.ts
import Joi from 'joi';


const assignPermissionsToRoleSchema = {
  param: Joi.object().keys({
    roleId: Joi.string().required()
  }),
  body: Joi.object().keys({
    permissions: Joi.array()
    .items(Joi.string().uuid().required())
    .min(1)
    .required(),
  })
};

const createPermissionsToRoleSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    permissions: Joi.array()
    .items(Joi.string().uuid().required())
    .min(1)
    .required(),
  })
};

export default {assignPermissionsToRoleSchema, createPermissionsToRoleSchema}