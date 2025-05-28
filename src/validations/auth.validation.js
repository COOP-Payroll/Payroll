"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const login = {
    body: joi_1.default.object().keys({
        username: joi_1.default.string().required(),
        password: joi_1.default.string().required(),
    }),
};
const logout = {
    body: joi_1.default.object().keys({
        refreshToken: joi_1.default.string().required(),
    }),
};
const forgotPassword = {
    body: joi_1.default.object().keys({
        username: joi_1.default.string().required(),
    }),
};
exports.default = {
    login,
    logout,
    forgotPassword,
};
