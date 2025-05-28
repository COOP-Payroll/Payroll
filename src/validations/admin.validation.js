"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/validations/admin.schema.ts
const joi_1 = __importDefault(require("joi"));
const assignPermissionsToRoleSchema = {
    params: joi_1.default.object().keys({
        roleId: joi_1.default.string().required(),
    }),
    body: joi_1.default.object().keys({
        permissions: joi_1.default.array()
            .items(joi_1.default.string().uuid().required())
            .min(1)
            .required(),
    }),
};
const createPermissionsToRoleSchema = {
    body: joi_1.default.object().keys({
        name: joi_1.default.string().required(),
        permissions: joi_1.default.array()
            .items(joi_1.default.string().uuid().required())
            .min(1)
            .required(),
    }),
};
const assignRoleToUserSchema = {
    body: joi_1.default.object().keys({
        userId: joi_1.default.string().required(),
        roleId: joi_1.default.string().required(),
    }),
};
const createDepartmentSchema = {
    body: joi_1.default.object().keys({
        deptName: joi_1.default.string().required(),
        location: joi_1.default.string(),
        shorthandRepresentation: joi_1.default.string().optional(),
    }),
};
const getDepartmentSchema = {
    params: joi_1.default.object().keys({
        id: joi_1.default.string().required(),
    }),
};
const updateDepartmentSchema = {
    params: joi_1.default.object().keys({
        id: joi_1.default.string().required(),
    }),
    body: joi_1.default.object()
        .keys({
        deptName: joi_1.default.string(),
        location: joi_1.default.string(),
        shorthandRepresentation: joi_1.default.string(),
    })
        .min(1),
};
const createRoleSchema = {
    body: joi_1.default.object().keys({
        name: joi_1.default.string(),
    }),
};
exports.default = {
    assignPermissionsToRoleSchema,
    createPermissionsToRoleSchema,
    assignRoleToUserSchema,
    createDepartmentSchema,
    getDepartmentSchema,
    updateDepartmentSchema,
    createRoleSchema,
};
