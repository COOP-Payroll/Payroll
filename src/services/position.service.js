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
const createPosition = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { positionName, description, companyId } = data;
    console.log(companyId);
    console.log("ddkdfkdkdk");
    if (!companyId || typeof companyId !== "string") {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Valid companyId is required");
    }
    const existing = yield client_1.default.position.findFirst({
        where: {
            positionName: data.positionName,
            companyId: data.companyId,
        },
    });
    if (existing) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Position already exists in this company");
    }
    return client_1.default.position.create({ data });
});
const getAllPositions = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.default.position.findMany({
        where: { isActive: true, companyId: companyId },
        include: {
            company: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
});
const getPositionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.default.position.findUnique({
        where: { id },
        include: {
            company: true,
            userPositions: true,
        },
    });
});
const updatePosition = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.positionName) {
        const duplicate = yield client_1.default.position.findFirst({
            where: {
                positionName: data.positionName,
                NOT: { id },
            },
        });
        if (duplicate) {
            throw new api_error_1.default(http_status_1.default.CONFLICT, "Position name must be unique");
        }
    }
    const existing = yield client_1.default.position.findUnique({ where: { id } });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Position not found");
    }
    return client_1.default.position.update({
        where: { id },
        data,
    });
});
const deletePosition = (id, companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.position.findUnique({
        where: { id, companyId },
    });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Department not found");
    }
    return client_1.default.position.update({
        where: { id },
        data: { isActive: false },
    });
});
exports.default = {
    createPosition,
    getAllPositions,
    getPositionById,
    updatePosition,
    deletePosition,
};
