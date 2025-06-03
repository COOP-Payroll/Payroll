import express from "express";
import validate from "../../middlewares/validate";
import fetchCampaignReportValidation from "../../validations/report.validation";
import { campaignReportController } from "../../controllers";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";

const router = express.Router();

router
  .route("/campaigns/:campaignId/fetchCampaignReport")
  .get(
    auth(),
    checkPermission("view_campaign_reports"),
    validate(fetchCampaignReportValidation.fetchCampaignReportSchema),
    campaignReportController.fetchCampaignReport
  );

router.route("/campaigns/:campaignId/downloadCampaignReport").get(
  // auth(),
  //   checkPermission("view_campaign_reports"),
  validate(fetchCampaignReportValidation.fetchCampaignReportSchema),
  campaignReportController.downloadCampaignReport
);

export default router;
