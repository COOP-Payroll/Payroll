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

export default router;
