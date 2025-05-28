"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const createUser = {
    body: joi_1.default.object().keys({
        roleId: joi_1.default.string().required(),
        // password: Joi.string().required().custom(password),
        name: joi_1.default.string().required(),
        phoneNumber: joi_1.default.string()
            .regex(/^[0-9]{10}$/)
            .messages({
            "string.pattern.base": "Phone number must be 10 digits.",
        })
            .required(),
        // role: Joi.string().required().valid(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.SUPERADMIN),
        departmentId: joi_1.default.string().required(),
        positionId: joi_1.default.string().required(),
        // companyId: Joi.string().required(),
    }),
};
const getUsers = {
    query: joi_1.default.object().keys({
        name: joi_1.default.string(),
        // role: Joi.string(),
        sortBy: joi_1.default.string(),
        limit: joi_1.default.number().integer(),
        page: joi_1.default.number().integer(),
    }),
};
const getUserSchema = {
    params: joi_1.default.object().keys({
        userId: joi_1.default.string().required(),
    }),
};
exports.default = {
    createUser,
    getUsers,
    getUserSchema,
};
