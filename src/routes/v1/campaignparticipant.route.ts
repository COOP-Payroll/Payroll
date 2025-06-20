import express from "express";
// import { registerCampaignParticipant } from "../../controllers/campaignparticipant.controller";
import { upload } from "../../config/multer";
import campaignParticipantController from "../../controllers/campaingparticipant.controller";
import auth from "../../middlewares/auth";
import { validateParticipants } from "../../validations/campaignparticipantvalidation";
import parseAndValidateExcel from "../../middlewares/parseAndValidateExcel";
import validate from "../../middlewares/validate";

import campaignparticipantValidation from "../../validations/campaignparticipantvalidation";
const router = express.Router();

router
  .route("/")
  .post(
    validate(campaignparticipantValidation.registerCampaignParticipantSchema),
    auth(),
    upload.array("documents"),
    campaignParticipantController.registerCampaignParticipant
  );

router.post(
  "/:id",
  auth(),
  upload.array("documents"),
  campaignParticipantController.updateCampaignParticipant
);

router.get(
  "/participants",
  campaignParticipantController.getParticipantsByCampaignId
);

router.get(
  "/published",
  campaignParticipantController.getAllPublishedCampaigns
);

router.get("/approved", campaignParticipantController.getAllApprovedCampaigns);

router.get(
  "/download-template",
  // auth(),
  campaignParticipantController.downloadParticipantTemplate
);

router.post(
  "/bulk/:id",
  upload.single("file"),
  auth(),
  campaignParticipantController.registerBulkCampaignParticipants
);



router.post(
  "/bulk/verify/:id",
  upload.single("file"),
  auth(),
  campaignParticipantController.registerBulkCampaignParticipantswithVerification
);
router.post(
  "/verify-status/:id",
  auth(),
  validate(campaignparticipantValidation.updateAccountVerificationSchema),
  campaignParticipantController.updateAccountVerification
);

router.get(
  "/unassigned",
  auth(),
  campaignParticipantController.getUnassignedParticipants
);

router.post(
  "/delete/:id",
  auth(),
  campaignParticipantController.softDeleteCampaignParticipant
);

export default router;
