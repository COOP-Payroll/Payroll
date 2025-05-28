"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const createParticipant = {
    body: joi_1.default.object({
        fullName: joi_1.default.string().trim().required().messages({
            "any.required": "Full name is required",
            "string.empty": "Full name cannot be empty",
        }),
        gender: joi_1.default.string().valid("MALE", "FEMALE").required().messages({
            "any.only": "Gender must be either MALE or FEMALE",
            "any.required": "Gender is required",
        }),
        address: joi_1.default.string().allow(null, "").optional(),
        detail: joi_1.default.string().allow(null, "").optional(),
    }),
};
const updateParticipant = {
    body: joi_1.default.object({
        fullName: joi_1.default.string().trim().optional(),
        gender: joi_1.default.string().valid("MALE", "FEMALE").optional(),
        address: joi_1.default.string().allow(null, "").optional(),
        phoneNumber: joi_1.default.string().allow(null, "").optional(),
        accountNumber: joi_1.default.string().allow(null, "").optional(),
        paymentMethod: joi_1.default.string()
            .valid("CASH", "BANK_TRANSFER", "MOBILE_MONEY")
            .optional(),
        detail: joi_1.default.string().allow(null, "").optional(),
        isVerified: joi_1.default.boolean().optional(),
    }),
};
exports.default = {
    createParticipant,
    updateParticipant,
};
