// src/validations/admin.schema.ts
import Joi from "joi";

const assignPermissionsToRoleSchema = {
  params: Joi.object().keys({
    roleId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    permissions: Joi.array()
      .items(Joi.string().uuid().required())
      .min(1)
      .required(),
  }),
};

const createPermissionsToRoleSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    permissions: Joi.array()
      .items(Joi.string().uuid().required())
      .min(1)
      .required(),
  }),
};

const assignRoleToUserSchema = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    roleId: Joi.string().required(),
  }),
};

const createDepartmentSchema = {
  body: Joi.object().keys({
    deptName: Joi.string().required(),
    location: Joi.string(),
    shorthandRepresentation: Joi.string().required(),
    companyId: Joi.string().required(),
  }),
};

const getDepartmentSchema = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const updateDepartmentSchema = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      deptName: Joi.string(),
      location: Joi.string(),
      shorthandRepresentation: Joi.string(),
    })
    .min(1),
};

const createRoleSchema = {
  body: Joi.object().keys({
    name: Joi.string(),
  }),
};

export default {
  assignPermissionsToRoleSchema,
  createPermissionsToRoleSchema,
  assignRoleToUserSchema,
  createDepartmentSchema,
  getDepartmentSchema,
  updateDepartmentSchema,
  createRoleSchema,
};
