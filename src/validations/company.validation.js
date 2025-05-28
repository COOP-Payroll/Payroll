"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const joi_1 = __importDefault(require("joi"));
const createCompany = {
    body: joi_1.default.object().keys({
        email: joi_1.default.string().email(),
        organizationName: joi_1.default.string().required(),
        phoneNumber: joi_1.default.string()
            .regex(/^[0-9]{10}$/)
            .messages({
            "string.pattern.base": "Phone number must be 10 digits.",
        })
            .required(),
        companyCode: joi_1.default.string().required(),
        notes: joi_1.default.string(),
        level: joi_1.default.string().valid(client_1.Level.MOHHEAD, client_1.Level.REGION),
    }),
};
const updateCompany = {
    body: joi_1.default.object().keys({
        email: joi_1.default.string().email(),
        organizationName: joi_1.default.string().required(),
        phoneNumber: joi_1.default.string()
            .regex(/^[0-9]{10}$/)
            .messages({
            "string.pattern.base": "Phone number must be 10 digits.",
        })
            .required(),
        companyCode: joi_1.default.string().required(),
        notes: joi_1.default.string(),
        level: joi_1.default.string().valid(client_1.Level.MOHHEAD, client_1.Level.REGION),
    }),
};
exports.default = {
    createCompany,
    updateCompany
};
