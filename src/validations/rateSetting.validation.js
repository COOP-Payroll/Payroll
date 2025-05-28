"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const createRateSetting = {
    body: joi_1.default.object({
        urbanRate: joi_1.default.number().required(),
        ruralRate: joi_1.default.number().required(),
        //companyId: Joi.string().uuid().required(),
    }),
};
const updateRateSetting = {
    body: joi_1.default.object({
        urbanRate: joi_1.default.number(),
        ruralRate: joi_1.default.number(),
    }),
};
exports.default = {
    createRateSetting,
    updateRateSetting,
};
