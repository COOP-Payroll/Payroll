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
const http_status_1 = __importDefault(require("http-status"));
const client_1 = __importDefault(require("../client"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const crypto_1 = __importDefault(require("crypto"));
const createPayment = (campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    const campaignParticipants = yield client_1.default.campaignParticipant.findMany({
        where: { campaignId },
        include: { campaign: { select: { name: true } } },
    });
    if (!campaignParticipants || campaignParticipants.length === 0) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Campign has no Participants");
    }
    const bulkId = crypto_1.default.randomUUID();
    const name = `${campaignParticipants[0].campaign.name}Transaction`;
    // const transaction = await prisma.transa
    const fixedData = campaignParticipants.map((campaignParticipant) => {
        return {};
    });
});
