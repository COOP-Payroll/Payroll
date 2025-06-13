import express from "express";
// import { paymentController } from "../../controllers";
import paymentController from "../../controllers/payment.controller";
import campaignValidation from "../../validations/approve.validation";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";
import validate from "../../middlewares/validate";

const router = express.Router();

router
  .route("/:campaignId")

  .get(
    auth(),
    checkPermission("view_campaign_payment"),
    validate(campaignValidation.createCampaignForApprovalSchema),
    paymentController.getPaymentsByCampaignId
  )
  .post(
    auth(),
    checkPermission("create_campaign_payment"),
    validate(campaignValidation.createCampaignForApprovalSchema),
    paymentController.processPayment
  );

export default router;
