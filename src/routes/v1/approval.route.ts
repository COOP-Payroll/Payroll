import express from "express";
import validate from "../../middlewares/validate";
import approvalValidation from "../../validations/approve.validation";
import { campaignApprovalController } from "../../controllers";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";

const router = express.Router();

router
  .route("/campaigns/:campaignId/submit")
  .post(
    auth(),
    checkPermission("create_campaign_approval"),
    validate(approvalValidation.createCampaignForApprovalSchema),
    campaignApprovalController.createCampaignForApproval
  );

router
  .route("/campaigns/approve")
  .post(
    auth(),
    checkPermission("create_campaign_approval"),
    validate(approvalValidation.approveOrRejectCampaignStageSchema),
    campaignApprovalController.approveOrRejectCampaignStage
  );

router
  .route("/campaigns/rollback")
  .post(
    auth(),
    checkPermission("create_campaign_approval"),
    validate(approvalValidation.createCampaignForApprovalSchema),
    campaignApprovalController.rollbackCampaignApproval
  );

export default router;
