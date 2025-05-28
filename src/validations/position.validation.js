"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const createPosition = {
    body: joi_1.default.object().keys({
        positionName: joi_1.default.string().trim().required().messages({
            "any.required": "Position name is required",
            "string.empty": "Position name cannot be empty",
        }),
        description: joi_1.default.string().trim().optional(),
    }),
};
const updatePosition = {
    body: joi_1.default.object()
        .keys({
        positionName: joi_1.default.string().trim().optional().messages({
            "string.empty": "Position name cannot be empty",
        }),
        description: joi_1.default.string().trim().optional(),
        companyId: joi_1.default.string().guid({ version: "uuidv4" }).optional().messages({
            "string.guid": "Company ID must be a valid UUID",
        }),
        isActive: joi_1.default.boolean().optional(),
    })
        .min(1)
        .messages({
        "object.min": "At least one field must be updated",
    }),
};
const getOrDeletePosition = {
    params: joi_1.default.object().keys({
        id: joi_1.default.string().guid({ version: "uuidv4" }).required().messages({
            "any.required": "Position ID is required",
            "string.guid": "Position ID must be a valid UUID",
        }),
    }),
};
exports.default = {
    createPosition,
    updatePosition,
    getOrDeletePosition,
};
