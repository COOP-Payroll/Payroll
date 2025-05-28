"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const createCampaignForApprovalSchema = {
    params: joi_1.default.object({
        campaignId: joi_1.default.string()
            .required()
            .description("Campaign ID associated with the flow"),
    }),
};
const approveOrRejectCampaignStageSchema = {
    body: joi_1.default.object({
        campaignId: joi_1.default.string()
            .required()
            .description("Campaign ID associated with the flow"),
        action: joi_1.default.string().required().description("Action is required"),
    }),
};
exports.default = {
    createCampaignForApprovalSchema,
    approveOrRejectCampaignStageSchema,
};
