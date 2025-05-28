"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/validations/account.schema.ts (recommended new file)
const joi_1 = __importDefault(require("joi"));
const assignMasterAccountSchema = {
    params: joi_1.default.object().keys({
        id: joi_1.default.string().uuid().required().label("Account ID"),
    }),
};
const updateAccountVerificationSchema = {
    params: joi_1.default.object().keys({
        id: joi_1.default.string().uuid().required().label("Account ID"),
    }),
    body: joi_1.default.object().keys({
        isVerified: joi_1.default.boolean().required().label("Verification Status"),
    }),
};
exports.default = {
    assignMasterAccountSchema,
    updateAccountVerificationSchema,
};
