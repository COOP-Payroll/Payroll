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
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const http_status_1 = __importDefault(require("http-status"));
const position_service_1 = __importDefault(require("../services/position.service"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const createPosition = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user.companyId) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "User must be associated with a company to create departments");
    }
    const position = yield position_service_1.default.createPosition(Object.assign(Object.assign({}, req.body), { companyId: user.companyId }));
    res
        .status(http_status_1.default.CREATED)
        .send({ message: "Position created", data: position });
}));
const getAllPositions = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const positions = yield position_service_1.default.getAllPositions(user.companyId);
    res.send({ data: positions });
}));
const getPositionById = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const position = yield position_service_1.default.getPositionById(id);
    if (!position) {
        res.status(http_status_1.default.NOT_FOUND).send({ message: "Position not found" });
        return;
    }
    res.send({ data: position });
}));
const updatePosition = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const position = yield position_service_1.default.updatePosition(id, req.body);
    res.send({ message: "Position updated", data: position });
}));
const deletePosition = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const user = req.user;
    const companyId = user.companyId;
    const updated = yield position_service_1.default.deletePosition(id, companyId);
    res
        .status(http_status_1.default.OK)
        .send({ message: "Position deactivated", data: updated });
}));
exports.default = {
    createPosition,
    getAllPositions,
    getPositionById,
    updatePosition,
    deletePosition,
};
