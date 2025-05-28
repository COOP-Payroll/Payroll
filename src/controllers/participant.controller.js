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
const participant_service_1 = __importDefault(require("../services/participant.service"));
const createParticipant = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const participant = yield participant_service_1.default.createParticipant(Object.assign(Object.assign({}, req.body), { companyId: !user.companyId }));
    res
        .status(http_status_1.default.CREATED)
        .send({ message: "Participant created", data: participant });
}));
const getAllParticipants = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const companyId = user.companyId;
    const participants = yield participant_service_1.default.getAllParticipants(companyId);
    res.send({ data: participants });
}));
const getParticipantById = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const participant = yield participant_service_1.default.getParticipantById(id);
    if (!participant) {
        res.status(http_status_1.default.NOT_FOUND).send({ message: "Participant not found" });
        return;
    }
    res.send({ data: participant });
    return;
}));
const updateParticipant = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const updated = yield participant_service_1.default.updateParticipant(id, req.body);
    res.send({ message: "Participant updated", data: updated });
}));
const deleteParticipant = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const updated = yield participant_service_1.default.deleteParticipant(id);
    res
        .status(http_status_1.default.OK)
        .send({ message: "Participant deactivated", data: updated });
}));
exports.default = {
    createParticipant,
    getAllParticipants,
    getParticipantById,
    updateParticipant,
    deleteParticipant,
};
