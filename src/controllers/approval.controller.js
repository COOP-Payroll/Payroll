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
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const approval_service_1 = __importDefault(require("../services/approval.service"));
const createCampaignForApproval = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { campaignId } = req.params;
    yield approval_service_1.default.createCampaignForApproval(campaignId);
    res.status(http_status_1.default.CREATED).send({
        // data: campaignForApproval,
        message: "Campaign submitted for approval successfully",
    });
}));
const approveOrRejectCampaignStage = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { campaignId, action } = req.body;
    const user = req.user;
    const approveOrRejectCampaign = yield approval_service_1.default.approveOrRejectCampaignStage(campaignId, user, action);
    res.status(http_status_1.default.CREATED).send({
        data: [],
        message: approveOrRejectCampaign,
    });
}));
const rollbackCampaignApproval = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { campaignId } = req.params;
    const user = req.user;
    yield approval_service_1.default.rollbackCampaignApproval(campaignId, user);
    res.status(http_status_1.default.CREATED).send({
        message: "Campaign approval revoked successfully",
    });
}));
exports.default = {
    createCampaignForApproval,
    approveOrRejectCampaignStage,
    rollbackCampaignApproval,
};
