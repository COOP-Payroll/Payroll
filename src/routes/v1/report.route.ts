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

// router.route("/campaigns/:campaignId/downloadCampaignReport").get(
//   auth(),
//   //   checkPermission("view_campaign_reports"),
//   validate(fetchCampaignReportValidation.fetchCampaignReportSchema),
//   campaignReportController.downloadpayslip
// );
router
  .route("/campaigns/:campaignId/fetchCampaignPublished")
  .get(
    auth(),
    checkPermission("view_campaign_published"),
    validate(fetchCampaignReportValidation.fetchCampaignReportSchema),
    campaignReportController.fetchPublishedCampaign
  );

router
  .route("/campaigns/fetchCampaignPublished")
  .get(
    auth(),
    checkPermission("view_campaign_published"),
    validate(fetchCampaignReportValidation.fetchCampaignReportSchema),
    campaignReportController.fetchPublishedCampaign
  );

router.route("/campaigns/summary-report").get(
  auth(),
  // checkPermission("view_campaign_payment"),
  validate(fetchCampaignReportValidation.fetchCampaignReportSchema),
  campaignReportController.fetchCampaignSummaryReport
);

router.route("/campaigns/participant-summary-report").get(
  auth(),
  // checkPermission("view_campaign_payment"),
  // validate(fetchCampaignReportValidation.fetchCampaignReportSchema),
  campaignReportController.fetchCampaignparticipantsSummary
);

router.route("/campaigns/participant-summary-report/payslip/:id").get(
  // auth(),
  // checkPermission("view_campaign_payment"),
  // validate(fetchCampaignReportValidation.fetchCampaignReportSchema),
  campaignReportController.downloadpayslip
);

router
  .route("/campaigns/paid")
  .get(
    auth(),
    checkPermission("view_campaign_payment"),
    campaignReportController.fetchPaidCampaigns
  );

export default router;
