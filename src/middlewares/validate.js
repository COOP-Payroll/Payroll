"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const pick_1 = __importDefault(require("../utils/pick"));
const joi_1 = __importDefault(require("joi"));
const validate = (schema) => (req, res, next) => {
    const validSchema = (0, pick_1.default)(schema, ["params", "query", "body"]);
    const requestData = (0, pick_1.default)(req, Object.keys(validSchema));
    if (Object.keys(validSchema).length === 0) {
        return next();
    }
    const { value, error } = joi_1.default.compile(validSchema)
        .prefs({ errors: { label: "key" }, abortEarly: false })
        .validate(requestData);
    if (error) {
        const details = error.details.map((detail) => ({
            message: detail.message,
            path: detail.path,
        }));
        console.log("validatio", details);
        return next(new api_error_1.default(http_status_1.default.BAD_REQUEST, "Validation Error", false, details));
    }
    Object.assign(req, value);
    return next();
};
exports.default = validate;
