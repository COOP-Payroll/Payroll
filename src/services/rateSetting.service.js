"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../client"));
const http_status_1 = __importDefault(require("http-status"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const createRateSetting = (data, companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const { urbanRate, ruralRate } = data;
    console.log("djhdjfdjfhdjjs");
    console.log(companyId);
    // Check if a RateSetting already exists for the company
    const existing = yield client_1.default.rateSetting.findUnique({
        where: { companyId },
    });
    if (existing) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "RateSetting already exists for this company");
    }
    return client_1.default.rateSetting.create({
        data: {
            urbanRate,
            ruralRate,
            companyId,
        },
    });
});
const getAllRateSettings = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.default.rateSetting.findMany({
        where: {
            companyId,
        },
        // include: {
        //   company: true,
        // },
        orderBy: {
            createdAt: "desc",
        },
    });
});
const getRateSettingByCompanyId = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.default.rateSetting.findUnique({
        where: { companyId },
        include: { company: true },
    });
});
const updateRateSetting = (companyId, id, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const existing = yield client_1.default.rateSetting.findUnique({
        where: { id, companyId },
    });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "RateSetting not found");
    }
    // Deactivate the current setting
    yield client_1.default.rateSetting.update({
        where: { id },
        data: { isActive: false },
    });
    // Create a new active setting with the updated data
    return client_1.default.rateSetting.create({
        data: {
            urbanRate: (_a = data.urbanRate) !== null && _a !== void 0 ? _a : existing.urbanRate,
            ruralRate: (_b = data.ruralRate) !== null && _b !== void 0 ? _b : existing.ruralRate,
            companyId,
            isActive: true,
        },
    });
});
exports.default = {
    createRateSetting,
    getAllRateSettings,
    updateRateSetting,
};
