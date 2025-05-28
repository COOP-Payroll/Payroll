"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = __importDefault(require("../../middlewares/validate"));
const approve_validation_1 = __importDefault(require("../../validations/approve.validation"));
const controllers_1 = require("../../controllers");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const checkPermissions_1 = require("../../middlewares/checkPermissions");
const router = express_1.default.Router();
router
    .route("/campaigns/:campaignId/submit")
    .post((0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("create_campaign_approval"), (0, validate_1.default)(approve_validation_1.default.createCampaignForApprovalSchema), controllers_1.campaignApprovalController.createCampaignForApproval);
router
    .route("/campaigns/approve")
    .post((0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("create_campaign_approval"), (0, validate_1.default)(approve_validation_1.default.approveOrRejectCampaignStageSchema), controllers_1.campaignApprovalController.approveOrRejectCampaignStage);
router
    .route("/campaigns/:campaignId/rollback")
    .post((0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("create_campaign_approval"), (0, validate_1.default)(approve_validation_1.default.createCampaignForApprovalSchema), controllers_1.campaignApprovalController.rollbackCampaignApproval);
exports.default = router;
