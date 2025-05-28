"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const createDepartment = {
    body: joi_1.default.object().keys({
        deptName: joi_1.default.string().trim().required().messages({
            "any.required": "Department name is required",
            "string.empty": "Department name cannot be empty",
        }),
        location: joi_1.default.string().trim().optional(),
        shorthandRepresentation: joi_1.default.string().trim().optional(),
        companyId: joi_1.default.string().guid({ version: "uuidv4" }).required().messages({
            "any.required": "Company ID is required",
            "string.guid": "Company ID must be a valid UUID",
        }),
    }),
};
exports.default = {
    createDepartment,
};
